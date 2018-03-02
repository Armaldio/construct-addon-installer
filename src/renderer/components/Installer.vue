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
                        Installed
                    </div>
                </div>

                <div v-if="!cleaned" class="buttons-bottom">
                    <v-btn @click="install">Yes</v-btn>
                    <v-btn @click="$electron.remote.app.quit()">No</v-btn>
                </div>
                <div v-else class="buttons-bottom">
                    <v-btn @click="$electron.remote.app.quit()">Close</v-btn>
                </div>
            </div>

            <loader v-else transition="fade" transition-mode="out-in"></loader>

        </transition>

        <!-- Modal -->
        <v-dialog v-model="showDialog" persistent max-width="500">
            <v-card>
                <v-card-title class="headline">{{ $t("installer.modal.askOverwrite") }}</v-card-title>
                <v-card-text>
                    This addon is already installed. You have the choice to replace it or to not install it
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    on modal closed
                    <v-btn color="red darken-1" flat @click.native="showDialog = false">No</v-btn>
                    <v-btn color="green darken-1" flat @click.native="showDialog = false">Yes</v-btn>
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

                showDialog: true,

                endpoint      : 'https://www.construct.net',
                addonsEndpoint: 'construct-2/addons',
            };
        },
        methods   : {
            open (url) {
                opn(url);
            },
            install () {
                /**
                 * Download
                 */
                let tmpFilePath = path.join(os.tmpdir(), `${uuid()}.zip`);
                console.log('tmpFilePath', tmpFilePath);

                console.log(`Downloading ${this.link}`);
                progress(request({
                    method: 'GET',
                    url   : this.link
                }, () => {

                })).on('progress', (state) => {
                    this.percent = state.percent;
                    // The state is an object that looks like this:
                    // {
                    //     percent: 0.5,               // Overall percent (between 0 to 1)
                    //     speed: 554732,              // The download speed in bytes/sec
                    //     size: {
                    //         total: 90044871,        // The total payload size in bytes
                    //         transferred: 27610959   // The transferred payload size in bytes
                    //     },
                    //     time: {
                    //         elapsed: 36.235,        // The total elapsed seconds since the start (3 decimals)
                    //         remaining: 81.403       // The remaining seconds to finish (3 decimals)
                    //     }
                    // }
                    console.log('progress', state);
                }).on('error', (err) => {
                    this.progress = 100;
                    console.log(err);
                }).on('end', () => {
                    this.progress = 100;
                    console.log('File downloaded!');
                    this.downloaded = true;
                    // Do something after request finishes
                }).pipe(fs.createWriteStream(tmpFilePath).on('close', (file) => {

                    new JSZip.external.Promise((resolve, reject) => {
                        fs.readFile(tmpFilePath, (err, data) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(data);
                            }
                        });
                    }).then((data) => {
                        return JSZip.loadAsync(data);
                    }).then((jszip) => {
                        Object.keys(jszip.files).forEach((filename) => {
                            if (filename !== 'files/' && filename !== 'info.xml') {
                                jszip.files[filename].async('nodebuffer').then((content) => {
                                    let f = path.relative('files', filename);
                                    console.log(f);
                                    let dest = path.join(this.c2addonsPath, 'plugins', f);
                                    console.log('dest is', dest);
                                    /*if (path.extname(dest) === '')
                                        mkdirp.sync(dest, {});
                                    else
                                        fs.writeFileSync(dest, content);*/
                                });
                            }
                        });

                        this.installed = true;

                        fs.unlinkSync(tmpFilePath);

                        this.cleaned = true;
                    });

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
