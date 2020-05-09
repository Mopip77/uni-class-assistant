<template>
	<view>

		<van-notify class="on-top" id="van-notify" />

		<view class="main-header">
			<view class="title">
				{{classObj.className}}
			</view>

			<view v-if="classObj.finished !== 0" class="my-button-group">
				<van-button disabled custom-class="my-button-three-word" square type="danger">已结课</van-button>
			</view>

			<view v-else>
				<view v-if="classObj.isTeacher" class="my-button-group">
					<van-button v-if="classObj.finished !== 0" disabled custom-class="my-button-three-word" square type="danger">已结课</van-button>
					<van-button v-else-if="classObj.published !== 0" custom-class="my-button" square type="danger" @tap="finishClass">下课</van-button>
					<van-button v-else custom-class="my-button" square type="primary" @tap="publishClass">发布</van-button>
				</view>
				
				<view v-else class="my-button-group">
					<van-button custom-class="my-button" plain square type="info" @tap="getUserClassAsStudent">刷新</van-button>
					<van-button v-if="classObj.needSignIn !== 0 && !userClass.signIn" custom-class="my-button" square type="primary"
					 @tap="signIn">签到</van-button>
					<van-button v-if="classObj.needSignIn !== 0 && userClass.signIn" disabled custom-class="my-button-three-word" square type="primary">已签到</van-button>
				</view>
			</view>

		</view>

		<view v-if="classObj.isTeacher" class="teacher-box">
			<view class="sign-in-box">
				<view v-if="classObj.finished === 0" class="my-button-group">
					<van-button v-if="classObj.needSignIn === 0" :disabled="classObj.published === 0" custom-class="my-button start-sign-in"
					 square type="info" @tap="startSignIn">开启签到</van-button>
					<van-button v-if="classObj.needSignIn !== 0" custom-class="my-button already-sign-button" square type="primary" @tap="goToSignInList">签到列表</van-button>
					<van-button v-if="classObj.needSignIn !== 0" custom-class="my-button" square type="info" @tap="refreshSignInCount">刷新</van-button>
				</view>

				<view v-if="classObj.needSignIn !== 0" class="sign-text">已签到人数: {{alreadySignInCount}} / {{needSignInCount}}</view>
			</view>

			<view v-if="classObj.finished === 0 && studentNames.length > 0" class="call-roll-box">
				<van-button :disabled="classObj.published === 0" custom-class="my-button random-roll" square type="info" @tap="randomRoll">随机点名</van-button>
				<text>{{randomStudent}}</text>
			</view>
		</view>
		<view v-else-if="classObj.needSignIn !== 0" class="student-box">
			<text v-if="!userClass.signIn" style="color: red;">还未签到, 速速签到</text>
		</view>

		<view class="box course-ware-box">
			<view class="header">课件区</view>
			<view v-if="classObj.isTeacher" class="list teacher-course-ware-list">
				<view class="item teacher-course-ware-item" v-for="(courseWare, idx) in courseWares" :key="idx">
					<text @tap="goToCourseWare(courseWare.id)">{{courseWare.name}}</text>
					<view class="right-button-box">
						<van-button v-if="!courseWare.published" :disabled="classObj.published === 0 || classObj.finished !== 0" custom-class="my-button" square
						 type="primary" @tap="publishCourseWare(idx)">发布</van-button>
						<van-button v-else custom-class="my-button" disabled plain square type="primary">已发布</van-button>
					</view>

				</view>
			</view>

			<view v-else class="list student-course-ware-list">
				<view class="item student-course-ware-item" v-for="(courseWare, idx) in courseWares" :key="idx">
					<view class="content" @tap="goToCourseWare(courseWare.id)">{{courseWare.name}}</view>
				</view>
			</view>
		</view>

		<view class="box quiz-box">
			<view class="header">随堂测试区</view>
			<view v-if="classObj.isTeacher" class="list teacher-quiz-list">
				<view class="item quiz-item teacher-quiz-item" v-for="(quiz, idx) in quizzes" :key="idx">
					<text @tap="goToQuiz(quiz.id)">QUIZ {{idx}}</text>
					<view class="right-button-box">
						<van-button v-if="!quiz.published" :disabled="classObj.published === 0" custom-class="my-button" square type="primary"
						 @tap="publishQuiz(idx)">发布</van-button>
						<van-button v-else custom-class="my-button" disabled plain square type="primary">已发布</van-button>
					</view>
				</view>
			</view>

			<view v-else class="list student-quiz-list">
				<view class="item quiz-item student-quiz-item" v-for="(quiz, idx) in quizzes" :key="idx">
					<view class="content" @tap="goToQuiz(quiz.id)">QUIZ {{idx}}</view>
				</view>
			</view>
		</view>

		<view v-if="!classObj.isTeacher" class="box note-box">
			<view class="header">
				<text>课堂记录区</text>
				<van-button @tap="saveNote" custom-class="my-button" square type="primary">保存</van-button>
			</view>
			<textarea v-model="note" auto-height />
			</view>

	</view>
</template>

<script>
	import VanNotify from "@/wxcomponents/vant/dist/notify/index.js";
	import Notify from "@/wxcomponents/vant/dist/notify/notify.js";
	import Button from "@/wxcomponents/vant/dist/button/index.js";

	import CourseWareUtils from '@/static/js/course_ware.js';
	import ContestUtils from '@/static/js/contest.js';
	import CommonUtils from '@/static/js/utils.js';
	import ClassUtils from '@/static/js/class.js';

	export default {
		components: {
			"van-button": Button,
			"van-notify": VanNotify,
		},

		data() {
			return {
				classObj: {},
				userClass: {},
				alreadySignInCount: 0,
				needSignInCount: 0,
				randomStudent: '',
				
				courseWares: [],
				quizzes: [],
				studentNames: [],
				note: ''
			};
		},
		
		methods: {
			randomRoll() {
				if (0 === this.studentNames.length) {
					this.randomStudent = '该课程还没有学生'
				} else {
					let n = Math.floor((Math.random() * this.studentNames.length))
					this.randomStudent = this.studentNames[n]
				}
			},
			
			publishClass() {
				let p = ClassUtils.publishClass(this.classObj.id)
				p.then(() => {
					this.classObj.published = 1
				})
			},
			
			finishClass() {
				let p = ClassUtils.finishClass(this.classObj.id)
				p.then(() => {
					this.classObj.finished = 1
				})
			},
			
			startSignIn() {
				let p = ClassUtils.startSignIn(this.classObj.id)
				p.then(() => {
					this.classObj.needSignIn = 1
					
					this.alreadySignInCount = 0
					this.needSignInCount = this.studentNames.length
				})
			},
			
			goToSignInList() {
				uni.navigateTo({
					url: '../sign_in_list/sign_in_list?classId=' + this.classObj.id
				})
			},
			
			refreshSignInCount() {
				let p = ClassUtils.getSignInCount(this.classObj.id)
				p.then((data) => {
					this.alreadySignInCount = data
				})
			},
			
			signIn() {
				let p = ClassUtils.signIn(this.classObj.id)
				p.then(() => {
					this.userClass.signIn = true
				})
			},
			
			saveNote() {
				let p = ClassUtils.updateNote(this.classObj.id, this.note)
				p.then(() => {})
			},
			
			publishCourseWare(idx) {
				if (this.classObj.published === 0 || this.classObj.finished !== 0) {
					return;
				}
				
				let courseWare = this.courseWares[idx]
				if (courseWare.published) {
					Notify({
						type: 'danger',
						message: '课件发布过了'
					});
					return;
				}
				
				let p = CourseWareUtils.publishCourseWare(courseWare.id)
				p.then(() => {
					courseWare.published = true
				})
			},
			
			publishQuiz(idx) {
				if (this.classObj.published === 0) {
					return;
				}
				
				let quiz = this.quizzes[idx]
				if (quiz.published) {
					Notify({
						type: 'danger',
						message: '随堂测试发布过了'
					});
					return;
				}
				
				let p = ContestUtils.publish(quiz.id)
				p.then(() => {
					quiz.published = true
				})
			},
			
			goToCourseWare(courseWareId) {
				uni.navigateTo({
					url: '../conurse_ware/course_ware?courseWareId=' + courseWareId
				})
			},
			
			goToQuiz(quizId) {
				uni.navigateTo({
					url: '../contest/contest?contestId=' + quizId
				})
			},
			
			getUserClassAsStudent() {
				// 学生则获取学生的内容，即user-class
				let that = this
				let p = ClassUtils.getClassInfoAsStudent(that.classObj.id)
				p.then(uC => {
					that.userClass = uC
					
					if (that.userClass.note) {
						that.note = that.userClass.note
					}
					that.courseWares = uC.courseWares
					that.quizzes = uC.quizzes
				})
			}
			
		},

		onLoad(option) {
			let classId = option.classId
			// let classId = 2
			
			if (!classId) {
				Notify({
					type: 'danger',
					message: '未传入课程号'
				});
			} else {
				let that = this
				
				let promise = ClassUtils.getClassById(classId)
				promise.then(data => {
					that.classObj = data
					
					if (that.classObj.isTeacher) {
						// 如果是老师，则获取学生列表、课程以及发布内容
						let p = ClassUtils.getClassInfoAsTeacher(that.classObj.id)
						p.then(info => {
							info.courseWares.forEach(e => CommonUtils.dateConverterBatch(e, 'createGmt'))
							info.quizzes.forEach(e => CommonUtils.dateConverterBatch(e, 'createGmt'))
							
							that.courseWares = info.courseWares
							that.quizzes = info.quizzes
							that.studentNames = info.studentNames
							
							if (data.published !== 0) {
								that.needSignInCount = that.studentNames.length
								that.refreshSignInCount()
							}
						})
					} else {
						that.getUserClassAsStudent()
					}
					
				})
			}

		}
	}
</script>

<style lang="scss">
	@import '~@/static/css/common.scss';
	
	.my-button-group {
		margin-left: auto;
		margin-right: 18rpx;
		
		.my-button {
			width: 120rpx;
			height: 70rpx;
			margin-left: 24rpx;
			border-radius: 6rpx;
		}
		
		.my-button-three-word {
			width: 150rpx;
			height: 70rpx;
			margin-left: 24rpx;
			border-radius: 6rpx;
		}
		
		.finished-class-button {
			width: 150rpx;
		}
	}
	
	.main-header {
			margin: 20rpx 10rpx;
			font-size: 48rpx;
			font-weight: 600;
			display: flex;
			align-items: flex-end;
			justify-content: space-between;
		}

	.box {
		margin-top: 50rpx;
		margin-bottom: 40rpx;
		padding: 10rpx 0;
		
		// 由于组件外面的contest页面正好也有.question-box .header，所以这要还需要覆盖一次
		.header {
			background-color: #4FC3F7;
			color: white;
			font-size: 40rpx;
			display: flex;
			align-items: center;
			padding: 4rpx 10rpx;
		}
	}
	
	.teacher-box {
		.sign-in-box {
			display: flex;
			align-items: center;
			margin: 40rpx 0;
			
			.my-button-group {
				margin-left: -10rpx;
				
				.start-sign-in {
					width: 180rpx;
				}
			}
			
			.already-sign-button {
				width: 180rpx;
			}
			
			.sign-text {
				margin-left: 10rpx;
			}
		}
	}
	
	.student-box {
		margin: 40rpx 10rpx;
	}
	
	.call-roll-box {
		display: flex;
		align-items: center;
		
		.random-roll {
			width: 180rpx;
			height: 70rpx;
			border-radius: 6rpx;
			margin-left: 14rpx;
			margin-right: 30rpx;
		}
	}
	
	.box {
		
		.list {
		
			.item {
				display: flex;
				align-items: center;
				padding: 15rpx 10rpx;
				border-bottom: 1rpx gray dashed;
				
				text {
					margin-left: 10rpx;
					width: 500rpx;
				}
				
				.right-button-box {
					margin-left: auto;
					
					.my-button {
						height: 50rpx;
						border-radius: 8rpx;
					}
				}
			}
		}
	}
	
	.quiz-item {
		text {
			font-style: italic;
		}
	}
	
	.note-box {
		
		.header {
			padding: 0;
			padding-left: 4rpx;
			justify-content: space-between;
			
			.my-button {
				width: 120rpx;
				height: 66rpx;
				padding: 14rpx;
			}
		}
		
		textarea {
			@include common-textarea;
			min-height: 300rpx;
		}
	}
</style>
