#!/usr/bin/env node

console.log(`#    DVPL Converter 2.0 for Windows `);
console.log(`#    Modified for the ForBlitz Team and Mod Creators! `);
console.log(`#    RifsXD -  Fuck you motherfucker =) `);
console.log(` `);

const fs = require('fs').promises;
const dvpl = require('./dvpl_logic.js');
const path = require('path');

const realArgs = process.argv.slice(2);
if (realArgs.length === 0) {
    throw '#    No mode selected. Try dvpl --help for guidance.';
}

let keepOriginals = false;
let convertFiles = false;

const optionalArgs = realArgs.slice(1);
optionalArgs.forEach(arg => {
    if (arg.toLowerCase() === '-ko') {
        keepOriginals = true;
    }
    if (arg.toLowerCase() === '-f') {
        convertFiles = true;
    }
});

if (convertFiles) {
    const filesAndFolders = realArgs.filter(arg => !arg.startsWith('-'));

    if (filesAndFolders.length === 0) {
        console.error('No files or folders specified for processing.');
        process.exit(1);
    }

    main(filesAndFolders, keepOriginals);
} else {
    switch (realArgs[0].toLowerCase()) {
        case '-compress':
        case '-c':
        case '-с':
            // compress
            console.error('Compression is not supported for directories. Use -f to specify files for compression.');
            break;
        case '-decompress':
        case '-d':
        case '-в':
            // decompress
            console.error('Decompression is not supported for directories. Use -f to specify files for decompression.');
            break;
        case '-help':
        case '-h':
            console.log(`
#    dvpl [mode] [--keep-originals] [-f file1 file2 ...]
#      -compress       (c, с)  : Compresses files into dvpl.
#      -decompress     (d, в)  : Decompresses dvpl files into standard files.
#      -help           (h)     : Outputs an auxiliary message.
#      -ko                     : Saves the original file.
#      -f                      : Specify files for processing.
        `);
            break;
        default:
            console.error('Incorrect mode selected. Use -help for information.');
    }
}

async function main(filesAndFolders, keepOriginals) {
    try {
        for (const item of filesAndFolders) {
            const fullPath = path.resolve(item);
            const stat = await fs.stat(fullPath);

            if (stat.isFile()) {
                await processFile(fullPath, keepOriginals);
            } else if (stat.isDirectory()) {
                await dvplRecursion(fullPath, keepOriginals, realArgs[0].toLowerCase() === '-compress' || realArgs[0].toLowerCase() === '-c' || realArgs[0].toLowerCase() === '-с');
            } else {
                console.error(`Invalid operation for: ${fullPath}`);
            }
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

async function processFile(fullPath, keepOriginals) {
    try {
        if (realArgs[0].toLowerCase() === '-decompress' || realArgs[0].toLowerCase() === '-d' || realArgs[0].toLowerCase() === '-в') {
            if (path.extname(fullPath).toLowerCase() === '.dvpl') {
                const fileData = await fs.readFile(fullPath);
                const processedData = dvpl.decompressDVPL(fileData);
                const newFilePath = fullPath.slice(0, -5);

                await fs.writeFile(newFilePath, processedData);
                console.log(`File ${fullPath} successfully decompressed.`);
                if (!keepOriginals) {
                    await fs.unlink(fullPath);
                }
            } else {
                console.error(`Invalid operation for: ${fullPath}`);
            }
        } else if (realArgs[0].toLowerCase() === '-compress' || realArgs[0].toLowerCase() === '-c' || realArgs[0].toLowerCase() === '-с') {
            if (path.extname(fullPath).toLowerCase() !== '.dvpl') {
                const fileData = await fs.readFile(fullPath);
                const processedData = dvpl.compressDVPl(fileData);
                const newFilePath = fullPath + '.dvpl';

                await fs.writeFile(newFilePath, processedData);
                console.log(`File ${fullPath} successfully compressed.`);
                if (!keepOriginals) {
                    await fs.unlink(fullPath);
                }
            } else {
                console.error(`File is already in dvpl format: ${fullPath}`);
            }
        }
    } catch (error) {
        console.error(`Error in ${fullPath}: ${error.message}`);
    }
}

async function dvplRecursion(originalsDir, keepOriginals = false, compression = false) {
    try {
        const dirList = await fs.readdir(originalsDir, { withFileTypes: true });

        for (const dirItem of dirList) {
            if (dirItem.isDirectory()) {
                await dvplRecursion(path.join(originalsDir, dirItem.name), keepOriginals, compression);
            } else if (dirItem.isFile() && ((compression && !dirItem.name.endsWith('.dvpl')) || (!compression && dirItem.name.endsWith('.dvpl')))) {
                const fileData = await fs.readFile(path.join(originalsDir, dirItem.name));
                const processedBlock = compression ? dvpl.compressDVPl(fileData) : dvpl.decompressDVPL(fileData);
                const newName = compression ? dirItem.name + ".dvpl" : path.basename(dirItem.name, '.dvpl');

                await fs.writeFile(path.join(originalsDir, newName), processedBlock);
                console.log(`File ${path.join(originalsDir, dirItem.name)} successfully ${compression ? "compressed" : "decompressed"}.`);
                if (!keepOriginals) {
                    await fs.unlink(path.join(originalsDir, dirItem.name));
                }
            }
        }
    } catch (err) {
        console.log(`Error in ${originalsDir}: ${err}`);
    }
}