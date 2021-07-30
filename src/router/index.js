import Vue from 'vue'
import VueRouter from 'vue-router'

import routes from './routes'

Vue.use(VueRouter)

export default function (/* { store, ssrContext } */) {
  const Router = new VueRouter({
    scrollBehavior: () => ({x: 0, y: 0}),
    routes,
    // Leave these as they are and change in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    //mode: 'history',
    base: process.env.VUE_ROUTER_BASE
  })


  Router.beforeEach((to, from, next) => {
    (async () => {
      try {
        const {data} = await Vue.prototype.$axios.get("/login/isAuthenticated")
        console.log(data)
        if (to.path !== '/' && !data) {
          next({path: '/'})
        } else {
          next()
        }
      } catch (e) {
        console.log(e)
      }
    })()

  })

  return Router
}
