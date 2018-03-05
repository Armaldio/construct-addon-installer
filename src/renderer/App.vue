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

    export default {
        name      : 'installer',
        components: {
            titlebar
        },
        mounted () {
            this.args = this.$electron.remote.getGlobal('args');
            for (let i = 0; i < this.args.length; i++) {
                const argument = this.args[i];
                if (argument.startsWith('addoninstaller://')) {
                    console.log('Starting with an addon');
                    this.$router.replace('installer');
                }
            }
        }
    };
</script>

<style>
    html, body {
        background: rgba(0, 0, 0, 0);
        overflow-y: auto !important;
    }

    body {
        background: #212121;
        font-family: 'Roboto', sans-serif;
    }

    html {
        overflow-y: auto;
        background-color: transparent;
    }
</style>
