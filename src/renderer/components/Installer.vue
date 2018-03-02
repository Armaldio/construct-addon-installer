<template>
    <div>
        <transition name="fade" mode="out-in">
            <div v-if="name !== ''" class="plugin">
                <div class="main container">
                    <img height="64" :src="icon" alt="icon">
                    <h1><b>Are you sure you want to install <a target="_blank" @click="open(pluginUrl)" href="#">{{ name
                        }}</a> ?</b>
                    </h1>

                    <p>{{description}}</p>

                    <div class="okInstall" v-if="cleaned">
                        <v-icon color="green" x-large left>fas fa-check</v-icon>
                        {{ $t('installer.installedButton') }}
                    </div>
                </div>

                <div v-if="!cleaned" class="buttons-bottom">
                    <v-btn @click="downloadAndInstall">{{ $t('common.yes') }}</v-btn>
                    <v-btn @click="$electron.remote.app.quit()">{{ $t('common.no') }}</v-btn>
                </div>
                <div v-else class="buttons-bottom">
                    <v-btn @click="$electron.remote.app.quit()">Close</v-btn>
                </div>
            </div>

            <loader v-else transition="fade" transition-mode="out-in"></loader>

        </transition>

        <!-- Modal -->
        <v-dialog v-model="showDialog" persistent max-width="600">
            <v-card>
                <v-card-title class="headline">{{ $t('installer.modal.askOverwrite') }}</v-card-title>
                <v-card-text>
                    {{ $t('installer.modal.alreadyInstalledAddonDescription') }}
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" flat @click.native="showDialog = false">{{ $t('common.no') }}</v-btn>
                    <v-btn color="green darken-1" flat @click.native="extract">{{ $t('common.yes') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
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

    export default {
        name      : 'installer',
        components: {
            loader
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

                yesBtnClicked: false,

                tmpFilePath  : {},
                jsZipInstance: {},

                endpoint      : 'https://www.construct.net',
                addonsEndpoint: 'construct-2/addons',
            };
        },
        methods   : {
            open (url) {
                opn(url);
            },
            check () {
                new JSZip.external.Promise((resolve, reject) => {
                    fs.readFile(this.tmpFilePath, (err, data) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(data);
                        }
                    });
                }).then((data) => {
                    return JSZip.loadAsync(data);
                }).then((jszip) => {
                    this.jsZipInstance = jszip;

                    let exist = false;
                    Object.keys(this.jsZipInstance.files).forEach(async (filename) => {
                        if (filename !== 'files/' && filename !== 'info.xml') {
                            let f    = path.relative('files', filename);
                            let dest = path.join(this.c2addonsPath, 'plugins', f);
                            console.log(`Checking dest: ${dest}`);
                            if (fs.existsSync(dest)) {
                                console.log('-> Exists');
                                exist = true;
                            }
                        }
                    });

                    console.log('Exists ? ' + exist);
                    if (exist)
                        this.showDialog = true;
                    else
                        this.extract();
                });
            },
            async extract () {
                console.log("Extracting");
                this.showDialog = false;
                for (let i = 0; i < Object.keys(this.jsZipInstance.files).length; i++) {
                    let filename = Object.keys(this.jsZipInstance.files)[i];

                    if (filename !== 'files/' && filename !== 'info.xml') {
                        let content = await this.jsZipInstance.files[filename].async('nodebuffer');
                        let f       = path.relative('files', filename);
                        let dest = path.join(this.c2addonsPath, 'plugins', f);
                        console.log('dest is', dest);
                        if (path.extname(dest) === '')
                            mkdirp.sync(dest, {});
                        else
                            fs.writeFileSync(dest, content);
                    }
                }
                this.installed = true;

                fs.unlinkSync(this.tmpFilePath);

                this.cleaned = true;
            },
            downloadAndInstall () {
                /**
                 * Download
                 */
                this.tmpFilePath = path.join(os.tmpdir(), `${uuid()}.zip`);
                console.log('tmpFilePath', this.tmpFilePath);

                console.log(`Downloading ${this.link}`);
                progress(request({
                    method: 'GET',
                    url   : this.link
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
                }).pipe(fs.createWriteStream(this.tmpFilePath).on('close', (file) => {
                    this.check();
                }));
            }
        },
        async mounted () {
            this.args = this.$electron.remote.getGlobal('args');
            for (let i = 0; i < this.args.length; i++) {
                const argument = this.args[i];
                if (argument.startsWith('addoninstaller://')) {
                    this.pluginId  = argument.replace('addoninstaller://', '');
                    this.pluginUrl = `${this.endpoint}/${this.addonsEndpoint}/${this.pluginId}`;
                }
            }

            const options = {
                method   : 'GET',
                url      : `${this.endpoint}/${this.addonsEndpoint}/${this.pluginId}`,
                transform: function (body) {
                    return cheerio.load(body);
                }
            };

            console.log('Loading page...');
            this.$ = await rq(options);

            console.log('Page loaded.');

            this.description = this.$('.addonDescription').text();
            this.link        = `${this.endpoint}/${this.$('div.col.infoCol > h2:nth-child(1)')
                                                       .next().next().attr('href')}`;
            this.name        = this.$('.addonIconWrap').parent().text().replace(/<img(.*)\/>/, '').trim();
            this.icon        = this.$('.addonTopInfo > h1 > span > img').data('src');

            this.c2addonsPath = path.join(this.$electron.remote.app.getPath('appData'), 'Construct2');
            console.log('c2addonsPath', this.c2addonsPath);
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
</style>
