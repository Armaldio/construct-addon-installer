import fs from 'fs';
import xml2js from 'xml2js';
import JSZip from 'jszip';

export default {
    getAddonInfos (file) {
        return new JSZip.external.Promise((resolve, reject) => {
            fs.readFile(file, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        }).then((data) => {
            return JSZip.loadAsync(data);
        }).then((jszip) => {
            let content = '';
            Object.keys(jszip.files).forEach(async (filename) => {
                if (filename === 'info.xml') {
                    let content = await jszip.files[filename].async('string');
                    let xml     = await new Promise((resolve, reject) => {
                        xml2js.parseString(content, (err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        });
                    });
                    console.log(xml);
                    console.log(JSON.stringify(xml));
                    console.log(JSON.parse(JSON.stringify(xml)));
                }
            });
            return content;
        });
    }
};