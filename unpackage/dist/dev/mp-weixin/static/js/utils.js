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
	 * 用于给日期补0  2018/1/1 -> 2018/01/01
	 * @param {Number} num
	 */
	dateDigitToString: function(num) {
		return num < 10 ? '0' + num : num; 
	},

	/**
	 * 将服务器传来的date字符串格式变成时候前端展示的格式
	 * 2020-04-04T20:36:56.000+0000 => {year, month, day, hour, minute, second, defaultDate, defaultTime, defaultDatetime}
	 * 
	 * @param {String} serverDate
	 * @return {Object}
	 */
	dateConverter: function(serverDate, withTimezone = true) {
		if (!serverDate) {
			return null
		}

		// console.log("解析时间", serverDate);
		let ts = Date.parse(serverDate)
		let date = {}
		if (withTimezone) {
			date = new Date(ts - 13 * 3600 * 1000) // spring序列化后的时间有13小时时差
		} else {
			date = new Date(ts)
		}
		let [year, month, day, hour, minute, second] = [date.getFullYear(), this.dateDigitToString(date.getMonth() + 1), this.dateDigitToString(date.getDate()), this.dateDigitToString(date.getHours()),
			this.dateDigitToString(date.getMinutes()), this.dateDigitToString(date.getSeconds()),
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
	},
	
	/**
	 * 批量转换日期(datetime)，传入对象和所需转换的字段名
	 */
	dateConverterBatch: function(obj, withTimezone, ...args) {
		for (let arg of args) {
			if (obj[arg]) {
				let dateObj = this.dateConverter(obj[arg], withTimezone)
				obj[arg] = dateObj ? dateObj.defaultDatetime : null;
			}
		}
	},
	
	/**
	 * 同上，不过传入的是js的Date对象
	 * 
	 * @param {Object} date
	 */
	jsDateConverter: function(date) {
		if (!date) {
			return null
		}
	
		let [year, month, day, hour, minute, second] = [date.getFullYear(), this.dateDigitToString(date.getMonth() + 1), this.dateDigitToString(date.getDate()), this.dateDigitToString(date.getHours()),
			this.dateDigitToString(date.getMinutes()), this.dateDigitToString(date.getSeconds()),
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
