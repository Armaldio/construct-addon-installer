<template>
    <div class="titlebar draggable">
        <div class="app-title">C2 Addon Installer</div>
        <div class="titlebar-controls">
            <div class="titlebar-minimize" @click="minimize">
                <svg x="0px" y="0px" viewBox="0 0 10 1">
                    <rect fill="#fff" width="10" height="1"></rect>
                </svg>
            </div>
            <div class="titlebar-resize" @click="resize">
                <svg class="fullscreen-svg" x="0px" y="0px" viewBox="0 0 10 10">
                    <path fill="#fff" d="M 0 0 L 0 10 L 10 10 L 10 0 L 0 0 z M 1 1 L 9 1 L 9 9 L 1 9 L 1 1 z "/>
                </svg>
                <svg class="maximize-svg" x="0px" y="0px" viewBox="0 0 10 10">
                    <mask id="Mask">
                        <rect fill="#FFFFFF" width="10" height="10"></rect>
                        <path fill="#fff" d="M 3 1 L 9 1 L 9 7 L 8 7 L 8 2 L 3 2 L 3 1 z"/>
                        <path fill="#fff" d="M 1 3 L 7 3 L 7 9 L 1 9 L 1 3 z"/>
                    </mask>
                    <path fill="#fff" d="M 2 0 L 10 0 L 10 8 L 8 8 L 8 10 L 0 10 L 0 2 L 2 2 L 2 0 z"
                          mask="url(#Mask)"/>
                </svg>
            </div>
            <div class="titlebar-close" @click="close">
                <svg x="0px" y="0px" viewBox="0 0 10 10">
                    <polygon fill="#fff" points="10,1 9,0 5,4 1,0 0,1 4,5 0,9 1,10 5,6 9,10 10,9 6,5"></polygon>
                </svg>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name   : 'Titlebar',
        methods: {
            close () {
                this.$electron.remote.getCurrentWindow().close();
            },
            resize () {
                /*this.$electron.remote.getCurrentWindow().restore();
                this.$electron.remote.getCurrentWindow().maximize();*/
            },
            minimize () {
                this.$electron.remote.getCurrentWindow().minimize();
            }
        }
    };
</script>

<style scoped>
    .app-title {
        padding-left: 10px;
        padding-top: 5px;
        display: inline-block;
    }

    .titlebar {
        display: block;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 32px;
        padding: 0;
        background-color: #424242;
        /*border-radius: 5px 5px 0 0;*/
    }

    .titlebar.draggable {
        -webkit-app-region: drag;
    }

    .titlebar-controls {
        float: right;
        text-align: left;
    }

    .titlebar:after,
    .titlebar-controls:after {
        content: ' ';
        display: table;
        clear: both;
    }

    .titlebar-minimize,
    .titlebar-resize,
    .titlebar-close {
        float: left;
        width: 45px;
        height: 31px;
        margin: 1px 1px 0 0;
        text-align: center;
        line-height: 29px;

        -webkit-transition: background-color .2s;
        -moz-transition: background-color .2s;
        -ms-transition: background-color .2s;
        -o-transition: background-color .2s;
        transition: background-color .2s;
    }

    .titlebar.draggable .titlebar-minimize,
    .titlebar.draggable .titlebar-resize,
    .titlebar.draggable .titlebar-close {
        -webkit-app-region: no-drag;
    }

    .titlebar-minimize svg,
    .titlebar-resize svg.maximize-svg,
    .titlebar-resize svg.fullscreen-svg,
    .titlebar-close svg {
        width: 10px;
        height: 10px;
        shape-rendering: crispEdges;
    }

    .titlebar-close svg polygon {
        -webkit-transition: fill .2s;
        -moz-transition: fill .2s;
        -ms-transition: fill .2s;
        -o-transition: fill .2s;
        transition: fill .2s;
    }

    .titlebar:not(.fullscreen) svg.maximize-svg {
        display: none;
    }

    .titlebar.fullscreen svg.fullscreen-svg {
        display: none;
    }

    .titlebar-minimize:hover,
    .titlebar-resize:hover,
    .titlebar-fullscreen:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .titlebar-light .titlebar-minimize:hover,
    .titlebar-light .titlebar-resize:hover,
    .titlebar-light .titlebar-fullscreen:hover {
        background-color: rgba(0, 0, 0, 0.1);
    }

    .titlebar-close:hover {
        background-color: rgba(232, 17, 35, 0.9);
    }

    .titlebar-close:hover svg polygon {
        fill: rgba(255, 255, 255, 1);
    }

    .titlebar-light .titlebar-close:hover {
        fill: rgba(0, 0, 0, 1);
    }

    .titlebar-light svg polygon,
    .titlebar-light svg rect,
    .titlebar-light svg > path {
        fill: rgba(255, 255, 255, 1);
    }

    .titlebar-light .titlebar-close:hover {
        background-color: rgba(232, 17, 35, 0.9);
    }


</style>