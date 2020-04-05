import Vue from 'vue'
import App from './App'

import store from './store/index.js'

Vue.config.productionTip = false

Vue.prototype.apiServer = 'http://239o27r945.qicp.vip/'
// Vue.prototype.apiServer = 'http://192.168.2.136:8080/'
// Vue.prototype.apiServer = 'http://127.0.0.1:8080/'
Vue.prototype.$store = store

App.mpType = 'app'

const app = new Vue({
	store,
    ...App
})
app.$mount()
