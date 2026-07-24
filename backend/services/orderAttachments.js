const {
    MAX_STORAGE_KEY_LENGTH,
    normalizeExtension,
    validateStorageKey
} = require("./orderAttachmentStorage");

const REQUEST_TYPES = Object.freeze(["order", "file_request"]);
const ALLOWED_ATTACHMENT_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "png", "xls", "xlsx", "csv"]);
const MAX_ATTACHMENT_SIZE_BYTES = 15 * 1024 * 1024;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const MIME_TYPE_PATTERN = /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/;

function positiveInteger(value, fieldName) {
    const number = Number(value);
    if (!Number.isSafeInteger(number) || number <= 0) throw new TypeError(`${fieldName} must be a positive integer.`);
    return number;
}

function normalizeRequestType(value = "order") {
    const requestType = String(value || "").trim();
    if (!REQUEST_TYPES.includes(requestType)) throw new TypeError("Unsupported order request_type.");
    return requestType;
}

function normalizeOriginalName(value) {
    const name = String(value || "").trim();
    if (!name || name.length > 255 || /[\0-\x1f\x7f]/.test(name)) throw new TypeError("original_name is invalid.");
    return name;
}

function normalizeMimeType(value) {
    const mimeType = String(value || "").trim().toLowerCase();
    if (mimeType.length > 127 || !MIME_TYPE_PATTERN.test(mimeType)) throw new TypeError("mime_type is invalid.");
    return mimeType;
}

function normalizeSizeBytes(value) {
    const size = Number(value);
    if (!Number.isSafeInteger(size) || size < 0 || size > MAX_ATTACHMENT_SIZE_BYTES) {
        throw new TypeError(`size_bytes must be an integer between 0 and ${MAX_ATTACHMENT_SIZE_BYTES}.`);
    }
    return size;
}

function normalizeSha256(value) {
    const sha256 = String(value || "").trim();
    if (!SHA256_PATTERN.test(sha256)) throw new TypeError("sha256 must be 64 lowercase hexadecimal characters.");
    return sha256;
}

function normalizeCreatedAt(value) {
    if (value === undefined || value === null || value === "") return new Date().toISOString();
    const createdAt = String(value).trim();
    if (createdAt.length > 64 || Number.isNaN(Date.parse(createdAt))) throw new TypeError("created_at must be a valid timestamp.");
    return createdAt;
}

function validateAttachmentMetadata(input) {
    const extension = normalizeExtension(input?.extension);
    if (!ALLOWED_ATTACHMENT_EXTENSIONS.has(extension)) throw new TypeError("Unsupported attachment extension.");
    const storageKey = validateStorageKey(input?.storageKey ?? input?.storage_key);
    if (storageKey.length > MAX_STORAGE_KEY_LENGTH) throw new TypeError("storage_key is too long.");
    return {
        orderId: positiveInteger(input?.orderId ?? input?.order_id, "order_id"),
        originalName: normalizeOriginalName(input?.originalName ?? input?.original_name),
        storageKey,
        mimeType: normalizeMimeType(input?.mimeType ?? input?.mime_type),
        extension,
        sizeBytes: normalizeSizeBytes(input?.sizeBytes ?? input?.size_bytes),
        sha256: normalizeSha256(input?.sha256),
        createdAt: normalizeCreatedAt(input?.createdAt ?? input?.created_at)
    };
}

function mapAttachment(row) {
    if (!row) return null;
    return {
        id: row.id,
        orderId: row.order_id,
        originalName: row.original_name,
        storageKey: row.storage_key,
        mimeType: row.mime_type,
        extension: row.extension,
        sizeBytes: row.size_bytes,
        sha256: row.sha256,
        createdAt: row.created_at
    };
}

function createOrderAttachmentRepository(executor) {
    if (!executor || typeof executor.run !== "function" || typeof executor.get !== "function" || typeof executor.all !== "function") {
        throw new TypeError("A database executor with run/get/all is required.");
    }
    async function findOrderAttachmentById(orderId, attachmentId) {
        const row = await executor.get(
            `SELECT id, order_id, original_name, storage_key, mime_type, extension, size_bytes, sha256, created_at
             FROM order_attachments WHERE order_id = ? AND id = ?`,
            [positiveInteger(orderId, "order_id"), positiveInteger(attachmentId, "attachment_id")]
        );
        return mapAttachment(row);
    }
    return {
        async createOrderAttachmentMetadata(input) {
            const metadata = validateAttachmentMetadata(input);
            const result = await executor.run(
                `INSERT INTO order_attachments (
                    order_id, original_name, storage_key, mime_type, extension, size_bytes, sha256, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    metadata.orderId,
                    metadata.originalName,
                    metadata.storageKey,
                    metadata.mimeType,
                    metadata.extension,
                    metadata.sizeBytes,
                    metadata.sha256,
                    metadata.createdAt
                ]
            );
            return findOrderAttachmentById(metadata.orderId, result.id);
        },
        async listOrderAttachments(orderId) {
            const safeOrderId = positiveInteger(orderId, "order_id");
            const rows = await executor.all(
                `SELECT id, order_id, original_name, storage_key, mime_type, extension, size_bytes, sha256, created_at
                 FROM order_attachments WHERE order_id = ? ORDER BY created_at ASC, id ASC`,
                [safeOrderId]
            );
            return rows.map(mapAttachment);
        },
        findOrderAttachmentById,
        async deleteOrderAttachmentMetadata(orderId, attachmentId) {
            const result = await executor.run(
                "DELETE FROM order_attachments WHERE order_id = ? AND id = ?",
                [positiveInteger(orderId, "order_id"), positiveInteger(attachmentId, "attachment_id")]
            );
            return result.changes > 0;
        }
    };
}

function defaultRepository() {
    return createOrderAttachmentRepository(require("../database"));
}

async function createOrderAttachmentMetadata(input) {
    return defaultRepository().createOrderAttachmentMetadata(input);
}

async function listOrderAttachments(orderId) {
    return defaultRepository().listOrderAttachments(orderId);
}

async function findOrderAttachmentById(orderId, attachmentId) {
    return defaultRepository().findOrderAttachmentById(orderId, attachmentId);
}

async function deleteOrderAttachmentMetadata(orderId, attachmentId) {
    return defaultRepository().deleteOrderAttachmentMetadata(orderId, attachmentId);
}

module.exports = {
    REQUEST_TYPES,
    ALLOWED_ATTACHMENT_EXTENSIONS,
    MAX_ATTACHMENT_SIZE_BYTES,
    normalizeRequestType,
    validateAttachmentMetadata,
    createOrderAttachmentRepository,
    createOrderAttachmentMetadata,
    listOrderAttachments,
    findOrderAttachmentById,
    deleteOrderAttachmentMetadata
};
