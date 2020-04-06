<template>
	<view>
		<van-notify id="van-notify" />

		<view class="title"><text>新建帖子</text></view>
		<view class="info-body">
			<view>
				<text>标题</text>
				<van-cell-group>
					<input type="text" v-model="title" placeholder="请输入标题" />
				</van-cell-group>
			</view>
			<view>
				<text>帖子正文</text>
				<van-cell-group>
					<textarea v-model="content" placeholder="请输入帖子正文(可留空)" />
				</van-cell-group>
			</view>
		</view>
		<view class="button-group">
			<van-button type="info" @tap="cancel()" custom-style="height: 70rpx;width: 140rpx;">取消</van-button>
			<van-button type="primary" @tap="submit()" custom-style="height: 70rpx;width: 140rpx;">发布</van-button>
		</view>
	</view>
</template>

<script>
	import Notify from "@/wxcomponents/vant/dist/notify/notify.js";
	import VanNotify from "@/wxcomponents/vant/dist/notify/index.js";
	import Buttonuu from "@/wxcomponents/vant/dist/button";

	import TopicUtils from '@/static/js/topic.js'

	export default {
		components: {
			"van-notify": VanNotify,
			"van-button": Buttonuu
		},
		data() {
			return {
				title: '',
				content: ''
			};
		},
		methods: {
			cancel() {
				uni.navigateBack();
			},
			submit() {
				let title = this.title.trim();
				let content = this.content.trim();

				if (!title) {
					Notify({
						type: "danger",
						message: "标题不能为空"
					});
					return;
				}

				let promise = TopicUtils.createTopic(this.courseId, title, content);

				promise.then(data => {
					Notify({
						type: "success",
						message: "发布成功"
					});

					// 通知前一页需要刷新
					let pages = getCurrentPages()
					let prevPage = pages[ pages.length - 2 ];
					prevPage.$vm.refreshOnShow = true;
					uni.navigateBack()
				});
			}
		},
		onLoad: function(option) {
			let courseId = option.courseId;
			if (!courseId) {
				Notify({
					type: "danger",
					message: "课程信息获取有误，请刷新重试"
				});
			} else {
				this.courseId = courseId
			}
		}
	};
</script>

<style lang="scss">
	@import "~@../../static/css/common.scss";

	.title {
		font-size: 50rpx;
		margin-top: 20rpx;
		margin-left: 20rpx;
		font-weight: bold;
	}

	.info-body {
		margin-top: 40rpx;

		view {
			margin-bottom: 15rpx;

			text {
				font-size: 28rpx;
				color: #424242;
				margin-left: 11rpx;
			}

			input {
				@include common-input;
			}
			
			textarea {
				@include common-textarea;
				margin-top: 4rpx;
			}
		}
	}

	.button-group {
		display: flex;
		justify-content: space-around;
		margin-top: 60rpx;
	}
</style>