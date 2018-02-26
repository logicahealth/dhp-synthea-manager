import Vue from 'vue'
import Router from 'vue-router'
import Process from '@/components/Process'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: '/Process',
      component: Process,
      props: true
    },
    {
      path: '/Process',
      name: 'Process',
      component: Process
    }
  ],
  props: [
    'icn'
  ]
})
