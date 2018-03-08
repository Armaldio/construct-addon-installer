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
            <v-btn @click="open('https://github.com/armaldio/AddonInstaller')">
                <v-icon left dark>fab fa-github</v-icon>
                View the project on Github
            </v-btn>
        </div>

        <v-snackbar absolute top color="info" multi-line :timeout="600000" v-model="updateAvailable">
            <v-icon left dark class="mr-2">fas fa-download</v-icon>
            <span> {{ $t('update.newUpdateAvailable') }}</span>
            <v-btn dark flat large @click.once="InstallUpdate">{{ $t('update.installNow') }}</v-btn>
            <v-btn dark flat large @click.once="updateAvailable = false">{{ $t('common.close') }}</v-btn>
        </v-snackbar>
    </div>
</template>

<script>
    import Raven from 'raven';
    import opn from 'opn';

    Raven.config('https://9ae8166a8a7941d0a254f211e1890b93:7e72d5dc78c64499abc369152585db10@sentry.io/297440')
         .install();

    export default {
        name   : 'options',
        data () {
            return {
                checkingForUpdates: false,
                updateReady       : false,
                downloadPercent   : 0,
                updateAvailable   : false
            };
        },
        methods: {
            open (url) {
                opn(url);
            },
            InstallUpdate () {
                this.$electron.ipcRenderer.removeAllListeners('update');
                this.$router.push('/updater');
            }
        },
        async mounted () {
            let autoUpdater = this.$electron.remote.getGlobal('autoUpdater');
            autoUpdater.checkForUpdates();
            autoUpdater.on('update-available', (currentUpdate) => {
                this.updateAvailable = true;
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