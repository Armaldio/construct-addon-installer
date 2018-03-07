<template>
    <div class="main">
        <p class="center" v-show="!updateDownloaded">Update in progress...</p>

        <div class="btns">
            <v-btn @click="$electron.ipcRenderer.send('install')" v-show="updateDownloaded" class="center">
                <v-icon left dark>fas fa-download</v-icon>
                {{ $t('options.updateReady') }}
            </v-btn>

            <v-progress-linear v-show="!updateDownloaded" class="bottom"
                               :value="downloadPercent" height="5" color="success"></v-progress-linear>
        </div>
    </div>
</template>

<script>
    import Raven from 'raven';
    import opn from 'opn';
    import {autoUpdater} from 'electron-updater';

    Raven.config('https://9ae8166a8a7941d0a254f211e1890b93:7e72d5dc78c64499abc369152585db10@sentry.io/297440')
         .install();

    export default {
        name   : 'options',
        data () {
            return {
                downloadPercent : 0,
                updateDownloaded: false
            };
        },
        methods: {
            open (url) {
                opn(url);
            }
        },
        async mounted () {
            this.$electron.ipcRenderer.send('page-ready');
            console.log('Sent page ready');

            this.$electron.ipcRenderer.on('update', (event, arg) => {
                console.log(arg);
                switch (arg) {
                    case 'update-downloaded':
                        this.updateDownloaded = true;
                        break;
                    case 'update-available':
                        this.$electron.ipcRenderer.send('download');
                        break;
                    case 'update-not-available':
                    case 'error':
                        this.text = 'No updates available...';
                        break;
                }
            });

            this.$electron.ipcRenderer.on('progress', (event, arg) => {
                //console.log(arg);
                this.downloadPercent = arg.percent;
                this.$electron.remote.getCurrentWindow().setProgressBar(this.downloadPercent / 100);
            });
        }
    };
</script>

<style scoped>
    .update {
        position: absolute;
        bottom: 3px;
        right: 0;
    }

    .bottom {
        position: absolute;
        bottom: 0;
        right: 0;
        left: 0;
        margin-top: 0;
        margin-bottom: 0;
    }

    .btns {
        position: absolute;
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
        color: grey;
    }
</style>