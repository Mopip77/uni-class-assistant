import ApiReference from '@/static/js/api_reference.js'
import HttpCommons from '@/static/js/http_commons.js'

export default {
	
	/**
	 * @param {Object} classObj
	 */
	createClass: function(classObj) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.CLASS,
				method: "POST",
				header: HttpCommons.getAuthenticationHeader(),
				data: classObj,
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
	 * @param {Number} courseId
	 */
	getClassByCourseId: function(courseId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.GET_CLASS_BY_COURSE_ID + '?courseId=' + courseId,
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
	 * @param {Number} classId
	 */
	getClassById: function(classId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.CLASS + '?classId=' + classId,
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
	
	getClassInfoAsTeacher: function(classId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.GET_CLASS_INFO_AS_TEACHER + '?classId=' + classId,
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
	
	getClassInfoAsStudent: function(classId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.GET_CLASS_INFO_AS_STUDENT + '?classId=' + classId,
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
	
	publishClass: function(classId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.PUBLISH_CLASS + '?classId=' + classId,
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
	
	finishClass: function(classId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.FINISH_CLASS + '?classId=' + classId,
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
	
	startSignIn: function(classId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.START_SIGN_IN + '?classId=' + classId,
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
	
	getSignInCount: function(classId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.SIGN_IN_COUNT + '?classId=' + classId,
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
	
	signIn: function(classId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.SIGN_IN + '?classId=' + classId,
				method: "PUT",
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
	
	updateNote: function(classId, note) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.CLASS_NOTE + '?classId=' + classId,
				method: "PUT",
				header: HttpCommons.getAuthenticationHeader(),
				data: note,
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