<template>
    <div id="app">
        <v-app dark>
            <v-content>
                <titlebar></titlebar>
                <router-view></router-view>
            </v-content>
        </v-app>
    </div>
</template>

<script>
    import titlebar from '@/components/Titlebar';
    import c2Utilities from './components/scripts/c2Utilities';
    import notifier from 'node-notifier';

    export default {
        name      : 'installer',
        components: {
            titlebar
        },
        mounted   : async function () {
            //let addonInfos = await c2Utilities.getAddonInfos('');
            //console.log(addonInfos);

            this.args = this.$electron.remote.getGlobal('args');
            for (let i = 0; i < this.args.length; i++) {
                const argument = this.args[i];
                if (argument === '--update') {
                    this.$router.replace('updater');
                } else if (argument.startsWith('addoninstaller://')) {
                    //console.log(`Addon type: ${addonInfos['type']}`);
                    /*notifier.notify({
                        title  : 'C2 Addon Installer',
                        message: 'Analysing plugin...',
                        icon   : __dirname + '/256x256.png',
                        sound  : true
                    });*/
                    this.$router.replace('installer');
                }
            }
        }
    };
</script>

<style>
    html, body {
        background: #303030;
        overflow-y: auto !important;
    }

    body {
        background: #303030;
        font-family: 'Roboto', sans-serif;
    }

    html {
        overflow-y: auto;
        background-color: transparent;
    }
</style>
