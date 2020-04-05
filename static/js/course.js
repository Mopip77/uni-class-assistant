import ApiReference from './api_reference.js'
import HttpCommons from './http_commons.js'

export default {

	getCourse: function(courseId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.GET_COURSE + '?courseId=' + courseId,
				header: HttpCommons.getAuthenticationHeader(),
				success: (resp) => {
					if (HttpCommons.successCheck(resp)) {
						resolve(resp.data.data)
					}
				},
				fail: (err) => {
					HttpCommons.commonFailHanlder(err)
				}
			})
		});
	},

	/**
	 * 获取我的课程列表
	 * 
	 * @param {Number} type  0:我教的课  1:我参与的课
	 * @return {Object} 课程列表
	 */
	listCourse: function(type, offset = 0, count = 10) {
		let url = type === 0 ? ApiReference.GET_TEACHED_COURSE : ApiReference.GET_JOINED_COURSE;

		return new Promise((resolve, reject) => {
			console.log("请求");
			uni.request({
				url: url + '?offset=' + offset + '&count=' + count,
				header: HttpCommons.getAuthenticationHeader(),
				success: (resp) => {
					if (HttpCommons.successCheck(resp)) {
						resolve(resp.data.data)
					}
				},
				fail: (err) => {
					HttpCommons.commonFailHanlder(err)
				}
			})
		});
	},

	/**
	 * @param {String} courseName
	 * @param {String} classInfo
	 */
	createCourse: function(courseName, classInfo) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.CREATE_COURSE,
				method: "POST",
				header: HttpCommons.getAuthenticationHeader(),
				data: {
					courseName,
					classInfo
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
		});
	},
	
	joinCourse: function(courseId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.JOIN_COURSE + '?courseId=' + courseId,
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
		});
	},
	
	deleteCourse: function(courseId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.DELETE_COURSE + '?courseId=' + courseId,
				method: "DELETE",
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
		});
	},
	
	exitCourse: function(courseId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.EXIT_COURSE + '?courseId=' + courseId,
				method: "DELETE",
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
		});
	},
}
