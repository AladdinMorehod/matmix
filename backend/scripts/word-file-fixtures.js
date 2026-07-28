const OLE_FREE_SECTOR = 0xffffffff;
const OLE_END_OF_CHAIN = 0xfffffffe;
const OLE_FAT_SECTOR = 0xfffffffd;

function writeDirectoryEntry(buffer, offset, name, type, startSector, size) {
    const encodedName = Buffer.from(`${name}\0`, "utf16le");
    encodedName.copy(buffer, offset);
    buffer.writeUInt16LE(encodedName.length, offset + 64);
    buffer[offset + 66] = type;
    buffer[offset + 67] = 1;
    buffer.writeUInt32LE(OLE_FREE_SECTOR, offset + 68);
    buffer.writeUInt32LE(OLE_FREE_SECTOR, offset + 72);
    buffer.writeUInt32LE(OLE_FREE_SECTOR, offset + 76);
    buffer.writeUInt32LE(startSector, offset + 116);
    buffer.writeUInt32LE(size, offset + 120);
}

function createDocFixture() {
    const sectorSize = 512;
    const buffer = Buffer.alloc(sectorSize * 4);
    Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]).copy(buffer);
    buffer.writeUInt16LE(0x003e, 0x18);
    buffer.writeUInt16LE(3, 0x1a);
    buffer.writeUInt16LE(0xfffe, 0x1c);
    buffer.writeUInt16LE(9, 0x1e);
    buffer.writeUInt16LE(6, 0x20);
    buffer.writeUInt32LE(1, 0x2c);
    buffer.writeUInt32LE(0, 0x30);
    buffer.writeUInt32LE(4096, 0x38);
    buffer.writeUInt32LE(OLE_END_OF_CHAIN, 0x3c);
    buffer.writeUInt32LE(OLE_END_OF_CHAIN, 0x44);
    for (let offset = 0x4c; offset < 0x200; offset += 4) buffer.writeUInt32LE(OLE_FREE_SECTOR, offset);
    buffer.writeUInt32LE(1, 0x4c);

    writeDirectoryEntry(buffer, sectorSize, "Root Entry", 5, OLE_END_OF_CHAIN, 0);
    writeDirectoryEntry(buffer, sectorSize + 128, "WordDocument", 2, 2, 4);

    const fatOffset = sectorSize * 2;
    for (let offset = fatOffset; offset < fatOffset + sectorSize; offset += 4) {
        buffer.writeUInt32LE(OLE_FREE_SECTOR, offset);
    }
    buffer.writeUInt32LE(OLE_END_OF_CHAIN, fatOffset);
    buffer.writeUInt32LE(OLE_FAT_SECTOR, fatOffset + 4);
    buffer.writeUInt32LE(OLE_END_OF_CHAIN, fatOffset + 8);
    buffer.writeUInt16LE(0xa5ec, sectorSize * 3);
    return buffer;
}

function crc32(buffer) {
    let crc = 0xffffffff;
    for (const byte of buffer) {
        crc ^= byte;
        for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
    return (crc ^ 0xffffffff) >>> 0;
}

function createStoredZip(entries) {
    const localParts = [];
    const centralParts = [];
    let localOffset = 0;
    for (const [name, content] of entries) {
        const nameBuffer = Buffer.from(name, "utf8");
        const contentBuffer = Buffer.from(content);
        const checksum = crc32(contentBuffer);
        const localHeader = Buffer.alloc(30);
        localHeader.writeUInt32LE(0x04034b50, 0);
        localHeader.writeUInt16LE(20, 4);
        localHeader.writeUInt32LE(checksum, 14);
        localHeader.writeUInt32LE(contentBuffer.length, 18);
        localHeader.writeUInt32LE(contentBuffer.length, 22);
        localHeader.writeUInt16LE(nameBuffer.length, 26);
        localParts.push(localHeader, nameBuffer, contentBuffer);

        const centralHeader = Buffer.alloc(46);
        centralHeader.writeUInt32LE(0x02014b50, 0);
        centralHeader.writeUInt16LE(20, 4);
        centralHeader.writeUInt16LE(20, 6);
        centralHeader.writeUInt32LE(checksum, 16);
        centralHeader.writeUInt32LE(contentBuffer.length, 20);
        centralHeader.writeUInt32LE(contentBuffer.length, 24);
        centralHeader.writeUInt16LE(nameBuffer.length, 28);
        centralHeader.writeUInt32LE(localOffset, 42);
        centralParts.push(centralHeader, nameBuffer);
        localOffset += localHeader.length + nameBuffer.length + contentBuffer.length;
    }
    const centralDirectory = Buffer.concat(centralParts);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(entries.length, 8);
    end.writeUInt16LE(entries.length, 10);
    end.writeUInt32LE(centralDirectory.length, 12);
    end.writeUInt32LE(localOffset, 16);
    return Buffer.concat([...localParts, centralDirectory, end]);
}

function createDocxFixture() {
    return createStoredZip([
        ["[Content_Types].xml", "<?xml version=\"1.0\"?><Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\"/>"],
        ["word/document.xml", "<?xml version=\"1.0\"?><w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\"><w:body/></w:document>"]
    ]);
}

module.exports = { createDocFixture, createDocxFixture };
