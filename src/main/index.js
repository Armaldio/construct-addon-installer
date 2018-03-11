import {app, BrowserWindow, ipcMain, globalShortcut} from 'electron';
import isDev from 'electron-is-dev';
import {autoUpdater} from 'electron-updater';

// Consider to improve again https://github.com/wix/fast-boot

/*import Store from 'electron-store';*/
/*import pkg from '../../package';*/

/*const store = new Store();*/

/*import Raven from 'raven';

Raven.config('https://9ae8166a8a7941d0a254f211e1890b93:7e72d5dc78c64499abc369152585db10@sentry.io/297440').install();*/

let hrstart = process.hrtime();

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\');
}

let mainWindow;
const winURL = process.env.NODE_ENV === 'development'
               ? `http://localhost:9080`
               : `file://${__dirname}/index.html`;

function createWindow () {
    mainWindow = new BrowserWindow({
        height         : isDev ? 550 : 345,
        width          : 1000,
        minWidth       : 925,
        minHeight      : 210,
        icon           : __dirname + '/256x256.png',
        useContentSize : true,
        resizable      : false,
        frame          : false,
        backgroundColor: '#303030',
        show           : false,
    });

    mainWindow.loadURL(winURL);

    let hrend = process.hrtime(hrstart);
    console.info('Start show time (hr): %ds %dms', hrend[0], hrend[1] / 1000000);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    globalShortcut.register('CommandOrControl+Shift+I', () => {
        mainWindow.webContents.toggleDevTools();
    });

    //mainWindow.once('ready-to-show', () => {
    mainWindow.on('page-title-updated', () => {
        mainWindow.show();
    });

    mainWindow.once('show', () => {
        let hrend = process.hrtime(hrstart);
        console.info('Show window time (hr): %ds %dms', hrend[0], hrend[1] / 1000000);

        if (!app.isDefaultProtocolClient('addoninstaller') && !isDev) {
            let succesSet = app.setAsDefaultProtocolClient('addoninstaller');
            if (succesSet) {
                console.log('App registered successfully for addoninstaller:// protocol');
            }
        }

        checkForUpdates();
    });
}

app.on('ready', () => {
    let hrend = process.hrtime(hrstart);
    console.info('Ready time (hr): %ds %dms', hrend[0], hrend[1] / 1000000);

    if (process.env.TEST_ADDON === 'true')
        process.argv.push('addoninstaller://94/bounded-drag-drop');
    else if (process.env.TEST_UPDATER === 'true')
        process.argv.push('--update');

    let args    = process.argv;
    global.args = args;

    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

async function checkForUpdates () {

    let pkg                  = await import('../../package');

    global.autoUpdater = autoUpdater;

    global.autoUpdater.autoDownload = false;

    if (isDev) {
        global.autoUpdater.updateConfigPath = __dirname + '/dev-app-update.yml';
        //noinspection JSUnresolvedVariable
        global.autoUpdater.currentVersion   = pkg.version;
    }
}