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

let branch       = process.env.APPVEYOR_REPO_BRANCH;
let buildNumber  = process.env.APPVEYOR_BUILD_NUMBER;
let buildVersion = process.env.APPVEYOR_BUILD_VERSION;

console.log("branch: " + branch);
console.log("buildNumber: " + buildNumber);
console.log("buildVersion: " + buildVersion);

windowsUpload().then().catch(err => {
    console.log(err);
});
