const pkg = require('../package');
const fs  = require('fs');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function windowsUpload (branch, build) {
    let command = `${process.cwd()}/ext-bin/butler.exe push "build/${pkg.build.productName} Setup ${pkg.version}${branch !== 'master' ? '.' + build : ''}.exe" armaldio/construct-addon-installer:${branch === 'master' ? 'windows-stable' : 'windows-nightly'} --userversion ${pkg.version}${branch !== 'master' ? '.' + build : ''}`;
    console.log(command);
    const {stdout, stderr} = await exec(command);
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
}

let branch       = process.env.APPVEYOR_REPO_BRANCH;
let buildNumber  = process.env.APPVEYOR_BUILD_NUMBER;
let buildVersion = process.env.APPVEYOR_BUILD_VERSION;

console.log('branch: ' + branch);
console.log('buildNumber: ' + buildNumber);
console.log('buildVersion: ' + buildVersion);

if (branch === 'develop' || branch === 'master') {
    windowsUpload(branch, buildNumber).then().catch(err => {
        console.log(err);
    });
}