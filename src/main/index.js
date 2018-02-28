import {app, BrowserWindow} from 'electron';

import isDev from 'electron-is-dev';

import notifier from 'node-notifier';

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
        height         : isDev ? 550 : 400,
        width          : 1000,
        minWidth       : 645,
        minHeight      : 210,
        useContentSize : true,
        resizable      : options,
        frame          : false,
        backgroundColor: '#212121',
        show           : false,
        transparent    : true
    });

    mainWindow.loadURL(winURL);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        //mainWindow.webContents.toggleDevTools();
    });
}

app.on('ready', () => {
    if (!app.isDefaultProtocolClient('addoninstaller')) {
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

    if (!showOptions)
        process.argv.push('addoninstaller://27/simple-mouselock');
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

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

import {autoUpdater} from 'electron-updater';
import path  from 'path';

if (isDev) {
    autoUpdater.updateConfigPath = path.join(__dirname, 'dev-app-update.yml');
}

autoUpdater.on('update-downloaded', () => {
    //autoUpdater.quitAndInstall();
});

autoUpdater.on('update-available', () => {
    console.log("Update available");
});

autoUpdater.on('checking-for-update', () => {
    console.log("Checking for updates, please wait...");
});

autoUpdater.on('update-not-available', () => {
    console.log("No updates available");
});

autoUpdater.on('error', () => {
    console.log("There was an error checking the version");
});

app.on('ready', () => {
    /*if (process.env.NODE_ENV === 'production')*/ autoUpdater.checkForUpdates();
});
