import ApiReference from './api_reference.js'
import HttpCommons from './http_commons.js'

export default {
	
	/**
	 * 检查测试(只包括作业和考试)的各个时间的逻辑是否合理。
	 * 
	 * 1、边界检查
	 * 2、搭配类型检查
	 * 3、时间范围检查
	 * 
	 * @param {Date} publishDate
	 * @param {Date} deadlineDate
	 * @param {Number} limitMinutes
	 * @return {Object} {"value": bool, "msg": 错误信息}
	 */
	isDateRelationValid(publishDate, deadlineDate, limitMinutes) {
		// console.log("params", publishDate, deadlineDate, limitMinutes);
		let now = new Date()
		
		// 两者必有一
		if (null === publishDate && null === deadlineDate) {
			return {value: false, msg: '开始和截止时间必有一个'};
		}
		
		// 只有publishDate
		if (null === deadlineDate && publishDate) {
			if (publishDate < now) {
				return {value: false, msg: '开始时间早于现在'};
			}
			
			if (null == limitMinutes || limitMinutes <= 0) {
				return {value: false, msg: '只有开始时间, 未设置限时'};
			}
			return {value: true, msg: ''};
		}
		
		// 只有deadlineDate
		if (null === publishDate && deadlineDate) {
			if (null == limitMinutes || limitMinutes <= 0) {
				limitMinutes = 0;
			}
			
			let atLeastDate = new Date(now.getTime() + limitMinutes * 60 * 1000)
			if (atLeastDate > deadlineDate) {
				return {value: false, msg: '现在到截止时间不足限时的时间范围'};
			}
			return {value: true, msg: ''};
		}
		
		// 两者都有
		if (publishDate < now) {
			return {value: false, msg: '开始时间早于现在'};
		}
		
		if (null != limitMinutes && limitMinutes > 0) {
			let atLeastDate = new Date(publishDate.getTime() + limitMinutes * 60 * 1000)
			if (atLeastDate > deadlineDate) {
				return {value: false, msg: '开始时间到截止时间不足限时的时间范围'};
			}
		}
		
		return {value: true, msg: ''};
	},
	
	/**
	 * 创建contest
	 * @param {Object} contest
	 */
	createContest(contest) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.CONTEST,
				method: "POST",
				header: HttpCommons.getAuthenticationHeader(),
				data: contest,
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
	 * 删除contest
	 * @param {String} contestId
	 */
	deleteContest(contestId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.CONTEST + '?contestId=' + contestId,
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
	 * 通过courseId获取试卷
	 * 
	 * @param {Number} courseId
	 * @param {Number} offset
	 * @param {Number} count
	 */
	getContestByCourseId(courseId, offset, count) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.GET_CONTESTS_BY_COURSEID + '?courseId=' + courseId + '&offset=' + offset + '&count=' + count,
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
	 * @param {String} contestId
	 */
	getContestById(contestId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.CONTEST + '?contestId=' + contestId,
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
	 * 通过contestId获取contest详细内容
	 * 
	 * @param {Number} contestId
	 */
	getContestDetail(contestId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.GET_CONTEST_DETAIL + '?contestId=' + contestId,
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
	 * 通过contestId获取answer
	 * 
	 * @param {Number} contestId
	 */
	getAnswer(contestId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.ANSWER + '?contestId=' + contestId,
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
	 * @param {Object} answer
	 */
	updateAnswer(answer) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.ANSWER,
				method: "PUT",
				data: answer,
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
	 * 计算出测试剩余时间(毫秒)
	 * 
	 * @param {String} answerStartDate
	 * @param {String} publishDate
	 * @param {String} deadline
	 * @param {Number} limitMinutes
	 */
	getLeftDate(answerStartDate, publishDate, deadline, limitMinutes) {
		if (answerStartDate) {answerStartDate = answerStartDate.replace(/-/g, '/')}
		if (publishDate) {publishDate = publishDate.replace(/-/g, '/')}
		if (deadline) {deadline = deadline.replace(/-/g, '/')}
		
		let now = new Date()
		// console.log("获取剩余时间", answerStartDate, publishDate, deadline, limitMinutes);
		
		if (limitMinutes === 0) {
			// 不限时
			return new Date(deadline) - now
		} else {
			// 限时
			if (deadline) {
				// 如果有截止时间，就比较用户开始时间+限时 和 截止时间哪个大
				
				// 用户开始答题时刻 + 限时的剩余时间
				let leftTimeToBeginTime = new Date(answerStartDate).getTime() + limitMinutes * 60 * 1000 - now
				// console.log("leftTimeToBeginTime", leftTimeToBeginTime);
				
				// 截止时间（起始时间+限时或结束时间）的剩余时间
				let leftTimeBeforeDeadline = new Date(deadline) - now
				// console.log("leftTimeBeforeDeadline", leftTimeBeforeDeadline);
				// 返回小的
				return leftTimeToBeginTime < leftTimeBeforeDeadline ? leftTimeToBeginTime : leftTimeBeforeDeadline
			} else {
				// 如果没有截止时间，那么剩余时间就是发布时间+限时-现在
				return new Date(publishDate).getTime() + limitMinutes * 60 * 1000 - now
			}
		}
	},
	
	/**
	 * 计算出测试剩余时间(毫秒)，用于老师，就不考虑学生何时开始考试的时间
	 * 
	 * @param {String} publishDate
	 * @param {String} deadline
	 * @param {Number} limitMinutes
	 */
	getLeftDateForTeacher(publishDate, deadline, limitMinutes) {
		if (publishDate) {publishDate = publishDate.replace(/-/g, '/')}
		if (deadline) {deadline = deadline.replace(/-/g, '/')}
		
		let now = new Date()
		
		if (deadline) {
			return new Date(deadline).getTime() - now
		} else {
			return new Date(publishDate).getTime() + limitMinutes * 60 * 1000 - now
		}
	},
	
	/**
	 * 根据contestId获取所有学生的试卷
	 * @param {String} contestId
	 */
	getAnswerList(contestId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.ANSWER_LIST + '?contestId=' + contestId,
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
	 * 根据用户id和测试id获得该用户的试卷
	 * 
	 * @param {Number} userId
	 * @param {String} contestId
	 */
	getReviseAnswer(userId, contestId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.REVISE_ANSWER + '?contestId=' + contestId + '&userId=' + userId,
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
	
	updateRevise(answerId, subjectiveScores) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.REVISE_ANSWER + '?answerId=' + answerId + '&subjectiveScores=' + subjectiveScores,
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
	
	getContestAsCreator(offset, count) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.GET_CONTEST_AS_CREATOR + '?offset=' + offset + '&count=' + count,
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
	
	getContestAsParticipator(offset, count) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.GET_CONTEST_AS_PARTICIPATOR + '?offset=' + offset + '&count=' + count,
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
	
	publish: function(contestId) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: ApiReference.PUBLISH_CONTEST + '?contestId=' + contestId,
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