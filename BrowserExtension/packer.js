const archiver = require('archiver');
const fs       = require('fs');
const path     = require('path');

let archive = archiver('zip', {});

let fileName = path.join('build', 'extension.zip');
console.log('path: ' + fileName);
let fileOutput = fs.createWriteStream(fileName);

fileOutput.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('Extension packaged successfully');
});

archive.pipe(fileOutput);
archive.glob('**/*', {
    cwd: 'BrowserExtension/src',
}); //some glob pattern here
archive.on('error', function (err) {
    throw err;
});
archive.finalize();