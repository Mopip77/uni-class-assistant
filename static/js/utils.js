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
	 * {2020, 04, }
	 * 
	 * @param {String} serverDate
	 * @return {Object}
	 */
	dateConverter: function(serverDate) {
		if (!serverDate) {
			return null
		}
		
		let year = parseInt(serverDate.substr(0, 4))
		let month = parseInt(serverDate.substr(5, 2))
		let day = parseInt(serverDate.substr(8, 2))
		let hour = parseInt(serverDate.substr(11, 2))
		let minute = parseInt(serverDate.substr(14, 2))
		let second = parseInt(serverDate.substr(17, 2))

		if (!(isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute) || isNaN(second))) {
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
		} else {
			return null
		}
	}
}