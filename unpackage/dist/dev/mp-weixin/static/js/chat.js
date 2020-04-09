import ApiReference from './api_reference.js'
import HttpCommons from './http_commons.js'

export default {
	
	/**
	 * @param {Number} uId
	 * @param {Number} offset
	 * @param {Number} count
	 */
	getMessages(uId, offset, count) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.CHAT + '?uId=' + uId  + '&offset=' + offset + '&count=' + count,
				header: HttpCommons.getAuthenticationHeader(),
				success: (resp) => {
					if (HttpCommons.successCheck(resp)) {
						resolve(resp.data.data)
					}
				},
				fail: (err) => {
					HttpCommons.commonFailHanlder(err)
					reject(err)
				}
			})
		})
	},
	
	
	/**
	 * @param {Number} receiverId
	 * @param {String} content
	 */
	sendMessage(receiverId, content) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.CHAT,
				method: "POST",
				header: HttpCommons.getAuthenticationHeader(),
				data: {
					receiverId,
					content
				},
				success: (resp) => {
					if (HttpCommons.successCheck(resp)) {
						resolve(resp.data.data)
					}
				},
				fail: (err) => {
					HttpCommons.commonFailHanlder(err)
					reject(err)
				}
			})
		})
	},
	
	/**
	 * 获得最近的聊天pair
	 * 
	 * @param {Number} offset
	 * @param {Number} count
	 */
	getLatestChats(offset, count) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.LATEST_CHAT_PAIR + '?offset=' + offset + '&count=' + count,
				header: HttpCommons.getAuthenticationHeader(),
				success: (resp) => {
					if (HttpCommons.successCheck(resp)) {
						resolve(resp.data.data)
					}
				},
				fail: (err) => {
					HttpCommons.commonFailHanlder(err)
					reject(err)
				}
			})
		})
	},
}