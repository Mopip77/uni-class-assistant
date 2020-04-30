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
	 * 获取创建的课程
	 */
	listCoursesAsCreator: function(offset = 0, count = 10) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.GET_CREATED_COURSE + '?offset=' + offset + '&count=' + count,
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
	 * 获取教授的课程
	 */
	listCoursesAsTeacher: function(offset = 0, count = 10) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.GET_TEACHED_COURSE + '?offset=' + offset + '&count=' + count,
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
	 * 获取学习的课程
	 */
	listCoursesAsStudent: function(offset = 0, count = 10) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.GET_JOINED_COURSE + '?offset=' + offset + '&count=' + count,
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
	
	joinCourse: function(courseId, password) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.JOIN_COURSE + '?courseId=' + courseId + '&password=' + password,
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

	/**
	 * 更新course 信息，服务端会校验，只允许更新courseName和classInfo
	 * 
	 * @param {Object} course 
	 */
	updateCourse: function(course) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.UPDATE_COURSE,
				method: "PUT",
				header: HttpCommons.getAuthenticationHeader(),
				data: {
					id: course.id,
					courseName: course.courseName,
					classInfo: course.classInfo
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
	
	getCourseMembers(courseId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.GET_MEMBERS + '?courseId=' + courseId,
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
	
	kickoutUser(kickedUserId, courseId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.KICK_OUT_MEMBER + '?courseId=' + courseId + '&kickedUserId=' + kickedUserId,
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
	
	assignTeacher(assignedUserId, courseId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.ASSIGN_TEACHER + '?targetUserId=' + assignedUserId + '&courseId=' + courseId,
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
		});
	},
	
	assignTeacher(assignedUserId, courseId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.ASSIGN_TEACHER + '?targetUserId=' + assignedUserId + '&courseId=' + courseId,
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
		});
	},
	
	/**
	 * @param {Number} courseId
	 */
	getScoreRule(courseId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.SCOER_RULE + '?courseId=' + courseId,
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
	
	updateScoreRule(rule) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.SCOER_RULE,
				method: "POST",
				data: rule,
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
	
	/**
	 * @param {Number} courseId
	 */
	scoreCal(courseId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.SCOER_CAL + '?courseId=' + courseId,
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
	
	/**
	 * @param {Number} courseId
	 */
	getStudentScoreList(courseId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.GET_STUDENT_SCORE + '?courseId=' + courseId,
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
	}
}
