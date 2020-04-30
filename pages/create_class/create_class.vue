<template>
	<view>
		<van-notify class="on-top" id="van-notify" />

		<view v-if="showCourseWareModal" class="on-top">
			<!-- 只用于上传课件 -->
			<SingleSubmitPopup type="textarea" title="发布课件" fieldName="课件名" placeHolder="请输入课件名..." submitText="上传文件"
			 :contentNullable="false" :contentIsNumber="false" @closeModal="closeCourseWareModal" @successCallBack="submitCourseWareCallBack" />
		</view>

		<view v-if="showQuizModal" class="on-base">
			<!-- 只用于上传课件 -->
			<CreateQuiz :courseId="courseId" @closeModal="closeQuizModal" @successCallBack="submitQuizCallBack" />
		</view>

		<!-- 用于上传课件 -->
		<l-file ref="lFile" @up-success="upSuccess"></l-file>

		<view class="title">
			创建课堂

			<view class="my-button-group">
				<van-button custom-class="my-button" plain square type="primary" @tap="onCancel">取消</van-button>
				<van-button custom-class="my-button" square type="primary" @tap="createClass">创建</van-button>
			</view>
		</view>

		<view class="box class-name-box">
			<view class="header">
				<view class="sub-title">
					课堂名
				</view>
			</view>

			<input type="text" v-model="className" />
		</view>

		<view class="box course-ware-box">

			<view class="header">
				<view class="sub-title">
					课件 ({{courseWares.length}} / {{MAX_COURSE_WARE_SIZE}})
				</view>
				<van-button custom-class="button" square type="primary" @tap="addCourseWare">+</van-button>
			</view>

			<view class=" list course-ware-list">
				<view class="item course-ware-item" v-for="(courseWare, idx) in courseWares" :key="idx">
					<van-swipe-cell right-width="65" async-close>
						<view class="swipe-cell-field" slot="right" @tap="deleteCourseWare(idx)">删除</view>
						<view class="content">{{courseWare.title}}</view>
					</van-swipe-cell>
				</view>
			</view>

		</view>

		<view class="box contest-box">
			<view class="header">
				<view class="sub-title">
					随堂测试 ({{contests.length}} / {{MAX_CONTEST_SIZE}})
				</view>
				<van-button custom-class="button" square type="primary" @tap="addQuiz">+</van-button>
			</view>

			<view class="list contest-list">
				<view class="item contest-item" v-for="(contest, idx) in contests" :key="idx">
					<van-swipe-cell right-width="65" async-close>
						<view class="swipe-cell-field" slot="right" @tap="deleteQuiz(idx)">删除</view>
						<view class="content">QUIZ {{idx + 1}}</view>
					</van-swipe-cell>
				</view>
			</view>
		</view>

	</view>
</template>

<script>
	import VanNotify from "@/wxcomponents/vant/dist/notify/index.js";
	import Notify from "@/wxcomponents/vant/dist/notify/notify.js";
	import Button from "@/wxcomponents/vant/dist/button/index.js";
	import SwipeCell from '@/wxcomponents/vant/dist/swipe-cell/index.js'

	import CreateQuiz from '@/components/CreateQuiz.vue'
	import SingleSubmitPopup from "@/components/SingleSubmitPopup.vue";
	import lFile from '@/components/l-file/l-file.vue';

	import ClassUtils from '@/static/js/class.js'
	import CourseWareUtils from '@/static/js/course_ware.js'
	import ContestUtils from '@/static/js/contest.js'
	import HttpCommons from '@/static/js/http_commons.js'
	import ApiReference from '@/static/js/api_reference.js'

	export default {
		components: {
			SingleSubmitPopup,
			lFile,
			CreateQuiz,
			'van-swipe-cell': SwipeCell,
			"van-button": Button,
			"van-notify": VanNotify,
		},
		data() {
			return {
				MAX_COURSE_WARE_SIZE: 3,
				MAX_CONTEST_SIZE: 2,

				courseId: 0,
				courseWares: [],
				contests: [],
				className: '',

				tempCourseWareName: '',
				showCourseWareModal: false,
				showQuizModal: false,
			}
		},
		methods: {
			onCancel() {
				uni.navigateBack()
			},

			createClass() {
				
				if (!this.className.trim()) {
					Notify({
						type: 'danger',
						message: '课件名不能为空',
					});
					return;
				}
				
				let classObj = {
					className: this.className,
					courseId: this.courseId,
					courseWareIds: this.courseWares.map(e => e.id),
					quizIds: [...this.contests]
				}
				let p = ClassUtils.createClass(classObj)
				p.then(() => {
					uni.navigateBack()
				})
			},

			// 上传课件后的callback
			upSuccess(resp) {
				if (HttpCommons.successCheck(resp)) {
					Notify({
						type: 'success',
						message: '课件上传成功',
					});

					// 载入列表
					this.courseWares.push({
						title: this.tempCourseWareName,
						id: resp.data.data.id
					})
				}
			},

			addCourseWare() {
				if (this.courseWares.length >= this.MAX_COURSE_WARE_SIZE) {
					Notify({
						type: 'danger',
						message: '创建课件超出上限'
					})
					return;
				}

				this.showCourseWareModal = true;
			},

			deleteCourseWare(idx) {
				if (idx < 0 || idx >= this.courseWares.length) {
					Notify({
						type: 'danger',
						message: '删除课件索引错误'
					})
					return;
				}

				let p = CourseWareUtils.deleteCourseWare(this.courseWares[idx].id)
				p.then(() => {
					this.courseWares.splice(idx, 1)
				})
			},

			addQuiz() {
				if (this.contests.length >= this.MAX_CONTEST_SIZE) {
					Notify({
						type: 'danger',
						message: '创建随堂测试超出上限'
					})
					return;
				}

				this.showQuizModal = true
			},

			deleteQuiz(idx) {
				if (idx < 0 || idx >= this.contests.length) {
					Notify({
						type: 'danger',
						message: '删除随堂测试索引错误'
					})
					return;
				}

				let p = ContestUtils.deleteContest(this.contests[idx])
				p.then(() => {
					this.contests.splice(idx, 1)
				})
			},

			closeQuizModal() {
				this.showQuizModal = false
			},

			closeCourseWareModal() {
				this.showCourseWareModal = false
			},

			submitQuizCallBack(quizId) {
				this.contests.push(quizId)
			},

			submitCourseWareCallBack(courseWareName) {
				this.tempCourseWareName = courseWareName

				let that = this;
				that.$refs.lFile.upload({
					// #ifdef APP-PLUS
					currentWebview: that.$mp.page.$getAppWebview(),
					// #endif
					url: ApiReference.UPLOAD_COURSE_WARE,
					name: 'file',
					header: HttpCommons.getAuthenticationHeader(),
					formData: JSON.stringify({
						displayName: courseWareName,
						courseId: that.courseId,
						published: false
					})
				});
			}
		},

		onLoad(option) {
			this.courseId = Number(option.courseId)

			if (!this.courseId) {
				Notify({
					type: 'danger',
					message: '未传入课程号'
				})

				setTimeout(() => {
					uni.navigateBack()
				}, 500);
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

	.on-base {
		position: absolute;
		z-index: 6688;
		width: 100%;
		height: 100%;
		background-color: $global-background-color;
	}

	.title {
		margin: 20rpx 10rpx;
		font-size: 50rpx;
		font-weight: 600;
		margin-bottom: 100rpx;
		display: flex;
		align-items: flex-end;

		.icon {
			font-size: 40rpx;
			color: gray;
			margin-left: 10rpx;
			margin-bottom: 10rpx;
		}

		.my-button-group {
			margin-left: auto;
			margin-right: 18rpx;

			.my-button {
				width: 120rpx;
				height: 70rpx;
				margin-left: 24rpx;
				border-radius: 6rpx;
			}
		}
	}

	.box {
		padding: 10rpx;
		margin-bottom: 40rpx;
		margin-top: 60rpx;

		.header {
			border-bottom: 0.5px solid gray;
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 28rpx;
			padding-bottom: 10rpx;


			.sub-title {
				font-size: 42rpx;
				font-weight: 400;
			}

			.button {
				height: 50rpx;
				margin-right: 10px;
				padding: 4rpx 40rpx;
			}
		}

		input {
			@include common-input;
		}
	}

	.list {
		display: flex;
		flex-wrap: wrap;

		.item {
			@include common-card;
			height: auto;
			display: flex;
			flex-direction: column;
			background-image: $card-background-url;

			.swipe-cell-field {
				font-size: 40rpx;
				text-decoration: underline;
				font-weight: bold;
				color: #D84315;
				top: 50%;
				margin-top: 28rpx;
				margin-left: 17rpx;
			}

			.content {
				padding: 30rpx 20rpx;
				font-size: 40rpx;
				font-weight: 500;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}
	}

	.contest-item {
		view {
			font-style: italic;
		}
	}
	
	.class-name-box {
		.header {
			margin-bottom: 0;
		}
	}
</style>
