const crypto = require("crypto");
const path = require("path");
const { pipeline } = require("stream/promises");
const { Transform } = require("stream");
const { TextDecoder } = require("util");
const Busboy = require("busboy");
const yauzl = require("yauzl");
const {
    ALLOWED_ATTACHMENT_EXTENSIONS,
    MAX_ATTACHMENT_SIZE_BYTES
} = require("./orderAttachments");

const MAX_FILE_COUNT = 5;
const MAX_TOTAL_FILE_BYTES = 50 * 1024 * 1024;
const MAX_FIELD_COUNT = 8;
const MAX_FIELD_BYTES = 64 * 1024;
const MAX_PART_COUNT = MAX_FIELD_COUNT + MAX_FILE_COUNT;
const MAX_XLSX_ENTRIES = 1000;
const MAX_XLSX_UNCOMPRESSED_BYTES = 100 * 1024 * 1024;
const MAX_XLSX_ENTRY_BYTES = 50 * 1024 * 1024;
const MAX_XLSX_COMPRESSION_RATIO = 100;
const EXPECTED_FIELDS = new Set([
    "customerName", "phone", "email", "comment", "paymentMethod", "includeCart", "items", "consent"
]);
const MIME_ALLOWLIST = Object.freeze({
    pdf: ["application/pdf"],
    jpg: ["image/jpeg", "image/pjpeg"],
    jpeg: ["image/jpeg", "image/pjpeg"],
    png: ["image/png"],
    xls: [
        "application/vnd.ms-excel",
        "application/msexcel",
        "application/x-msexcel",
        "application/xls",
        "application/x-xls",
        "application/octet-stream"
    ],
    xlsx: [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/zip",
        "application/octet-stream"
    ],
    csv: ["text/csv", "text/plain", "application/csv", "application/vnd.ms-excel"]
});
const NORMALIZED_MIME = Object.freeze({
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    csv: "text/csv"
});

class FileRequestUploadError extends Error {
    constructor(status, code, message) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

function uploadError(status, code, message) {
    return new FileRequestUploadError(status, code, message);
}

function sanitizeOriginalName(value) {
    const raw = String(value || "").replace(/\\/g, "/");
    if (raw.includes("\0")) throw uploadError(400, "INVALID_FILE_NAME", "Имя файла некорректно.");
    const baseName = path.posix.basename(raw)
        .replace(/[\u0001-\u001f\u007f]/g, "")
        .trim();
    if (!baseName) throw uploadError(400, "INVALID_FILE_NAME", "Имя файла некорректно.");
    if (baseName.length > 255) throw uploadError(400, "FILE_NAME_TOO_LONG", "Имя файла слишком длинное.");
    return baseName;
}

function extensionFromName(fileName) {
    const extension = path.extname(fileName).slice(1).toLowerCase();
    if (!ALLOWED_ATTACHMENT_EXTENSIONS.has(extension)) {
        throw uploadError(415, "UNSUPPORTED_FILE_FORMAT", "Формат файла не поддерживается.");
    }
    return extension;
}

async function cleanupStorageKeys(storage, storageKeys, logger, requestId) {
    const failures = [];
    for (const storageKey of new Set(storageKeys.filter(Boolean))) {
        try {
            await storage.deleteFile(storageKey);
        } catch (error) {
            failures.push({ storageKey, error });
            logger?.error?.("file_request_cleanup_failure", error, { requestId });
        }
    }
    return failures;
}

function parseFileRequestMultipart(req, { storage, logger } = {}) {
    if (!storage) return Promise.reject(new TypeError("Attachment storage service is required."));
    const contentType = String(req.headers["content-type"] || "");
    if (!/^multipart\/form-data\s*;/i.test(contentType) || !/\bboundary=/i.test(contentType)) {
        return Promise.reject(uploadError(415, "MULTIPART_REQUIRED", "Ожидается multipart/form-data."));
    }

    let parser;
    try {
        parser = Busboy({
            headers: req.headers,
            limits: {
                files: MAX_FILE_COUNT,
                fileSize: MAX_ATTACHMENT_SIZE_BYTES,
                fields: MAX_FIELD_COUNT,
                fieldSize: MAX_FIELD_BYTES,
                parts: MAX_PART_COUNT
            }
        });
    } catch {
        return Promise.reject(uploadError(400, "INVALID_MULTIPART", "Повреждённый multipart-запрос."));
    }

    const fields = Object.create(null);
    const files = [];
    const temporaryKeys = [];
    const fileTasks = [];
    let totalFileBytes = 0;
    let failure = null;
    let settled = false;

    function fail(error) {
        if (!failure) failure = error;
    }

    parser.on("field", (name, value, info) => {
        if (!EXPECTED_FIELDS.has(name)) {
            fail(uploadError(400, "UNEXPECTED_FIELD", `Неожиданное поле: ${name}.`));
            return;
        }
        if (Object.prototype.hasOwnProperty.call(fields, name)) {
            fail(uploadError(400, "DUPLICATE_FIELD", `Поле ${name} не должно повторяться.`));
            return;
        }
        if (info.valueTruncated) {
            fail(uploadError(413, "FIELD_TOO_LARGE", `Поле ${name} слишком большое.`));
            return;
        }
        fields[name] = value;
    });

    parser.on("file", (fieldName, file, info) => {
        file.on("error", error => {
            fail(uploadError(400, "INVALID_MULTIPART", "Повреждённый multipart-запрос."));
            logger?.warn?.("file_request_file_stream_error", { requestId: req.requestId, error: error.message });
        });
        const task = (async () => {
            if (fieldName !== "files") {
                fail(uploadError(400, "UNEXPECTED_FILE_FIELD", `Неожиданное файловое поле: ${fieldName}.`));
                file.resume();
                return;
            }

            let originalName;
            let extension;
            try {
                originalName = sanitizeOriginalName(info.filename);
                extension = extensionFromName(originalName);
            } catch (error) {
                fail(error);
                file.resume();
                return;
            }

            const { storageKey: temporaryKey, stream } = await storage.createTemporaryWriteStream();
            temporaryKeys.push(temporaryKey);
            let sizeBytes = 0;
            let fileLimitReached = false;
            const hash = crypto.createHash("sha256");
            file.once("limit", () => {
                fileLimitReached = true;
                fail(uploadError(413, "FILE_TOO_LARGE", "Файл превышает допустимый размер 15 МБ."));
            });
            const meter = new Transform({
                transform(chunk, encoding, callback) {
                    sizeBytes += chunk.length;
                    totalFileBytes += chunk.length;
                    if (totalFileBytes > MAX_TOTAL_FILE_BYTES) {
                        fail(uploadError(413, "TOTAL_FILES_TOO_LARGE", "Общий размер файлов превышает 50 МБ."));
                    }
                    if (!failure) {
                        hash.update(chunk);
                        callback(null, chunk);
                    } else {
                        callback();
                    }
                }
            });

            try {
                await pipeline(file, meter, stream);
            } catch (error) {
                fail(uploadError(500, "FILE_WRITE_FAILED", "Не удалось сохранить загруженный файл."));
                logger?.error?.("file_request_temp_write_failure", error, { requestId: req.requestId });
                return;
            }
            if (fileLimitReached) return;
            if (sizeBytes === 0) {
                fail(uploadError(400, "EMPTY_FILE", "Пустой файл загрузить нельзя."));
                return;
            }
            files.push({
                temporaryKey,
                originalName,
                extension,
                declaredMime: String(info.mimeType || "").trim().toLowerCase(),
                sizeBytes,
                sha256: hash.digest("hex")
            });
        })().catch(error => {
            fail(error instanceof FileRequestUploadError
                ? error
                : uploadError(500, "FILE_WRITE_FAILED", "Не удалось сохранить загруженный файл."));
            logger?.error?.("file_request_stream_failure", error, { requestId: req.requestId });
        });
        fileTasks.push(task);
    });

    parser.once("filesLimit", () => fail(uploadError(400, "TOO_MANY_FILES", "Можно загрузить не более 5 файлов.")));
    parser.once("fieldsLimit", () => fail(uploadError(400, "TOO_MANY_FIELDS", "Слишком много текстовых полей.")));
    parser.once("partsLimit", () => fail(uploadError(400, "TOO_MANY_PARTS", "Слишком много частей multipart-запроса.")));

    return new Promise((resolve, reject) => {
        async function finish(error) {
            if (settled) return;
            settled = true;
            if (error) fail(error);
            await Promise.allSettled(fileTasks);
            if (!failure && !files.length) fail(uploadError(400, "FILES_REQUIRED", "Добавьте хотя бы один файл."));
            if (failure) {
                await cleanupStorageKeys(storage, temporaryKeys, logger, req.requestId);
                reject(failure);
                return;
            }
            resolve({ fields, files, temporaryKeys });
        }

        parser.once("error", () => finish(uploadError(400, "INVALID_MULTIPART", "Повреждённый multipart-запрос.")));
        parser.once("close", () => finish());
        req.once("aborted", () => {
            const error = uploadError(400, "REQUEST_ABORTED", "Загрузка была прервана.");
            fail(error);
            parser.destroy(error);
        });
        req.once("error", error => {
            fail(uploadError(400, "UPLOAD_STREAM_ERROR", "Не удалось прочитать загруженные файлы."));
            parser.destroy(error);
        });
        req.pipe(parser);
    });
}

function validatePdf(buffer) {
    return buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-";
}

function validateJpeg(buffer) {
    return buffer.length >= 4
        && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
        && buffer[buffer.length - 2] === 0xff && buffer[buffer.length - 1] === 0xd9;
}

function validatePng(buffer) {
    return buffer.length >= 8
        && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
}

function validateXls(buffer) {
    return buffer.length >= 8
        && buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
}

function validateCsv(buffer) {
    let text;
    try {
        text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    } catch {
        return false;
    }
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    if (!text.trim() || text.includes("\0")) return false;
    const controls = [...text].filter(character => {
        const code = character.charCodeAt(0);
        return code < 32 && ![9, 10, 13].includes(code);
    }).length;
    return controls === 0;
}

function validateXlsx(buffer) {
    return new Promise((resolve, reject) => {
        yauzl.fromBuffer(buffer, { lazyEntries: true, decodeStrings: true, validateEntrySizes: true }, (error, zipFile) => {
            if (error) {
                reject(uploadError(400, "CORRUPT_FILE", "Файл повреждён или его формат не соответствует расширению."));
                return;
            }
            const required = new Set(["[Content_Types].xml", "xl/workbook.xml"]);
            let entryCount = 0;
            let totalUncompressed = 0;
            let finished = false;

            function rejectZip(code = "UNSAFE_XLSX") {
                if (finished) return;
                finished = true;
                zipFile.close();
                reject(uploadError(400, code, "Файл XLSX имеет небезопасную или повреждённую структуру."));
            }

            zipFile.on("entry", entry => {
                entryCount += 1;
                const name = String(entry.fileName || "").replace(/\\/g, "/");
                const compressed = Number(entry.compressedSize) || 0;
                const uncompressed = Number(entry.uncompressedSize) || 0;
                totalUncompressed += uncompressed;
                const ratio = uncompressed === 0 ? 1 : uncompressed / Math.max(1, compressed);
                if (entryCount > MAX_XLSX_ENTRIES
                    || uncompressed > MAX_XLSX_ENTRY_BYTES
                    || totalUncompressed > MAX_XLSX_UNCOMPRESSED_BYTES
                    || ratio > MAX_XLSX_COMPRESSION_RATIO
                    || (entry.generalPurposeBitFlag & 0x1)
                    || name.startsWith("/") || /^[A-Za-z]:/.test(name)
                    || name.split("/").some(part => part === "..")) {
                    rejectZip();
                    return;
                }
                required.delete(name);
                zipFile.readEntry();
            });
            zipFile.once("error", () => rejectZip("CORRUPT_FILE"));
            zipFile.once("end", () => {
                if (finished) return;
                finished = true;
                if (required.size) {
                    reject(uploadError(400, "CORRUPT_FILE", "Файл повреждён или его формат не соответствует расширению."));
                    return;
                }
                resolve(true);
            });
            zipFile.readEntry();
        });
    });
}

async function validateUploadedFile(file, storage) {
    const allowedMimes = MIME_ALLOWLIST[file.extension] || [];
    if (!allowedMimes.includes(file.declaredMime)) {
        throw uploadError(415, "MIME_MISMATCH", "Файл повреждён или его формат не соответствует расширению.");
    }
    const buffer = await storage.readFile(file.temporaryKey, { maxBytes: MAX_ATTACHMENT_SIZE_BYTES });
    let valid = false;
    if (file.extension === "pdf") valid = validatePdf(buffer);
    else if (file.extension === "jpg" || file.extension === "jpeg") valid = validateJpeg(buffer);
    else if (file.extension === "png") valid = validatePng(buffer);
    else if (file.extension === "xls") valid = validateXls(buffer);
    else if (file.extension === "xlsx") valid = await validateXlsx(buffer);
    else if (file.extension === "csv") valid = validateCsv(buffer);
    if (!valid) throw uploadError(400, "CORRUPT_FILE", "Файл повреждён или его формат не соответствует расширению.");
    return { ...file, mimeType: NORMALIZED_MIME[file.extension] };
}

async function validateUploadedFiles(files, storage) {
    const validated = [];
    for (const file of files) validated.push(await validateUploadedFile(file, storage));
    return validated;
}

module.exports = {
    FileRequestUploadError,
    MIME_ALLOWLIST,
    NORMALIZED_MIME,
    MAX_FILE_COUNT,
    MAX_TOTAL_FILE_BYTES,
    MAX_FIELD_COUNT,
    MAX_FIELD_BYTES,
    MAX_PART_COUNT,
    MAX_XLSX_ENTRIES,
    MAX_XLSX_UNCOMPRESSED_BYTES,
    MAX_XLSX_ENTRY_BYTES,
    MAX_XLSX_COMPRESSION_RATIO,
    sanitizeOriginalName,
    cleanupStorageKeys,
    parseFileRequestMultipart,
    validateUploadedFile,
    validateUploadedFiles
};
