import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'installer',
      component: require('@/components/Installer').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
