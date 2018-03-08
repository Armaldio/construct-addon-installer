const pkg = require('../package');
const fs  = require('fs');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function windowsUpload () {
    let command = `${process.cwd()}/ext-bin/butler.exe push "build/${pkg.build.productName} Setup ${pkg.version}.exe" armaldio/construct-addon-installer:windows --userversion ${pkg.version} `;
    console.log(command);
    const {stdout, stderr} = await exec(command);
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
}

windowsUpload().then().catch(err => {
    console.log(err);
});
