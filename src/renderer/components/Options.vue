<template>
    <div class="main">
        <div class="body">
            <v-layout row>
                <v-flex xs10>
                    <v-text-field name="input-3" label="Construct 2 Home" :value="settings.customfolder.path"
                                  disabled></v-text-field>
                </v-flex>
                <v-flex xs1>
                    <v-btn @click="selectFolder">Select</v-btn>
                </v-flex>
                <v-flex xs1 class="ml-3">
                    <v-btn @click="clear">Clear</v-btn>
                </v-flex>
            </v-layout>
            <v-layout row>
                <v-flex xs12>
                    <v-checkbox :disabled="settings.customfolder.path === ''"
                                label="Set default install location to custom location"
                                v-model="settings.customfolder.isDefault"></v-checkbox>
                </v-flex>
            </v-layout>
            <!--<v-layout row>
                <v-flex xs12>
                    <v-checkbox disabled label="Check plugins in both folders"
                                v-model="settings.checkOverwriteBoth"></v-checkbox>
                </v-flex>
            </v-layout>-->
        </div>

        <div class="btns">
            <div style="font-size: 20px">&#x2198; &nbsp; Don't have the browser extensions yet? Download them now! &nbsp; &#x2199;</div>
            <v-btn @click="open('https://chrome.google.com/webstore/detail/lfhphgaiacpikafeajdlokjafeokddcd/')">
                <v-icon left dark>fab fa-chrome</v-icon>
                Chrome
            </v-btn>
            <v-btn @click="open('https://addons.mozilla.org/fr/firefox/addon/construct-addon-installer/')">
                <v-icon left dark>fab fa-firefox</v-icon>
                Firefox
            </v-btn>
            <!--<v-btn disabled>
                <v-icon left dark>fab fa-edge</v-icon>
                Edge
            </v-btn>
            <v-btn disabled>
                <v-icon left dark>fab fa-opera</v-icon>
                Opera
            </v-btn>-->
            <v-btn @click="open('https://github.com/armaldio/AddonInstaller')">
                <v-icon left dark>fab fa-github</v-icon>
                {{ $t('options.viewProjectOnGithub') }}
            </v-btn>
        </div>

        <v-snackbar absolute top color="info" multi-line :timeout="600000" v-model="updateAvailable">
            <v-icon left dark class="mr-2">fas fa-download</v-icon>
            <span> {{ $t('update.newUpdateAvailable') }}</span>
            <v-btn dark flat large @click.once="InstallUpdate">{{ $t('update.installNow') }}</v-btn>
            <v-btn dark flat large @click.once="updateAvailable = false">{{ $t('common.close') }}</v-btn>
        </v-snackbar>

        <span class="version">v{{ version }}</span>
    </div>
</template>

<script>
    import Raven from 'raven';
    import opn from 'opn';
    import pkg from '../../../package';

    Raven.config('https://9ae8166a8a7941d0a254f211e1890b93:7e72d5dc78c64499abc369152585db10@sentry.io/297440')
         .install();

    export default {
        name    : 'options',
        data () {
            return {
                checkingForUpdates: false,
                updateReady       : false,
                downloadPercent   : 0,
                updateAvailable   : false,
                version           : pkg.version,
                settings          : {
                    customfolder      : {
                        path     : '',
                        isDefault: false
                    },
                    checkOverwriteBoth: false
                }
            };
        },
        methods : {
            selectFolder () {
                this.$electron.remote.dialog.showOpenDialog(this.$electron.remote.getCurrentWindow(), {
                    properties: ['openDirectory']
                }, (paths) => {
                    if (paths.length === 1) {
                        let p                           = paths[0];
                        this.settings.customfolder.path = p;
                    } else {
                        console.log('Cannot select more than one directory!');
                    }
                });
            },
            clear () {
                this.settings.customfolder.path = '';
                this.settings.customfolder.isDefault = false;
            },
            open (url) {
                opn(url);
            },
            InstallUpdate () {
                this.$electron.ipcRenderer.removeAllListeners('update');
                this.$router.push('/updater');
            }
        },
        computed: {
            customfolderIsDefault () {
                return this.settings.customfolder.isDefault;
            },
            checkOverwriteBoth () {
                return this.settings.checkOverwriteBoth;
            },
            customfolderpath () {
                return this.settings.customfolder.path;
            }
        },
        watch   : {
            customfolderpath (newVal, oldVal) {
                if (oldVal !== newVal) {
                    this.$db.set('settings.customfolder.path', newVal).write();
                }
            },
            customfolderIsDefault (newVal, oldVal) {
                if (oldVal !== newVal) {
                    console.log(newVal);
                    this.$db.set('settings.customfolder.isDefault', newVal).write();
                }
            },
            checkOverwriteBoth (newVal, oldVal) {
                if (oldVal !== newVal) {
                    this.$db.set('settings.checkOverwriteBoth', newVal).write();
                }
            }
        },
        async mounted () {
            let autoUpdater = this.$electron.remote.getGlobal('autoUpdater');
            autoUpdater.checkForUpdates();
            autoUpdater.on('update-available', (currentUpdate) => {
                this.updateAvailable = true;
            });

            this.settings.customfolder.path = this.$db.get('settings.customfolder.path').value();
            if (this.settings.customfolder.path === undefined)
                this.settings.customfolder.path = '';
            this.settings.customfolder.isDefault = this.$db.get('settings.customfolder.isDefault').value();
        }
    };
</script>

<style scoped>
    .version {
        position: absolute;
        bottom: 0;
        left: 3px;
    }

    .btns {
        position: absolute;
        bottom: 3px;
        left: 0;
        right: 0;
        text-align: center;
    }

    i {
        padding: 15px !important;
    }

    .center {
        text-align: center;
        margin-top: 50vh;
        transform: translateY(-50%);
        font-size: 25px;
        color: grey;
    }

    .body {
        padding-top: 50px;
        padding-left: 10px;
    }
</style>