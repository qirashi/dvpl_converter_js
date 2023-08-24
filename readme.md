# About DVPL CONVERTER JS

`.dvpl` this is a file format that was first seen in the `World of Tanks Blitz` client for the Chinese server, and now it is used on all known clients, with the exception of files that are contained in `Android APK` or in the `Microsoft Store` client.

This converter is designed for direct conversion of files to .dvpl and back. The conversion takes place recursively. You need to be careful to use it only in the folder.


## Set up environment for converter -

- For Windows, install Node.js for your environment (https://nodejs.org/en/), download the Recommended version,
  For Linux, You can install Node.js by simple Terminal Command, type 'sudo apt install nodejs npm' for Debian Based OS or 'sudo pacman -S nodejs npm' for Arch Based OS,
- Setup environment for Node-gyp (https://github.com/nodejs/node-gyp) scroll down to "Installation"
    - Requirements Windows [ Visual Studio 2019 Community With C++ Workload or Visual Studio Build Tools With C++ Workload ], Linux [ C++ Build Tools ].
    - for Windows/Linux you should only need to do a simple command `npm install -g node-gyp` (might not be needed to install separately as gyp comes bundled with npm now),
    - read the readme in that repo for what you'll need, and install them before proceeding.
- Git Clone this repo / Download this entire repo to your device.
- Enter the directory where package.json sits with command line, and install with the following commands **IN ORDER**:
    - `npm install` and then `npm install -g` as administrator privilages. ( Windows ) ///
    - `npm install` and then `npm install -g` if you are not root add "sudo" at the beginning of the command. ( Linux ) ///
- Now you can execute this CLI converter anywhere with `dvpl` in commandline with the following flags `compress` / `decompress` or `c` / `d` for more info use the flag `help` ///

### Example of Usage -
```
CMD C:\[NAME]> dvpl decompress
File C:\[NAME]/[NAME]/[NAME].yaml.dvpl has been successfully decompressed into [NAME].yaml
File C:\[NAME]/[NAME]/[NAME].yaml.dvpl has been successfully decompressed into [NAME].yaml
File C:\[NAME]/[NAME]/[NAME].xml.dvpl has been successfully decompressed into [NAME].xml
.
.
.
.
DECOMPRESSION FINISHED. DECOMPRESSED 3 files.
```

## DVPL Code Specifications -

- Starts with stream of Byte data, can be compressed or uncompressed.
- The last 20 bytes in DVPL files are in the following format:
    - UINT32LE input size in Byte
    - UINT32LE compressed block size in Byte
    - UINT32LE compressed block crc32
    - UINT32LE compression Type
        - 0: no compression (format used in all uncompressed `.dvpl` files from SmartDLC)
        - 1: LZ4 (not observed but handled by this decompressor)
        - 2: LZ4_HC (format used in all compressed `.dvpl` files from SmartDLC)
        - 3: RFC1951 (not implemented in this decompressor since it's not observed)    
    - 32-bit Magic Number represents "DVPL" literals in utf8 encoding, encoded in big-Endian.        

## Libraries Used -

- `lz4` is a port of the LZ4 compression algorithm (https://github.com/pierrec/node-lz4)
- `crc32` for crc32 calculation included in footer for DVPL.

## Build to an executable file using PKG -

- The assembly can be done using the `pkg` module.

- pkg -t node18-win-x64 dvpl.js

```
  pkg [options] <input>

  Options:

    -h, --help           output usage information
    -v, --version        output pkg version
    -t, --targets        comma-separated list of targets (see examples)
    -c, --config         package.json or any json file with top-level config
    --options            bake v8 options into executable to run with them on
    -o, --output         output file name or template for several files
    --out-path           path to save output one or more executables
    -d, --debug          show more information during packaging process [off]
    -b, --build          don't download prebuilt base binaries, build them
    --public             speed up and disclose the sources of top-level project
    --public-packages    force specified packages to be considered public
    --no-bytecode        skip bytecode generation and include source files as plain js
    --no-native-build    skip native addons build
    --no-dict            comma-separated list of packages names to ignore dictionaries. Use --no-dict * to disable all dictionaries
    -C, --compress       [default=None] compression algorithm = Brotli or GZip

  Examples:

  – Makes executables for Linux, macOS and Windows
    $ pkg index.js
  – Takes package.json from cwd and follows 'bin' entry
    $ pkg .
  – Makes executable for particular target machine
    $ pkg -t node14-win-arm64 index.js
  – Makes executables for target machines of your choice
    $ pkg -t node12-linux,node14-linux,node14-win index.js
  – Bakes '--expose-gc' and '--max-heap-size=34' into executable
    $ pkg --options "expose-gc,max-heap-size=34" index.js
  – Consider packageA and packageB to be public
    $ pkg --public-packages "packageA,packageB" index.js
  – Consider all packages to be public
    $ pkg --public-packages "*" index.js
  – Bakes '--expose-gc' into executable
    $ pkg --options expose-gc index.js
  – reduce size of the data packed inside the executable with GZip
    $ pkg --compress GZip index.js
```