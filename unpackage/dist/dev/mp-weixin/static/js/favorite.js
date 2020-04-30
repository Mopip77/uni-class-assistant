import ApiReference from './api_reference.js'
import HttpCommons from './http_commons.js'

export default {
	
	OBJECTIVE_QUESTION_TYPE: 1,
	SUBJECTIVE_QUESTION_TYPE: 2,
	COURSE_WARE_TYPE: 3,
	TOPIC_TYPE: 4,
	
	/**
	 * @param {Number} targetType
	 * @param {Object} targetId
	 */
	exist: function(targetType, targetId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.FAVORITE_EXIST + '?targetType=' + targetType + '&targetId=' + targetId,
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
	 * @param {Number} targetType
	 * @param {Object} targetId
	 */
	favorite: function(targetType, targetId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.FAVORITE,
				method: "POST",
				data: {
					targetType, 
					targetId
				},
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
	 * @param {Number} targetType
	 * @param {Object} targetId
	 */
	unFavorite: function(targetType, targetId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.FAVORITE + '?targetType=' + targetType + '&targetId=' + targetId,
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
	 * @param {Array} targetTypes
	 * @param {Number} offset
	 * @param {Number} count
	 */
	getFavoritesByType: function(targetTypes, offset, count) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.FAVORITE_BY_TYPE + '?targetTypes=' + targetTypes + '&offset=' + offset + '&count=' + count,
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
	
	deleteFavorite: function(favoriteId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.FAVORITE_BY_ID + '?favoriteId=' + favoriteId,
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
}