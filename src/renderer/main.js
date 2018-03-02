import Vue from 'vue';
import axios from 'axios';

import App from './App';
import router from './router';
import store from './store';
import Vuetify from 'vuetify';
import VueI18n from 'vue-i18n';
import osLocale from 'os-locale';

import messages from '../translations'

import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);
Vue.use(VueI18n);

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

let locale = osLocale.sync();
console.log(`Detected locale: ${locale}`);
const i18n = new VueI18n({
    locale,
    fallbackLocale: 'en_US',
    messages,
});

/* eslint-disable no-new */
new Vue({
    components: {App},
    router,
    i18n,
    store,
    template  : '<App/>'
}).$mount('#app');

if (module.hot) {
    module.hot.accept(['../translations/lang.en_US', '../translations/lang.fr_FR'], function () {
        i18n.setLocaleMessage('en_US', import('../translations/lang.en_US').default);
        i18n.setLocaleMessage('fr_FR', import('../translations/lang.fr_FR').default);
    });
}