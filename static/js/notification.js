import ApiReference from './api_reference.js'
import HttpCommons from './http_commons.js'

export default {

	createNotifcation: function(courseId, title, content, publishGmt = null) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.NOTIFICATION,
				method: "POST",
				header: HttpCommons.getAuthenticationHeader(),
				data: {
					courseId,
					title,
					content,
					publishGmt
				},
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
	
	getNotification: function(notificationId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.NOTIFICATION + '?notificationId=' + notificationId,
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
	
	getNotifications: function(offset, count) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.NOTIFICATION_LIST + '?offset=' + offset + '&count=' + count,
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
	
	getCallbackUrl: function(notificationId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.NOTIFICATION_CALLBACK_URL + '?notificationId=' + notificationId,
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
	}

}
