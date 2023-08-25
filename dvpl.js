console.log(`#    DVPL Converter 2.0 for Windows `)
console.log(`#    Modified for the ForBlitz Team and Mod Creators! `)
console.log(`#    RifsXD -  Fuck you motherfucker =) `)
console.log(` `)

// Loads everything in
const fs = require('fs').promises
const dvpl = require('./dvpl_logic.js');
const path = require('path');

// Scrappy cli code
const realArgs = process.argv.slice(2);
if (realArgs.length === 0) {
    throw '#    No Mode selected. Try dvpl --help for advice.'
}

const optionalArgs = realArgs.slice(1);

let keeporingals = false;
let convertFiles = false; // FLAGS

optionalArgs.forEach(arg => {
    if (arg.toLowerCase() === '-ko') keeporingals = true;
    if (arg.toLowerCase() === '-f') convertFiles = true;
})

switch (realArgs[0].toLowerCase()) {
    case '-compress':
    case '-c':
    case '-с':
    case 'compress':
    case 'c':
    case 'с':
        // compress
        dvplRecursion(process.cwd(), keeporingals, true).then(number => {
			console.log(` `)
            console.log(`#    Compression is complete. Compressed: ${number} files.`)
        })
        break;
    case '-decompress':
    case '-d':
    case '-в':
    case 'decompress':
    case 'd':
    case 'в':
        dvplRecursion(process.cwd(), keeporingals, false).then(number => {
			console.log(` `)
            console.log(`#    Unpacking is complete. Unpacked: ${number} files.`)
        })
        // decompress
        break;
    case '--help':
    case '-help':
    case '-h':
    case 'help':
    case 'h':
        console.log(`
#    dvpl [mode] [--keep-originals]
#      -compress       (c, c)  : Compresses files into dvpl.
#      -decompress     (в, d)  : Decompresses dvpl files into standard files.
#      -help           (h)     : Outputs an auxiliary message.
#      -ko             (-ko)   : Saves the original file.
        `)
        break;
    default:
        console.error('Incorrect mode selected. Use -help for information.')
}

// main code that does all the heavy lifting
async function dvplRecursion(originalsDir, keepOrignals = false, compression = false) {
    const dirList = await fs.readdir(originalsDir + "/", { withFileTypes: true });
    return await (dirList.map(async (dirItem) => {
            const isDecompression = !compression && dirItem.isFile() && dirItem.name.endsWith('.dvpl')
            const isCompression = compression && dirItem.isFile() && !dirItem.name.endsWith('.dvpl')
            if (dirItem.isDirectory()) {
                return await dvplRecursion(originalsDir + "/" + dirItem.name, keepOrignals, compression)
            }
            else if (isDecompression || isCompression) {
                try {
                    const fileData = await fs.readFile(originalsDir + "/" + dirItem.name)
                    const processedBlock = isCompression ? dvpl.compressDVPl(fileData) : dvpl.decompressDVPL(fileData);
                    const newName = path.basename(dirItem.name, '.dvpl')
                    await fs.writeFile(originalsDir + "/" + (isCompression ? dirItem.name + ".dvpl" : newName), processedBlock)
                    console.log(`File ${originalsDir + "/" + dirItem.name} has been successfully ${isCompression ? "compressed" : "decompressed"} into ${originalsDir + "/" + isCompression ? newName : dirItem.name + ".dvpl"}`)
                    keepOrignals ? undefined : await fs.unlink(originalsDir + "/" + dirItem.name);
                    return 1
                } catch (err) {
                    console.log(`File ${originalsDir + "/" + dirItem.name} Failed to convert due to ${err}`)
                    return 0
                }
            } else {
                return 0
            }
        })).reduce(async (a, b) => await a + await b, Promise.resolve(0))
}