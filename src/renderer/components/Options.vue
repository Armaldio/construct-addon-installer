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

        <v-icon class="update" left dark>fas fa-sync-alt fa-spin</v-icon>

    </div>
</template>

<script>
    export default {
        name: 'installer',
        data () {
            return {};
        },
        async mounted () {
            let res = await this.$http.get('https://api.github.com/repos/armaldio/AddonInstaller/releases');
            console.log(res.data);
        }
    };
</script>

<style scoped>
    .update {
        position: absolute;
        bottom: 10px;
        right: 10px;
    }

    .btns {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        text-align: center;
    }

    .main * {
        -webkit-app-region: drag
    }

    i {
        padding: 15px !important;
    }

    button, a {
        -webkit-app-region: no-drag;
    }

    .center {
        text-align: center;
        margin-top: 50vh;
        transform: translateY(-50%);
        font-size: 25px;
        color: grey;
    }
</style>