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
	dateConverter: function(serverDate) {
		if (!serverDate) {
			return null
		}

		// console.log("解析时间", serverDate);
		let ts = Date.parse(serverDate)
		let date = new Date(ts)
		// console.log("解析后", date);
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
	},
	
	/**
	 * 批量转换日期(datetime)，传入对象和所需转换的字段名
	 */
	dateConverterBatch: function(obj, ...args) {
		for (let arg of args) {
			if (obj[arg]) {
				let dateObj = this.dateConverter(obj[arg])
				obj[arg] = dateObj ? dateObj.defaultDatetime : null;
			}
		}
	},
	
	/**
	 * 批量转换日期(datetime)，传入对象和所需转换的字段名，只不过返回的是格式化后的字符串
	 */
	dateConverterBatchFormatted: function(obj, ...args) {
		for (let arg of args) {
			if (obj[arg]) {
				
				let ts = Date.parse(obj[arg])
				let date = new Date(ts)
				let result = this.formatDateString(date)
				obj[arg] = result
			}
		}
	},
	
	/**
	 * 假设传入2020-04-01 12:23:22
	 * 
	 * 返回格式化的日期时间显示
	 *   如果是当天则返回时间 12:23:22
	 *   如果是前天或昨天则返回 前天/昨天 12:23:22
	 *   否则只返回日期 2020-04-01
	 * 
	 * @param {Date} date
	 */
	formatDateString(date) {
		date = new Date(date)
		let dateTs = date.getTime();
		if (!dateTs) {
			return '';
		}
		
		let todayTs = new Date(new Date().toLocaleDateString()).getTime();
		let yestodayTs = todayTs - 3600 * 1000 * 24 * 1;
		let tbfyTs = todayTs - 3600 * 1000 * 24 * 2;
		
		let dateObj = this.jsDateConverter(date)
		
		if (dateTs >= todayTs) {
			return dateObj.defaultTime;
		} else if (dateTs >= yestodayTs) {
			return '昨天 ' + dateObj.defaultTime;
		} else if (dateTs >= tbfyTs) {
			return '前天 ' + dateObj.defaultTime;
		} else {
			return dateObj.defaultDate;
		}
	}
}
