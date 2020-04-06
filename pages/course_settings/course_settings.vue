<template>
	<view>
		<van-notify id="van-notify" />

		<view class="title"><text>课程信息</text></view>
		<view class="info-body">
			<view>
				<text>课程名</text>
				<van-cell-group>
					<input type="text" v-model="course.courseName" placeholder="请输入课程名" />
				</van-cell-group>
			</view>
			<view>
				<text>班级信息</text>
				<van-cell-group>
					<input type="text" v-model="course.classInfo" placeholder="请输入班级信息" />
				</van-cell-group>
			</view>
		</view>
		<view class="button-group">
			<van-button type="info" @tap="cancel()" custom-style="height: 70rpx;width: 140rpx;">取消</van-button>
			<van-button type="primary" @tap="submit()" custom-style="height: 70rpx;width: 140rpx;">保存</van-button>
		</view>
	</view>
</template>

<script>
	import Notify from "@/wxcomponents/vant/dist/notify/notify.js";
	import VanNotify from "@/wxcomponents/vant/dist/notify/index.js";
	import Buttonuu from "@/wxcomponents/vant/dist/button";

	import CourseUtils from "@/static/js/course.js";

	export default {
		components: {
			"van-notify": VanNotify,
			"van-button": Buttonuu
		},
		data() {
			return {
				course: {}
			};
		},
		methods: {
			cancel() {
				uni.navigateBack();
			},
			submit() {
				let courseName = this.course.courseName.trim();
				let classInfo = this.course.classInfo.trim();

				if (!courseName) {
					Notify({
						type: "danger",
						message: "课程名不能为空"
					});
					return;
				}

				if (!classInfo) {
					Notify({
						type: "danger",
						message: "班级信息不能为空"
					});
					return;
				}

				let promise = CourseUtils.updateCourse({
					id: this.course.id,
					courseName,
					classInfo
				});

				promise.then(data => {
					Notify({
						type: "success",
						message: "更新成功"
					});

					this.course = data;
					// 通知前一页需要刷新
					let pages = getCurrentPages()
					let prevPage = pages[ pages.length - 2 ];
					prevPage.$vm.refreshOnShow = true;
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
				let promise = CourseUtils.getCourse(courseId);
				promise.then(data => {
					this.course = data;
				});
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
		}
	}

	.button-group {
		display: flex;
		justify-content: space-around;
		margin-top: 60rpx;
	}
</style>
