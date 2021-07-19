import Vue from 'vue'
import Vuex from 'vuex'

import appointments from './Appointments'
import agendar from './Agendar'
import global from './Global'
import user from './User'

Vue.use(Vuex)



export default function () {
  const Store = new Vuex.Store({
    modules: {
      appointments,
      agendar,
      global,
      user
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEBUGGING
  })

  return Store
}
