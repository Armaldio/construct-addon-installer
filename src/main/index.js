import {app, BrowserWindow, ipcMain, globalShortcut} from 'electron';
import isDev from 'electron-is-dev';

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
                /*notifier.notify({
                    title  : 'C2 Addon Installer',
                    message: 'The app has be defined to handle plugin links in the browser successfully!',
                    icon   : __dirname + '/256x256.png',
                });*/
            }
        }

        checkForUpdates();
    });
}

app.on('ready', () => {
    let hrend = process.hrtime(hrstart);
    console.info('Ready time (hr): %ds %dms', hrend[0], hrend[1] / 1000000);

    if (process.env.TEST_ADDON === 'true')
        process.argv.push('addoninstaller://87/ground-follow');
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

    let pkg         = await import('../../package');
    let autoUpdater = await import ('electron-updater');

    autoUpdater.autoUpdater.autoDownload = false;

    if (isDev) {
        autoUpdater.updateConfigPath = __dirname + '/dev-app-update.yml';
        //noinspection JSUnresolvedVariable
        autoUpdater.currentVersion   = pkg.version;
    }

    ipcMain.on('page-ready', (event, arg) => {
        autoUpdater.checkForUpdates();

        ipcMain.on('download', (event, arg) => {
            autoUpdater.downloadUpdate();
        });

        ipcMain.on('install', (event, arg) => {
            if (!isDev)
                autoUpdater.quitAndInstall(false, true);
            else
                console.log('Cannot update as dev');
        });

        autoUpdater.on('update-downloaded', (file) => {
            event.sender.send('update', 'update-downloaded');
        });

        autoUpdater.on('update-available', (currentUpdate) => {
            event.sender.send('update', 'update-available');
        });

        autoUpdater.on('download-progress', (progress) => {
            event.sender.send('progress', progress);
        });

        autoUpdater.on('checking-for-update', () => {
            event.sender.send('update', 'checking-for-update');
        });

        autoUpdater.on('update-not-available', () => {
            event.sender.send('update', 'update-not-available');
        });

        autoUpdater.on('error', () => {
            event.sender.send('update', 'error');
        });
    });
}