import G_store from '../../store/index.js'

export default {
	login: function(provider) {
		uni.login({
			provider,
			success: function(loginRes) {
				console.log(loginRes);
				uni.request({
					url: 'https://api.weixin.qq.com/sns/jscode2session?appid=wxbd21241fb6e026b4&secret=623640a2bceb446a7b53b7442cd41530&grant_type=authorization_code&js_code=' + loginRes.code,
					success: (infoRes) => {
						console.log("server log:", infoRes)
						
						uni.getUserInfo({
							provider,
							success: function(infoRes) {
								console.log('user info：', infoRes)
						
								G_store.commit("LOGIN", infoRes.userInfo)
						
								if (G_store.state.forcedLogin) {
									uni.reLaunch({
										url: '/pages/index/index'
									})
								} else {
									uni.navigateBack();
								}
							}
						});
					}
				})
				
				// 获取用户信息
				
			}
		})
	},
	
	logout: function() {
		uni.logout();
		G_store.commit("LOGOUT");
	}
}
