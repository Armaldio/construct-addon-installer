<template>
  <div class="main">
    <v-btn large @click="autoUpdater.quitAndInstall(false, true)" v-show="updateDownloaded">
      <v-icon left dark>fas fa-download</v-icon>
      {{ $t('options.updateReady') }}
    </v-btn>

    <v-progress-circular v-show="!updateDownloaded" :size="150" :width="20" :rotate="360"
                         :value="downloadPercent" color="success">
      {{ Math.round(downloadPercent) }}%
    </v-progress-circular>
  </div>
</template>

<script>
  // import Raven from 'raven';
  import opn from 'opn';
  // import { autoUpdater } from 'electron-updater';

  /* Raven.config('https://9ae8166a8a7941d0a254f211e1890b93:7e72d5dc78c64499abc369152585db10@sentry.io/297440')
    .install(); */

  export default {
    name: 'options',
    data() {
      return {
        downloadPercent: 0,
        updateDownloaded: false,
        autoUpdater: {},
      };
    },
    methods: {
      open(url) {
        opn(url);
      },
    },
    async mounted() {
      this.autoUpdater = this.$electron.remote.getGlobal('autoUpdater');
      this.autoUpdater.checkForUpdates();

      this.autoUpdater.on('update-available', (/* currentUpdate */) => {
        this.updateAvailable = true;
        this.autoUpdater.downloadUpdate();
      });
      this.autoUpdater.on('update-downloaded', (/* file */) => {
        this.updateDownloaded = true;
      });
      this.autoUpdater.on('download-progress', (progress) => {
        this.downloadPercent = progress.percent;
        this.$electron.remote.getCurrentWindow().setProgressBar(this.downloadPercent / 100);
      });
    },
  };
</script>

<style scoped>

  i {
    padding: 15px !important;
  }

  .main {
    text-align: center;
    margin-top: 50vh;
    transform: translateY(-50%);
    color: grey;
  }
</style>
