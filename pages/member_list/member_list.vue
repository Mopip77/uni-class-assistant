<template>
	<view>
		<van-notify class="on-top" id="van-notify" />

		<van-index-bar :scroll-top="scrollTop" :index-list="indexList">
			<view>
				<van-index-anchor index="老师" />
				<view v-if="isCreator">
					<van-swipe-cell v-for="(teacher, idx) in teachers" :key="idx" right-width="65">
						<van-cell-group>
							<van-cell @tap="chatWith(teacher.id)" :class="teacher.id === userId ? 'is-me' : ''">
								<view class="slot" slot="title">
									<image :src="teacher.avatarUrl"></image>
									<text>{{teacher.nickname}}</text>
								</view>
							</van-cell>
						</van-cell-group>
						<view class="swipe-cell-field-right" slot="right" @tap="kickout(teacher.id, teacher.nickname)">踢出</view>
					</van-swipe-cell>
				</view>

				<view v-else>
					<van-cell-group>
						<van-cell @tap="chatWith(teacher.id)" v-for="(teacher, idx) in teachers" :key="idx" :class="teacher.id === userId ? 'is-me' : ''">
							<view class="slot" slot="title">
								<image :src="teacher.avatarUrl"></image>
								<text>{{teacher.nickname}}</text>
							</view>
						</van-cell>
					</van-cell-group>
				</view>

			</view>

			<view>
				<van-index-anchor index="学生" />
				<view v-if="isCreator">
					<van-swipe-cell v-for="(student, idx) in students" :key="idx" right-width="65" left-width="65">
						<view class="swipe-cell-field-left" slot="left" @tap="assignTeacher(student.id, student.nickname)">任命</view>
						<van-cell-group>
							<van-cell @tap="chatWith(student.id)" :class="student.id === userId ? 'is-me' : ''">
								<view class="slot" slot="title">
									<image :src="student.avatarUrl"></image>
									<text>{{student.nickname}}</text>
								</view>
							</van-cell>
						</van-cell-group>
						<view class="swipe-cell-field-right" slot="right" @tap="kickout(student.id, student.nickname)">踢出</view>
					</van-swipe-cell>
				</view>

				<view v-else-if="isTeacher">
					<van-swipe-cell v-for="(student, idx) in students" :key="idx" right-width="65">
						<van-cell-group>
							<van-cell @tap="chatWith(student.id)" :class="student.id === userId ? 'is-me' : ''">
								<view class="slot" slot="title">
									<image :src="student.avatarUrl"></image>
									<text>{{student.nickname}}</text>
								</view>
							</van-cell>
						</van-cell-group>
						<view class="swipe-cell-field-right" slot="right" @tap="kickout(student.id, student.nickname)">踢出</view>
					</van-swipe-cell>
				</view>

				<view v-else>
					<van-cell-group>
						<van-cell @tap="chatWith(student.id)" v-for="(student, idx) in students" :key="idx" :class="student.id === userId ? 'is-me' : ''">
							<view class="slot" slot="title">
								<image :src="student.avatarUrl"></image>
								<text>{{student.nickname}}</text>
							</view>
						</van-cell>
					</van-cell-group>
				</view>

			</view>

		</van-index-bar>

	</view>
</template>

<script>
	import IndexBar from '@/wxcomponents/vant/dist/index-bar/index.js'
	import IndexAnchor from '@/wxcomponents/vant/dist/index-anchor/index.js'
	import VanCell from '@/wxcomponents/vant/dist/cell/index.js'
	import VanCellGroup from '@/wxcomponents/vant/dist/cell-group/index.js'
	import SwipeCell from '@/wxcomponents/vant/dist/swipe-cell/index.js'
	import VanNotify from "@/wxcomponents/vant/dist/notify/index.js";
	import Notify from "@/wxcomponents/vant/dist/notify/notify.js";

	import CourseUtils from '@/static/js/course.js'

	export default {
		components: {
			"van-index-bar": IndexBar,
			"van-index-anchor": IndexAnchor,
			"van-cell": VanCell,
			"van-notify": VanNotify,
			"van-cell-group": VanCellGroup,
			"van-swipe-cell": SwipeCell
		},
		data() {
			return {
				courseId: 0,
				scrollTop: '',
				indexList: ['老师', '学生'],

				teachers: [],
				students: [],
				userId: 0,
				isTeacher: false,
				isCreator: false
			};
		},
		onPageScroll(event) {
			this.scrollTop = event.scrollTop
		},
		methods: {
			chatWith(id) {
				console.log("chat with", id);
				if (this.userId === id) {
					Notify({
						type: "danger",
						message: "不能和自己聊天"
					})
					return;
				}

				uni.redirectTo({
					url: '../chat/chat?oppositeUserId=' + id
				})
			},

			// func
			getUserList(courseId) {
				let promise = CourseUtils.getCourseMembers(courseId)
				promise
					.then(data => {
						console.log("data", data);
						this.teachers = data.teacher
						this.students = data.student
						this.isTeacher = data.isTeacher
						this.isCreator = data.isCreator
						this.userId = data.userId
					})
					.catch(err => {
						console.log("err", err);
					})
			},

			// 把用户踢出课程
			kickout(userId, userName) {
				if (userId === this.userId) {
					Notify({
						type: "danger",
						message: "搁着闹呢"
					})
					return;
				}

				let that = this
				uni.showModal({
					title: '踢出用户',
					content: '是否把' + userName + '踢出班级？',
					success: function(res) {
						if (res.confirm) {
							let promise = CourseUtils.kickoutUser(userId, that.courseId)
							promise
								.then(() => {
									Notify({
										type: "success",
										message: userName + " 成功被踢出"
									});

									that.getUserList(that.courseId)
								})
						}
					}
				});
			},

			// 把用户任命为老师
			assignTeacher(studentId, nickname) {
				if (!this.isCreator) {
					Notify({
						type: "danger",
						message: "您不是该课程的创建者"
					})
					return;
				}

				let that = this
				uni.showModal({
					title: '任命老师',
					content: '是否把' + nickname + '任命为班级老师？',
					success: function(res) {
						if (res.confirm) {
							let promise = CourseUtils.assignTeacher(studentId, that.courseId)
							promise
								.then(() => {
									Notify({
										type: "success",
										message: nickname + " 成功被任命为老师"
									});

									that.getUserList(that.courseId)
								})
						}
					}
				});
			}
		},
		onLoad(option) {
			if (option.courseId) {
				this.courseId = option.courseId
				this.getUserList(this.courseId)
			} else {
				Notify({
					type: "danger",
					message: '未传入课程号，请重试'
				});
			}

		}
	}
</script>

<style lang="scss">
	van-index-anchor {
		.van-index-anchor {
			background-color: rgb(242, 242, 242);
		}

		.van-index-anchor--active {
			background-color: rgb(242, 242, 242);
		}
	}

	.swipe-cell-field-right {
		color: white;
		background-color: #f44336;
		padding: 30rpx 38rpx;
		font-size: 28rpx;
	}

	.swipe-cell-field-left {
		color: white;
		background-color: #00C853;
		padding: 22rpx 38rpx;
		font-size: 28rpx;
	}

	.is-me {
		.van-cell__title {
			color: #EF6C00;
		}
	}
	
	.slot {
		display: flex;
		align-items: center;
		
		image {
			width: 60rpx;
			height: 60rpx;
			border-radius: 50%;
		}
		
		text {
			margin-left: 16rpx;
		}
	}
</style>
