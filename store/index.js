import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		checkLogin: false,  // onLaunch需要向服务器获取登录状态,由于是异步方法,所以需要一个标志位说明是否执行完成,其他查询任务均需要在获取登录状态之后才能执行
		hasLogin: false,
		loginUser: null,
		needLoginAlert: false,  // 用于提醒未登录,跳转到me页面,并且在me的onShow需要判断该值,如果为真则触发未登录提醒并且将该位置为false
		// loginUser: {
		// 	"avatarUrl": "",
		// 	"city": "",
		// 	"country": "",
		// 	"gender": 0,
		// 	"language": "",
		// 	"nickName": "",
		// 	"province": ""
		// }
	},
	mutations: {
		CHECK_LOGIN(state) {
			console.log("vuex 检查登录了");
			state.checkLogin = true
		},
		LOGIN(state) {
			console.log("vuex 登录了");
			state.hasLogin = true;
		},
		LOGOUT(state) {
			console.log("vuex 注销了");
			state.hasLogin = false;
		},
		SET_USERINFO(state, userInfo) {
			state.loginUser = userInfo;
		},
		NEED_LOGIN_ALERT(state, value) {
			state.needLoginAlert = value
		}
	}
})

export default store