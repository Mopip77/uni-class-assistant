import ApiReference from '@/static/js/api_reference.js'
import HttpCommons from '@/static/js/http_commons.js'

export default {
	
	/**
	 * @param {String} courseWareId
	 */
	getCourseWare: function(courseWareId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.COURSE_WARE + '?courseWareId=' + courseWareId,
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
	 * 通过courseId获取课件
	 */
	getCourseWareByCourseId: function(courseId, offset = 0, count = 10) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.GET_COURSE_WARE_BY_COURSEID + '?courseId=' + courseId + '&offset=' + offset + '&count=' + count,
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
	 * 获取用户-课件信息
	 * 
	 * @param {String} courseWareId
	 */
	getUserCourseWare: function(courseWareId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.USER_COURSE_WARE + '?courseWareId=' + courseWareId,
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
	 * 
	 * @param {String} courseWareId
	 * @param {Number} pageIdx
	 * @param {Number} readSeconds
	 */
	readPage: function(courseWareId, pageIdx, readSeconds) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.READ_COURSE_WARE + '?courseWareId=' + courseWareId + '&pageIndex=' + pageIdx + '&readSeconds=' + readSeconds,
				method: "POST",
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
	 */
	updateComment: function(courseWareId, comment) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.COURSE_WARE_COMMENT + '?courseWareId=' + courseWareId + '&comment=' + comment,
				method: "POST",
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