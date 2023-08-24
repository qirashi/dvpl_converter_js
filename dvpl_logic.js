const lz4 = require("lz4");
const crc32 = require("crc");

function compressDVPL(buffer) {
    let output = Buffer.alloc(buffer.length);
    let compressedBlockSize = lz4.encodeBlockHC(buffer, output);

    let footerBuffer;
    if (compressedBlockSize === 0 || compressedBlockSize >= buffer.length) {
        footerBuffer = toDVPLFooter(buffer.length, buffer.length, crc32.crc32(buffer), 0);
        return Buffer.concat([buffer, footerBuffer], buffer.length + 20);
    } else {
        output = output.slice(0, compressedBlockSize);
        footerBuffer = toDVPLFooter(buffer.length, compressedBlockSize, crc32.crc32(output), 2);
        return Buffer.concat([output, footerBuffer], compressedBlockSize + 20);
    }
}

function decompressDVPL(buffer) {
    const footerData = readDVPLFooter(buffer);
    const targetBlock = buffer.slice(0, buffer.length - 20);

    if (targetBlock.length !== footerData.cSize) throw 'DVPLSizeMismatch';

    if (crc32.crc32(targetBlock) !== footerData.crc32) throw 'DVPLCRC32Mismatch';

    if (footerData.type === 0) {
        if (!(footerData.oSize === footerData.cSize && footerData.type === 0)) {
            throw 'DVPLTypeSizeMismatch';
        } else {
            return targetBlock;
        }
    } else if (footerData.type === 1 || footerData.type === 2) {

        let deDVPLBlock = Buffer.alloc(footerData.oSize);

        let DecompressedBlockSize = lz4.decodeBlock(targetBlock, deDVPLBlock);

        if (DecompressedBlockSize !== footerData.oSize) throw 'DVPLDecodeSizeMismatch';

        return deDVPLBlock;
    } else {
        throw "UNKNOWN DVPL FORMAT"
    }

}

function toDVPLFooter(inputSize, compressedSize, crc32, type) {
    let result = Buffer.alloc(20);
    result.writeUInt32LE(inputSize, 0);
    result.writeUInt32LE(compressedSize, 4);
    result.writeUInt32LE(crc32, 8);
    result.writeUInt32LE(type, 12);
    result.write("DVPL", 16, 4, 'utf8');
    return result;
}

function readDVPLFooter(buffer) {
    let footerBuffer = buffer.slice(buffer.length - 20, buffer.length);
    //check for valid footer data
    if (footerBuffer.toString('utf8', 16, 20) !== 'DVPL' || footerBuffer.length !== 20) throw 'InvalidDVPLFooter';

    let footerObject = {};
    footerObject.oSize = footerBuffer.readUInt32LE(0);
    footerObject.cSize = footerBuffer.readUInt32LE(4);
    footerObject.crc32 = footerBuffer.readUInt32LE(8);
    footerObject.type = footerBuffer.readUInt32LE(12);
    return footerObject;
}

exports.compressDVPl = compressDVPL;
exports.decompressDVPL = decompressDVPL;
exports.readDVPLFooter = readDVPLFooter;