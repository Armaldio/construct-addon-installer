import {app, BrowserWindow, ipcMain, globalShortcut} from 'electron';
import isDev from 'electron-is-dev';
import {autoUpdater} from 'electron-updater';
import path from 'path';
import notifier from 'node-notifier';
import pkg from '../../package';
import Store from 'electron-store';

const store = new Store();

import Raven from 'raven';

Raven.config('https://9ae8166a8a7941d0a254f211e1890b93:7e72d5dc78c64499abc369152585db10@sentry.io/297440').install();

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

function createWindow (options = false) {
    console.log('show options ?', options);
    mainWindow = new BrowserWindow({
        height         : isDev ? 550 : 345,
        width          : 1000,
        minWidth       : 925,
        minHeight      : 210,
        icon           : '256x256.png',
        useContentSize : true,
        resizable      : options,
        frame          : false,
        backgroundColor: '#212121',
        show           : false,
    });

    mainWindow.loadURL(winURL);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    globalShortcut.register('CommandOrControl+Shift+I', () => {
        mainWindow.webContents.toggleDevTools();
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();

    });
}

app.on('ready', () => {
    if (!app.isDefaultProtocolClient('addoninstaller') && !isDev) {
        let succesSet = app.setAsDefaultProtocolClient('addoninstaller');
        if (succesSet) {
            console.log('App registered successfully for addoninstaller:// protocol');
            notifier.notify({
                title  : 'C2 Addon Installer',
                message: 'The app has be defined to handle plugin links in the browser successfully!',
                icon   : ''
            });
        }
    }
    let showOptions = true;
    if (process.env.TEST_ADDON === 'true')
        showOptions = false;

    if (!showOptions) {
        process.argv.push('addoninstaller://83/greenworks');
    } else
        checkForUpdates();

    let args    = process.argv;
    global.args = args;

    console.log('Test addon ' + process.env.TEST_ADDON);

    for (let i = 0; i < args.length; i++) {
        const argument = args[i];
        if (argument.startsWith('addoninstaller://')) {
            notifier.notify({
                title  : 'C2 Addon Installer',
                message: 'Analysing plugin...',
                icon   : ''
            });
        }
    }
    createWindow(showOptions);
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

function checkForUpdates () {
    //autoUpdater.autoDownload = false;

    if (isDev) {
        autoUpdater.updateConfigPath = path.join(__dirname, 'dev-app-update.yml');
        autoUpdater.currentVersion   = pkg.version;
    }

    ipcMain.on('page-ready', (event, arg) => {
        console.log(arg);
        console.log('Received page ready');

        autoUpdater.checkForUpdates();

        autoUpdater.on('update-downloaded', (file) => {
            event.sender.send('update', 'update-downloaded');

            //file.exePath = autoUpdater.downloadedUpdateHelper.setupPath;

            //store.set('last-update-downloaded', file);

            ipcMain.on('download', (event, arg) => {
                if (!isDev) {
                    autoUpdater.quitAndInstall();
                } else {
                    console.log('Unable to update on dev');
                }
            });
        });

        autoUpdater.on('update-available', (currentUpdate) => {
            //let lastUpdate = store.get('last-update-downloaded');

            //console.log(lastUpdate);
            //if (lastUpdate.version !== currentUpdate.version)
            event.sender.send('update', 'update-available');
            //else {
            //    console.log("Update already downloaded at " + lastUpdate.exePath);
            //    autoUpdater.downloadedUpdateHelper.setupPath = lastUpdate.exePath;
            //    event.sender.send('update', 'update-downloaded');
            //}

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