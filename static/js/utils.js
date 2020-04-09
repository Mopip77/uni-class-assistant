import LSReference from './local_storage_reference.js'

export default {

	/**
	 * @param {Number} ts 
	 */
	isTimestampValid: function(ts) {
		if (null === ts) {
			return false;
		}

		return ts - new Date().getTime() > 0;
	},

	/**
	 * 将服务器传来的date字符串格式变成时候前端展示的格式
	 * 2020-04-04T20:36:56.000+0000 => {year, month, day, hour, minute, second, defaultDate, defaultTime, defaultDatetime}
	 * 
	 * @param {String} serverDate
	 * @return {Object}
	 */
	dateConverter: function(serverDate) {
		if (!serverDate) {
			return null
		}

		let ts = Date.parse(serverDate)
		let date = new Date(ts - 13 * 3600 * 1000) // spring序列化后的时间有13小时时差
		let [year, month, day, hour, minute, second] = [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(),
			date.getMinutes(), date.getSeconds(),
		]

		return {
			year,
			month,
			day,
			hour,
			minute,
			second,
			defaultDate: year + '-' + month + '-' + day,
			defaultTime: hour + ':' + minute + ':' + second,
			defaultDatetime: year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
		}
	}
}
