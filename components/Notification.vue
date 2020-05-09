<template>
	<view>
		
		<view class="title">
			<text>查看通知</text>
			<van-button custom-class="my-button" plain square type="primary" @tap="onCancel">返回</van-button>
		</view>
		
		<view class="notification-title">
			{{notification.title}}
		</view>
		
		<view class="notification-content">
			<text>{{notification.content}}</text>
		</view>
		
	</view>
</template>

<script>
	import Button from '@/wxcomponents/vant/dist/button/index.js'
	
	import CommonUtils from '@/static/js/utils.js'
	import NotificationUtils from '@/static/js/notification.js'

	export default {
		props: {
			notificationId: {
				type: Number,
				required: true
			},
		},
		components: {
			"van-button": Button,
		},

		data() {
			return {
				notification: {}
			}
		},

		methods: {
			// component
			onCancel() {
				this.$emit('closeModal')
			},
			
		},

		created() {
			let that = this
			let p = NotificationUtils.getNotification(this.notificationId)
			p.then(data => {
				CommonUtils.dateConverterBatch(data, 'publishGmt')
				that.notification = data
			})
		}
	}
</script>

<style lang="scss">
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
	
	.notification-title {
		margin: 100rpx 10rpx 10rpx 10rpx;
		font-size: 40rpx;
		font-weight: 600;
	}
	
	.notification-content {
		margin: 10rpx;
	}
</style>
