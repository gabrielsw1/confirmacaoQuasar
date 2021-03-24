import Vue from 'vue'
import axios from 'axios'


const config = axios.create({
    baseURL: 'http://192.168.232.113:8587/'
})

Vue.prototype.$axios = config

