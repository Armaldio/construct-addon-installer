import Vue from 'vue';
import Router from 'vue-router';

const Options = () => import(/* webpackChunkName: "group-foo" */ '@/components/Options');
const Installer = () => import(/* webpackChunkName: "group-foo" */ '@/components/Installer');
const Updater = () => import(/* webpackChunkName: "group-foo" */ '@/components/Updater');

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'options',
      component: Options,
    },
    {
      path: '/installer',
      name: 'installer',
      component: Installer,
    },
    {
      path: '/updater',
      name: 'updater',
      component: Updater,
    }, {
      path: '*',
      redirect: '/',
    },
  ],
});
