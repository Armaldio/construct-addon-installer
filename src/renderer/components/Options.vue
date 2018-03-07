<template>
    <div class="main">
        <p class="center">{{ $t('options.noOptionsAvailable') }}</p>

        <div class="btns">
            <v-btn @click="open('https://chrome.google.com/webstore/detail/lfhphgaiacpikafeajdlokjafeokddcd/')">
                <v-icon left dark>fab fa-chrome</v-icon>
                Chrome
            </v-btn>
            <v-btn @click="open('https://addons.mozilla.org/fr/firefox/addon/construct-addon-installer/')">
                <v-icon left dark>fab fa-firefox</v-icon>
                Firefox
            </v-btn>
            <v-btn disabled>
                <v-icon left dark>fab fa-edge</v-icon>
                Edge
            </v-btn>
            <v-btn disabled>
                <v-icon left dark>fab fa-opera</v-icon>
                Opera
            </v-btn>
        </div>

        <v-btn v-if="checkingForUpdates && downloadPercent !== 100" class="update">
            <v-icon left dark>fas fa-sync-alt fa-spin</v-icon>
            {{ $t('options.checkingForUpdates') }}...
        </v-btn>

        <v-btn v-if="updateReady && downloadPercent !== 100" class="update">
            <v-icon left dark>fas fa-download</v-icon>
            {{ $t('options.updating') }}...
        </v-btn>

        <v-btn @click="$electron.ipcRenderer.send('download')" v-if="downloadPercent === 100" class="update">
            <v-icon left dark>fas fa-download</v-icon>
            {{ $t("options.updateReady") }}
        </v-btn>

        <v-progress-linear v-if="downloadPercent !== 100 && downloadPercent !== 0" class="bottom"
                           :value="downloadPercent" height="2" color="success"></v-progress-linear>
    </div>
</template>

<script>
    import Raven from 'raven';
    import opn from 'opn';

    Raven.config('https://9ae8166a8a7941d0a254f211e1890b93:7e72d5dc78c64499abc369152585db10@sentry.io/297440')
         .install();

    export default {
        name   : 'installer',
        data () {
            return {
                checkingForUpdates: false,
                updateReady       : false,
                downloadPercent   : 0
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
                        this.checkingForUpdates = false;
                        this.updateReady        = true;
                        break;
                    case 'update-available':
                        this.checkingForUpdates = false;
                        this.updateReady        = true;
                        break;
                    case 'checking-for-update':
                        this.checkingForUpdates = true;
                        this.updateReady        = false;
                        break;
                    case 'update-not-available':
                    case 'error':
                        this.checkingForUpdates = false;
                        this.updateReady        = false;
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
</style>