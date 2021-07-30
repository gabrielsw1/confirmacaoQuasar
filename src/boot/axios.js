import Vue from 'vue'
import axios from 'axios'


const config = axios.create({
 // baseURL: 'http://192.168.232.113:8587',
  baseURL:'',
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  credentials: 'include',
})


Vue.prototype.$axios = config

