import ApiReference from './api_reference.js'
import HttpCommons from './http_commons.js'

export default {
	
	/**
	 * @param {Number} courseId
	 * @param {Object} bulletinContent
	 */
	createBulletin: function(courseId, bulletinContent) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.CREATE_BULLETIN + '?courseId=' + courseId,
				method: "POST",
				header: HttpCommons.getAuthenticationHeader(),
				data: {
					content: bulletinContent
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
	 * 
	 */
	listBulletin: function(courseId, offset = 0, count = 10) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.GET_BULLETIN + '?courseId=' + courseId + '&offset=' + offset + '&count=' + count,
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
	}
}