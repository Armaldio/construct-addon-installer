import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path     : '/',
            name     : 'options',
            component: require('@/components/Options').default
        },
        {
            path     : '/installer',
            name     : 'installer',
            component: require('@/components/Installer').default
        },
        {
            path     : '/updater',
            name     : 'updater',
            component: require('@/components/Updater').default
        }, {
            path    : '*',
            redirect: '/'
        }
    ]
});
