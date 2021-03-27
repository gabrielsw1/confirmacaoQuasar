import Vue from 'vue'
import axios from 'axios'


const config = axios.create({
    baseURL: 'https://cliente.hospidata.com.br/globalhealth/'
})

Vue.prototype.$axios = config

