import fs from 'fs';
import xml2js from 'xml2js';
import JSZip from 'jszip';

export default {
    getAddonInfos (file) {
        return new Promise(resolve => {
            return new JSZip.external.Promise((zipresolve, zipreject) => {
                fs.readFile(file, (err, data) => {
                    if (err) {
                        zipreject(err);
                    } else {
                        zipresolve(data);
                    }
                });
            }).then((data) => {
                return JSZip.loadAsync(data);
            }).then((jszip) => {
                Object.keys(jszip.files).forEach(async (filename) => {
                    if (filename === 'info.xml') {
                        let content = await jszip.files[filename].async('string');
                        let xml     = await this.getAddonInfosFromXml(content);
                        resolve(xml);
                    }
                });
            });
        });
    },

    getAddonInfosFromXml: function (xml) {
        return new Promise((resolve, reject) => {
            xml2js.parseString(xml, (err, addon) => {
                if (err) reject(err);

                else {
                    addon = addon['c2addon'];
                    for (let key of Object.keys(addon)) {
                        addon[key] = addon[key].length === 1 ? addon[key][0] : addon[key];
                    }
                    resolve(addon);
                }
            });
        });
    }
};