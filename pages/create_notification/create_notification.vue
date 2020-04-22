<template>
	<view>
		
		<van-notify class="on-top" id="van-notify" />
		
		<view class="title">
			<text>发布通知</text>
			<van-button custom-class="my-button" square type="primary" @tap="createNotification">发布</van-button>
		</view>
		
		<view class="date-box publish-date-box">
			<view class="line-1">
				<text>定时发布</text>
				<switch @change="switchChange($event, 'publishDate')" />
			</view>
		
			<view v-if="usePublishDate" class="line-2">
				<van-button square type="primary" @tap="onPicker('publishDate')">选择时间</van-button>
				<text class="time">发布时间为: {{formatPublishDate}}</text>
		
				<w-picker mode="shortTerm" :value="formatPublishDate" :current="true" expand="30" @confirm="onConfirm($event)"
				 ref="publishDate"></w-picker>
			</view>
		</view>
		
		<view class="box notification-title-box">
			<view class="sub-title">
				通知标题
			</view>
			<input type="text" v-model="title" />
		</view>
		
		<view class="box notification-content-box">
			<view class="sub-title">
				通知内容
			</view>
			<textarea v-model="content" placeholder="请输入通知内容..." />
		</view>
		
	</view>
</template>

<script>
	import VanNotify from "@/wxcomponents/vant/dist/notify/index.js";
	import Notify from "@/wxcomponents/vant/dist/notify/notify.js";
	import Button from "@/wxcomponents/vant/dist/button/index.js";
	
	import WPicker from '@/components/w-picker/w-picker.vue'
	
	import CommonUtils from '@/static/js/utils.js'
	import NotificationUtils from '@/static/js/notification.js'
	
	export default {
		components: {
			"w-picker": WPicker,
			"van-notify": VanNotify,
			"van-button": Button,
		},
		
		data() {
			return {
				courseId: 0,
				usePublishDate: false,
				publishDate: new Date(),
				
				title: '',
				content: ''
			}
		},
		
		computed: {
			formatPublishDate() {
				let dateObj = CommonUtils.jsDateConverter(this.publishDate)
				return dateObj ? dateObj.defaultDatetime.substr(0, dateObj.defaultDatetime.length - 3) : '日期错误';
			},
		},
		
		methods: {
			
			// component
			switchChange(e) {
				this.usePublishDate = e.detail.value
			},
			// invoke w-picker
			onPicker(type) {
				this.$refs[type].show();
			},
			// w-picker选择时间后确定后的调用
			onConfirm(e) {
				// 传入有e有两种格式，一种是"今天 17:01:02"， 一种是"2020-12-12 17:01:02"
				let selectDate = null
				if (typeof e.obj.date === 'object') {
					selectDate = new Date(e.obj.date.value + ' ' + e.obj.hour.value + ':' + e.obj.minute.value)
				} else {
					selectDate = new Date(e.value)
				}
			
				this.publishDate = selectDate
			},
			
			createNotification() {
				let title = this.title
				let content = this.content
				
				if (!title) {
					Notify({
						type: 'danger',
						message: '通知标题不能为空'
					})
					return;
				}
				
				if (!content) {
					Notify({
						type: 'danger',
						message: '通知内容不能为空'
					})
					return;
				}
				
				let now = new Date();
				if (this.usePublishDate && now > this.publishDate) {
					Notify({
						type: 'danger',
						message: '发布时间不能早于现在'
					})
					return;
				}
				
				let promise = NotificationUtils.createNotifcation(this.courseId, title, content,this.usePublishDate ? this.formatPublishDate : null )
				promise
				.then(data => {
					uni.navigateBack()
				})
			},
		},
		
		onLoad(option) {
			this.courseId = option.courseId
			if (!this.courseId) {
				
			}
		}
	}
</script>

<style lang="scss">
	@import '~@/static/css/common.scss';
	.on-top {
		position: fixed;
		z-index: 9988;
	}
	
	.title {
		margin: 20rpx 10rpx;
		font-size: 50rpx;
		font-weight: 600;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		
		.my-button {
			margin-left: auto;
			margin-right: 18rpx;
			width: 120rpx;
			height: 70rpx;
			margin-left: 24rpx;
			border-radius: 6rpx;
		}
	}
	
	.date-box {
		display: flex;
		flex-direction: column;
		padding: 0 10rpx;
	
		switch {
			transform: scale(.7);
			margin-left: 10rpx;
		}
	
		button {
			height: 60rpx;
			width: 180rpx;
		}
	
		.line-2 {
			display: flex;
			align-items: center;
			margin-top: 20rpx;
	
			.time {
				font-size: 28rpx;
				margin-left: 8rpx;
				// margin-left: 18rpx;
				color: #616161;
			}
		}
	}
	
	.box {
		margin-bottom: 40rpx;
		margin-top: 60rpx;
	
		.sub-title {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 6rpx;
			font-size: 42rpx;
			font-weight: 400;
			background-color: #4FC3F7;
		}
		
		input {
			@include common-input;
		}
		
		textarea {
			@include common-textarea;
		}
	}

</style>
