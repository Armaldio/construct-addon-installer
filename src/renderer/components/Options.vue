<template>
    <div class="main">
        <p class="center">There are currently no options available...</p>

        <div class="btns">
            <v-btn disabled>
                <v-icon left dark>fab fa-chrome</v-icon>
                Chrome
            </v-btn>
            <v-btn disabled>
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

        <v-btn v-if="checkingForUpdates" class="update" flat>
            <v-icon left dark>fas fa-sync-alt fa-spin</v-icon>
        </v-btn>

        <v-btn v-if="updateReady"  class="update">
            <v-icon left dark>fas fa-download</v-icon>
            Updating...
        </v-btn>

        <v-btn @click="$electron.ipcRenderer.send('download')" v-if="downloadPercent === 100" class="update">
            <v-icon left dark>fas fa-download</v-icon>
            Update ready
        </v-btn>

        <v-progress-linear v-if="downloadPercent !== 100 && downloadPercent !== 0" class="bottom" :value="downloadPercent" height="2" color="success"></v-progress-linear>
    </div>
</template>

<script>
    export default {
        name: 'installer',
        data () {
            return {
                checkingForUpdates: false,
                updateReady       : false,
                downloadPercent   : 0
            };
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