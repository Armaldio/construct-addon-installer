<template>
    <div>
        <transition name="fade" mode="out-in">
            <div v-if="addon !== null || notSupportedEffect" class="plugin">
                <div v-if="notSupportedEffect">
                    <h1 class="notSupported">Effects are currently not supported!</h1>
                </div>
                <div v-else>

                    <div class="main container">
                        <img height="64" :src="icon" alt="icon">
                        <h1>
                            <i18n path="installer.mainQuestion" tag="b" for="tos">
                                <a target="_blank" @click="details = true">{{ addon.name }}</a>
                            </i18n>
                        </h1>

                        <p>{{addon.description}}</p>

                        <div class="okInstall" v-if="cleaned">
                            <v-icon color="green" x-large left>fas fa-check</v-icon>
                            {{ $t('installer.installedButton') }}
                        </div>
                    </div>

                    <div v-show="!cleaned && !extracting" class="buttons-bottom">
                        <v-btn color="green" @click="install">{{ $t('common.yes') }}</v-btn>
                        <v-btn color="red" @click="$electron.remote.app.quit()">{{ $t('common.no') }}</v-btn>
                    </div>
                    <div v-show="extracting" class="buttons-bottom">
                        <v-btn>
                            <v-icon dark>fas fa-sync-alt fa-spin</v-icon>
                        </v-btn>
                    </div>
                    <div v-show="cleaned" class="buttons-bottom">
                        <v-btn @click="$electron.remote.app.quit()">Close</v-btn>
                    </div>
                </div>

            </div>

            <loader v-else transition="fade" transition-mode="out-in"></loader>

        </transition>

        <!-- Addon replace -->
        <v-dialog v-model="showDialog" persistent max-width="600">
            <v-card>
                <v-card-title class="headline">{{ $t('installer.modal.askOverwrite') }}</v-card-title>
                <v-card-text>
                    <i18n path="installer.modal.alreadyInstalledAddonDescription" tag="div">
                        <b><u>({{ oldVersion }} → {{ newVersion }})</u></b>
                    </i18n>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" flat @click.native="showDialog = false">{{ $t('common.no') }}</v-btn>
                    <v-btn color="green darken-1" flat @click.native="extract">{{ $t('common.yes') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Addon Details -->
        <v-dialog v-model="details" fullscreen transition="dialog-bottom-transition" :overlay="true" scrollable>
            <v-card tile>
                <v-toolbar card dark color="primary">
                    <img height="32" :src="icon" alt="icon">
                    <v-toolbar-title v-if="addon">{{ addon.name }}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon @click.native="details = false" dark>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-card-text>
                    <v-data-table :items="addonToList" class="elevation-1" hide-actions hide-headers>
                        <template slot="items" slot-scope="props">
                            <td>{{ props.item.name | capitalize }}</td>
                            <td class="text-xs-right">{{ props.item.description }}</td>
                        </template>
                    </v-data-table>
                </v-card-text>

                <div style="flex: 1 1 auto;"/>
            </v-card>
        </v-dialog>

        <!-- Snackbar update notifier -->
        <v-snackbar absolute top color="info" multi-line :timeout="600000" v-model="updateAvailable">
            <v-icon left dark class="mr-2">fas fa-download</v-icon>
            <span> {{ $t('update.newUpdateAvailable') }}</span>
            <v-btn dark flat large @click.once="InstallUpdate">{{ $t('update.installNow') }}</v-btn>
            <v-btn dark flat large @click.once="updateAvailable = false">{{ $t('common.close') }}</v-btn>
        </v-snackbar>

        <span class="version">v{{ version }}</span>
        <span class="donate"><a @click="open('https://paypal.me/armaldio')"><img
                src="https://yourdonation.rocks/images/badge.svg"/></a></span>
    </div>
</template>

<script>
    import request from 'request';
    import progress from 'request-progress';
    import cheerio from 'cheerio';
    import path from 'path';
    import fs from 'fs';
    import JSZip from 'jszip';
    import mkdirp from 'mkdirp';
    import * as rq from 'request-promise';
    import loader from './Loader';
    import uuid from 'uuid/v4';
    import os from 'os';
    import opn from 'opn';
    import Raven from 'raven';
    import c2Utilities from './scripts/c2Utilities';
    import pkg from '../../../package';
    import ap from 'c2-addon-parser';

    Raven.config('https://9ae8166a8a7941d0a254f211e1890b93:7e72d5dc78c64499abc369152585db10@sentry.io/297440')
         .install();
    Raven.setContext({
        version: pkg.version
    });

    export default {
        name      : 'installer',
        components: {
            loader
        },
        filters   : {
            capitalize: function (value) {
                if (!value) return '';
                value = value.toString();
                return value.charAt(0).toUpperCase() + value.slice(1);
            }
        },
        computed  : {
            addonToList () {
                if (this.addon === null)
                    return [];
                let list = [];
                for (let i = 0; i < Object.keys(this.addon).length; i++) {
                    let key = Object.keys(this.addon)[i];

                    list.push({
                        name       : key,
                        description: this.addon[key],
                    });
                }
                list.push({
                    name       : 'Scirra page',
                    description: this.pluginUrl,
                });
                return list;
            }
        },
        data () {
            return {
                name        : '',
                description : '',
                addonLink   : '',
                pluginUrl   : '',
                pluginId    : '',
                c2addonsPath: '',
                $           : {},
                progress    : 0,
                link        : '',
                icon        : '',

                downloaded: false,
                installed : false,
                cleaned   : false,

                showDialog: false,
                extracting: false,

                yesBtnClicked: false,

                tmpFilePath  : {},
                jsZipInstance: {},

                endpoint      : 'https://www.construct.net',
                addonsEndpoint: 'construct-2/addons',

                updateAvailable: false,
                version        : pkg.version,

                addon  : null,
                details: false,

                oldVersion: 0,
                newVersion: 0,

                notSupportedEffect: false
            };
        },
        methods   : {
            open (url) {
                opn(url);
            },
            InstallUpdate () {
                this.$electron.ipcRenderer.removeAllListeners('update');
                this.$router.push('/updater');
            },
            async install () {
                let version = await this.checkInstalled(this.c2addonsPath);
                console.log('installed version:', version, 'addon version', this.addon.version);
                this.oldVersion = version;
                this.newVersion = this.addon.version;
                if (version === null)
                    this.extract();
                else
                    this.showDialog = true;
            },
            async checkInstalled () {
                return new Promise((resolve, reject) => {
                    new JSZip.external.Promise((zipresolve, zipreject) => {
                        fs.readFile(this.tmpFilePath, (err, data) => {
                            if (err) {
                                zipreject(err);
                            } else {
                                zipresolve(data);
                            }
                        });
                    }).then((data) => {
                        return JSZip.loadAsync(data);
                    }).then((jszip) => {
                        this.jsZipInstance = jszip;

                        let installedVersion = null;
                        Object.keys(this.jsZipInstance.files).forEach(async (filename) => {
                            let f = path.relative('files', filename);
                            if (f !== '' && f !== '..\\info.xml' && path.extname(f) === '') {
                                console.log('-> ' + f);
                                console.log('type', this.addon.type);

                                let expectedDestination = path.join(this.c2addonsPath, this.addon.type + 's', f);
                                console.log(`Expected dest: ${expectedDestination}`);
                                //todo get version
                                let ace = ap.export(expectedDestination, 'json');
                                console.log(ace);
                                installedVersion = ace.config.version;
                            }
                        });

                        console.log('Addon already exists:' + installedVersion);
                        resolve(installedVersion);
                    });

                });

                /*let files = fs.readdirSync(pathToSearch);
                for (let i = 0; i < files.length; i++) {
                    let file = files[i];
                    console.log("file:", file);
                    if (file === "config.xml")
                    {
                        let content = fs.readFileSync(path.join(pathToSearch, file));
                    }
                }*/
            },
            async extract () {
                console.log('Extracting');
                this.extracting = true;
                this.showDialog = false;
                for (let i = 0; i < Object.keys(this.jsZipInstance.files).length; i++) {
                    let filename = Object.keys(this.jsZipInstance.files)[i];

                    if (filename !== 'files/' && filename !== 'info.xml') {
                        let content = await this.jsZipInstance.files[filename].async('nodebuffer');
                        let f       = path.relative('files', filename);

                        let dest = path.join(this.c2addonsPath, this.addon.type + 's', f);

                        console.log(`Creating ${path.join(dest, '..')}`);
                        mkdirp.sync(path.join(dest, '..'), {});

                        if (path.extname(dest) === '') {
                            console.log(`Creating ${dest}`);
                            mkdirp.sync(dest, {});
                        }
                        else {
                            console.log(`Writing ${dest}`);
                            fs.writeFileSync(dest, content);
                        }
                    }
                }
                this.installed  = true;
                this.extracting = false;

                fs.unlinkSync(this.tmpFilePath);

                this.cleaned = true;
            },
            async download (link) {
                /**
                 * Download
                 */
                return new Promise((resolve, reject) => {

                    this.tmpFilePath = path.join(os.tmpdir(), `${uuid()}.zip`);
                    console.log('tmpFilePath', this.tmpFilePath);

                    console.log(`Downloading ${link}`);
                    progress(request({
                        method: 'GET',
                        url   : link
                    }, () => {

                    })).on('progress', (state) => {
                        this.percent = state.percent;
                        console.log('progress', state);
                    }).on('error', (err) => {
                        this.progress = 100;
                        console.log(err);
                    }).on('end', () => {
                        this.progress = 100;
                        console.log('File downloaded!');
                        this.downloaded = true;
                        // Do something after request finishes
                    }).pipe(fs.createWriteStream(this.tmpFilePath).on('close', async (file) => {
                        resolve(this.tmpFilePath);
                    }));
                });
            }
        },
        async mounted () {
            // Check for updates
            let autoUpdater = this.$electron.remote.getGlobal('autoUpdater');
            autoUpdater.checkForUpdates();
            autoUpdater.on('update-available', (currentUpdate) => {
                this.updateAvailable = true;
            });

            /**
             * Mount
             */
            this.args = this.$electron.remote.getGlobal('args');
            console.log('CLI args: ', this.args);
            for (let i = 0; i < this.args.length; i++) {
                const argument = this.args[i];
                if (argument.startsWith('addoninstaller://')) {
                    this.pluginId  = argument.replace('addoninstaller://', '');
                    this.pluginUrl = `${this.endpoint}/${this.addonsEndpoint}/${this.pluginId}`;
                }
            }

            const options = {
                method   : 'GET',
                url      : encodeURI(this.pluginUrl),
                transform: function (body) {
                    return cheerio.load(body);
                }
            };

            console.log('Loading page...');
            try {
                this.$ = await rq(options);

                console.log('Page loaded.');

                this.link = `${this.endpoint}/${this.$('div.col.infoCol > h2:nth-child(1)')
                                                    .next().next().attr('href')}`;
                this.icon = this.$('.addonTopInfo > h1 > span > img').data('src');

                this.c2addonsPath = path.join(this.$electron.remote.app.getPath('appData'), 'Construct2');
                console.log('c2addonsPath', this.c2addonsPath);

                let p      = await this.download(this.link);
                this.addon = await c2Utilities.getAddonInfos(p);

                if (this.addon.type === 'effect') {
                    this.addon              = null;
                    this.notSupportedEffect = true;
                }

                /*this.addon = {
                    'type'         : 'behavior',
                    'name'         : 'Ground Follow',
                    'version'      : '1.0',
                    'author'       : 'Mimiste',
                    'website'      : 'https://github.com/Mimiste/c2-groundfollow-behavior',
                    'documentation': '',
                    'description'  : 'A Construct 2 behavior to enhance the platform behavior and make the character follow the ground angle accurately.'
                };*/

                console.log(this.addon);
            } catch (err) {
                console.log(err);
                Raven.captureException(err);
            }
        }
    };
</script>

<style scoped>

    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s;
    }

    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
    {
        opacity: 0;
    }

    .okInstall {
        font-size: 40px;
    }

    .main {
        text-align: center;
        padding-top: 50px;
    }

    a {
        color: #2196F3;
    }

    .buttons-bottom {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        text-align: center;
    }

    .buttons-bottom button {
        margin: 15px 5px 15px 5px;
    }

    .version {
        position: absolute;
        bottom: 0;
        left: 3px;
    }

    .donate {
        position: absolute;
        bottom: 0;
        right: 6px;
    }

    .notSupported {
        text-align: center;
        margin-top: 50vh;
        transform: translateY(-50%);
        font-size: 25px;
        color: grey;
    }
</style>
