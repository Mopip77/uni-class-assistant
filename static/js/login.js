import G_store from '../../store/index.js'
import ApiReference from './api_reference.js'
import LSReference from './local_storage_reference.js'
import Utils from './utils.js'
import HttpCommons from './http_commons.js'

import Notify from '../../wxcomponents/vant/dist/notify/notify.js'

export default {
	login(resolve = null, provider = 'weixin') {
		// console.log("登录中...");
		let that = this;

		uni.login({
			provider,
			success: function(loginRes) {
				console.log(loginRes);
				uni.request({
					url: ApiReference.LOGIN_URL + '?code=' + loginRes.code,
					method: 'POST',
					success: (infoRes) => {
						if (infoRes.data.code !== 0) {
							console.log('登录失败,请重试', infoRes);
							uni.showToast({
								title: '登录失败,请重试'
							});
							return;
						}

						console.log("server log:", infoRes)

						uni.setStorageSync(LSReference.ID, infoRes.data.data['id'])
						uni.setStorageSync(LSReference.JWT_TOKEN, infoRes.data.data['jwt_token'])
						uni.setStorageSync(LSReference.EXPIRE_TIMESTAMP, Number(infoRes.data.data['expiration_at']))
						let needUploadUserInfo = infoRes.data.data['need_user_info'] === "false" ? false : true; // js string bool 问题

						console.log("needUserInfo", needUploadUserInfo);

						if (needUploadUserInfo) {
							// console.log("上传用户信息")
							uni.getUserInfo({
								provider,
								success: function(infoRes) {
									// console.log('user info：', infoRes)
									G_store.commit("LOGIN")

									// 上传userInfo到后台
									uni.request({
										url: ApiReference.UPLOAD_USER_INFO,
										method: "POST",
										header: HttpCommons.getAuthenticationHeader(),
										data: {
											"openId": loginRes.code,
											"encryptedData": infoRes.encryptedData,
											"iv": infoRes.iv
										},
										success: (resp) => {
											console.log("上传userInfo返回值", resp);
											HttpCommons.successCheck(resp);
											if (resp.data.code != 0) {
												Notify({
													type: 'danger',
													message: '用户信息已上传过'
												});
												return;
											}
										}
									})
								}
							});
						}

						console.log("获取用户信息 in login method");
						if (null !== resolve) {
							resolve()
						}
					},
					fail: (e) => {
						console.error(e)
						Notify({
							type: 'danger',
							message: "登录失败,请重试"
						});
					}
				})

			},
			fail: (e) => {
				uni.showToast({
					title: '登录失败,请重启小程序'
				});
			}

		})
	},

	logout: function() {
		uni.logout();
		G_store.commit("LOGOUT");
	},

	/**
	 * 从服务器获取用户信息, 如果没有学校相关的信息, 弹出modal让用户补充
	 */
	getUserInfo: function() {
		uni.request({
			url: ApiReference.GET_USERINFO_URL,
			header: HttpCommons.getAuthenticationHeader(),
			success: (resp) => {
				console.log("获取用户信息", resp);
				HttpCommons.successCheck(resp)
				G_store.commit("LOGIN")
				G_store.commit("SET_USERINFO", resp.data.data)
			},
			fail: (e) => {
				console.error("获取用户信息失败", e)
				uni.showToast({
					title: '获取用户信息失败'
				});
			}
		})
	},

	/**
	 * 传入用户信息, 用户信息需要在传入前校验. 返回是否更新成功
	 * 
	 * @param {Object} userInfo
	 */
	updateUserInfo: function(userInfo) {
		uni.request({
			url: ApiReference.UPDATE_USERINFO_URL,
			method: "PUT",
			header: HttpCommons.getAuthenticationHeader(),
			data: userInfo,
			success: (resp) => {
				if (!HttpCommons.successCheck(resp)) {
					return
				}

				G_store.commit("SET_USERINFO", resp.data.data);
				Notify({
					type: 'success',
					message: "更新资料成功"
				});
			},
			fail: (e) => {
				HttpCommons.commonFailHanlder(e)
			}
		})
	},

	/**
	 * 检查登录状态,如果本地token有并且未过期,则直接返回,否则登录
	 */
	checkLoginStateAndLogin(resolve) {
		let token = uni.getStorageSync(LSReference.JWT_TOKEN)
		let expireTs = uni.getStorageSync(LSReference.EXPIRE_TIMESTAMP)

		if (null !== token && Utils.isTimestampValid(expireTs)) {
			uni.request({
				url: ApiReference,
				header: HttpCommons.getAuthenticationHeader(),
				success: (resp) => {
					if (resp.data.code === 0) {
						console.log("check login success");
						G_store.commit("LOGIN");
					} else {
						login()
					}

					if (null !== resolve) {
						resolve()
					}
				}
			})
		}
	},

	/**
	 * 只检查token是否过期
	 * 
	 * @return {Promise} 返回promise(resp)或者执行reject的空promise
	 */
	checkTokenVaild: function() {
		console.log("检查token valid");
		let token = uni.getStorageSync(LSReference.JWT_TOKEN)
		let expireTs = uni.getStorageSync(LSReference.EXPIRE_TIMESTAMP)

		if (null !== token && Utils.isTimestampValid(expireTs)) {
			console.log("请求token校验");
			return new Promise(function(resolve, reject) {
				uni.request({
					url: ApiReference.CHECK_TOKEN_URL,
					header: HttpCommons.getAuthenticationHeader(),
					success: (resp) => {
						console.log("检查token valid的resp", resp);
						if (resp.data.code === 0) {
							console.log("check login success");
							if (null !== resp.data.auth) {
								console.log("更新token in checkTokenVaild");
								uni.setStorageSync(LSReference.JWT_TOKEN, resp.data.auth['token'])
								uni.setStorageSync(LSReference.EXPIRE_TIMESTAMP, resp.data.auth['expireTimestamp'])
							}
							G_store.commit("LOGIN");
						}
						resolve(resp)
					},
					fail: (err) => {
						reject(err)
					}
				})
			})
		}
		console.log("本地token失效");
		return new Promise((resolve, reject) => {
			reject()
		})
	}
}
