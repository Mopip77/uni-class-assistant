import LoginUtils from './login.js'
import LSReference from './local_storage_reference.js'
import G_store from '../../store/index.js'

import Notify from '../../wxcomponents/vant/dist/notify/notify.js'

export default {

	/**
	 * 处理通用的正常结果(主要是为了处理auth内容), 返回true如果没问题, 否则返回false
	 * @param {Object} resp
	 * @return {Boolean}
	 */
	successCheck: function(resp) {
		console.log("successCheck resp", resp);
		console.log("successCheck resp auth", resp.data.auth);
		if (undefined !== resp.data.auth && null !== resp.data.auth) {
			// 更新token
			console.log("更新token in httpSuccessCheck");
			uni.setStorageSync(LSReference.JWT_TOKEN, resp.data.auth['token'])
			uni.setStorageSync(LSReference.EXPIRE_TIMESTAMP, resp.data.auth['expireTimestamp'])
		}

		if (resp.data.code === 3002) {
			// 用户未登录
			// LoginUtils.login()
			G_store.commit('LOGOUT');
			G_store.commit('NEED_LOGIN_ALERT', true);
			uni.switchTab({
				url: "/pages/me/me"
			})
			return false;
		} else if (resp.data.code != 0) {
			console.error(resp.data.trace);
			Notify({
				type: 'danger',
				message: resp.data.message
			});
			return false;
		}

		return true;
	},
	
	/**
	 * 返回包含jwt token的http header
	 * 
	 * 同步方法会导致一个问题, 就是在onLauch我们会checkTokenVaild和获取首页信息,并且在这两个request建立前header就已经生成了相同的. 
	 * 如果当前token"即将"过期,那么checkToken会更新token,但是同步更新的值不会反映到获取首页信息的request header中,
	 * 我使用了timeInterval的方法,让 获取首页信息 一定在checkToken之后执行, 但是这只是针对这个方法而言. 如果该程序有多个入口,那么每个入口,都要设置执行的先后顺序.
	 * 不过,目前该程序只有首页一个入口.
	 * 
	 */
	getAuthenticationHeader: function() {
		let header = {
			'Authorization': 'Bearer ' + uni.getStorageSync(LSReference.JWT_TOKEN)
		};
		console.log("生成auth header", header);
		return header;
	},

	/**
	 * 通用的错误处理
	 * 
	 * @param {Object} err 错误
	 */
	commonFailHanlder(err) {
		console.error(err)
		Notify({
			type: 'danger',
			message: err
		});
	}

}
