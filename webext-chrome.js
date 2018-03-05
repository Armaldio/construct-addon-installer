const config   = require('./extensionStores');
const webStore = require('chrome-webstore-upload')(config);
const fs       = require('fs');
const path     = require('path');

const myZipFile = fs.createReadStream(path.join(__dirname, 'build', 'extension.zip'));

upload();

async function upload () {
    let token   = await webStore.fetchToken();
    console.log(`Token: ${token}`);
    try {
        let res = await webStore.uploadExisting(myZipFile, token);
        console.log(`Res: ${res}`);
    } catch (e) {
        console.log(e);
    }
    //let publish = await webStore.publish('default', token);
}