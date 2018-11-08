import Vue from 'vue';
import Vuetify from 'vuetify';
import VueI18n from 'vue-i18n';
import osLocale from 'os-locale';
import 'vuetify/dist/vuetify.min.css';
import * as Sentry from '@sentry/node';

import App from './App';
import router from './router';
import store from './store';
import messages from '../translations';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.config.productionTip = false;

Vue.use(Vuetify);
Vue.use(VueI18n);

const locale = osLocale.sync();
console.log(`Detected locale: ${locale}`);
const i18n = new VueI18n({
  locale,
  fallbackLocale: 'en_US',
  messages,
});

Sentry.init({
  dsn: 'https://9ae8166a8a7941d0a254f211e1890b93@sentry.io/297440',
  // integrations: [new MyAwesomeIntegration()],
});
/* Sentry.setContext({
  version: pkg.version,
}); */

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  i18n,
  store,
  template: '<App/>',
}).$mount('#app');

if (module.hot) {
  module.hot.accept(['../translations/lang.en_US', '../translations/lang.fr_FR'], () => {
    i18n.setLocaleMessage('en_US', import('../translations/lang.en_US').default);
    i18n.setLocaleMessage('fr_FR', import('../translations/lang.fr_FR').default);
  });
}
