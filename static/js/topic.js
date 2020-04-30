import ApiReference from './api_reference.js'
import HttpCommons from './http_commons.js'

export default {
	/**
	 * @param {Number} courseId
	 * @param {String} title
	 * @param {String} content
	 * @return {Promise}
	 */
	createTopic: function(courseId, title, content) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.TOPIC + '?courseId=' + courseId,
				method: "POST",
				header: HttpCommons.getAuthenticationHeader(),
				data: {
					title,
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
	
	deleteTopic: function(topicId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.TOPIC + '?topicId=' + topicId,
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
		})
	},

	/**
	 * @param {String} courseId
	 * @param {String} sortBy {createTime, updateTime, like, comment}
	 */
	getTopics: function(courseId, sortBy, offset, count) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.GET_TOPICS_BY_COURSE + '?courseId=' + courseId + '&sortBy=' + sortBy + '&offset=' + offset +
					'&count=' + count,
				method: "GET",
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

	getTopic: function(topicId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.GET_TOPIC + '?topicId=' + topicId,
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
	
	likeTopic: function(topicId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.LIKE + '?targetId=' + topicId + '&type=0',
				method:"POST",
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
	
	unlikeTopic: function(topicId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.LIKE + '?targetId=' + topicId + '&type=0',
				method:"DELETE",
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
	
	likeComment: function(commentId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.LIKE + '?targetId=' + commentId + '&type=1',
				method:"POST",
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
	
	unlikeComment: function(commentId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.LIKE + '?targetId=' + commentId + '&type=1',
				method:"DELETE",
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
	 * @param {String} content
	 * @param {Number} parentId 根据type不同,传入topicId 或者 parentCommentId
	 * @param {Number} type 0 === 帖子评论  1 === 子评论
	 */
	createComment: function(content, parentId, type) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.COMMENT,
				method: "POST",
				header: HttpCommons.getAuthenticationHeader(),
				data: {
					content,
					parentId,
					type
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
	
	deleteComment: function(commentId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.COMMENT + '?id=' + commentId,
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
		})
	},

	/**
	 * @param {Number} commentId
	 */
	getComment: function(commentId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.COMMENT + '?id=' + commentId,
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
	 * @param {Number} parentId  type == 0 topicId,    type == 1 topTopicCommentId
	 * @param {Number} type  0 --- 帖子评论   1 --- 子评论
	 * @param {Number} offset
	 * @param {Number} count
	 */
	getComments: function(parentId, type, offset, count) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.GET_COMMENT_LIST + '?parentId=' + parentId + '&type=' + type + '&offset=' + offset +
					'&count=' + count,
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
