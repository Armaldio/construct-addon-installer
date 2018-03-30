import lowdb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import isDev from 'electron-is-dev';
import path from 'path';
import {remote} from 'electron';

const DB = {
    install (Vue, options) {

        const dbPath  = path.join(remote.app.getPath('userData'), 'settings.json');
        const adapter = new FileSync(dbPath);
        console.log('Saving things to ' + dbPath);
        const db = lowdb(adapter);
        db.defaults({
            'settings': {
                'customfolder': {
                    'isDefault': false,
                    'path'     : ''
                }
            }
        }).write();

        Vue.prototype.$db = db;
    }
};

export default DB;