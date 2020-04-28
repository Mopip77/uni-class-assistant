<template>
	<view class="app">
		<view class="on-top">
			<van-notify class="on-top" id="van-notify" />
			<van-dialog id="van-dialog" />
		</view>

		<view class="on-top">
			<CreateCourseModal v-if="showCreateCourseModal" @closeCreateCourseModal="closeCreateCourseModal" @successCallBack="getCourseList(0)"></CreateCourseModal>
		</view>

		<view class="on-top">
			<JoinCourseModal v-if="showJoinCourseModal" @closeJoinCourseModal="closeJoinCourseModal" @successCallBack="getCourseList(1)"></JoinCourseModal>
		</view>

		<view class="uni-padding-wrap">
			<view class="page-section swiper">
				<view class="page-section-spacing">
					<swiper class="swiper" :indicator-dots="true" :autoplay="true" :interval="4000" :duration="500">
						<swiper-item>
							<view class="swiper-item">
								<image src="https://i.loli.net/2020/04/09/9ZtaF6oB7pyM8xG.png"></image>
							</view>
						</swiper-item>
						<swiper-item>
							<view class="swiper-item ">
								<image src="https://i.loli.net/2020/04/09/V6tnwgUiSmrpdGv.png"></image>
							</view>
						</swiper-item>
					</swiper>
				</view>
			</view>
		</view>

		<view class="func-select-box">
			<van-grid column-num="3">
				<navigator url="../course_wares/course_wares">
					<van-grid-item use-slot>
						<image src="../../static/img/icon/book.png" />
						<text>课件库</text>
					</van-grid-item>
				</navigator>
				<navigator url="../contest_list/contest_list">
					<van-grid-item use-slot>
						<image src="../../static/img/icon/paper.png" />
						<text>试卷库</text>
					</van-grid-item>
				</navigator>
				<navigator url="../favorite/favorite">
					<van-grid-item use-slot>
						<image src="../../static/img/icon/fav.png" />
						<text>收藏夹</text>
					</van-grid-item>
				</navigator>

			</van-grid>
		</view>

		<view class="course-select-root">
			<van-tabs class-class="course-select-box" animated sticky :active="courseSelectIndex" @change="changeCourseSelect">
				<van-tab z-index="-1" tab-class="course-select-item" title="我发布的">
					<van-button custom-style="width: 750rpx;height: 70rpx;" color="#4DD0E1" @tap="showCreateCourseModalTroggle">新建课程</van-button>
					<van-divider v-if="teachedCourseList.length === 0" contentPosition="center">暂无课程，新建一个吧</van-divider>
					<view class="course-list" v-else>
						<view class="course-item" v-for="(course, idx) in teachedCourseList" :key="idx">
							<van-swipe-cell right-width="65" async-close>
								<view class="swipe-cell-field" slot="right" @tap="deleteCourse(course.id)">删除</view>
								<view class="course-card" @tap="goToCoursePage(course.id)">
									<view class="header">
										<view class="title">
											{{course.courseName}}
										</view>

										<view class="course-id">
											课程号: {{course.id}}
										</view>
									</view>
									<view class="footer">
										<view class="info">
											{{course.classInfo}}
										</view>
										<view class="user-count">
											<van-icon name="friends-o" custom-style="font-size: 44rpx;margin-right: 10rpx;" />{{course.memberCount}} 人
										</view>
									</view>
								</view>
							</van-swipe-cell>
						</view>
					</view>
				</van-tab>
				<van-tab tab-class="course-select-item" title="我参与的">
					<van-button custom-style="width: 750rpx;height: 70rpx;" color="#4DD0E1" @tap="showJoinCourseModalTroggle">加入课程</van-button>
					<van-divider v-if="joinedCourseList.length === 0" contentPosition="center">暂无课程，加入一个吧</van-divider>
					<view class="course-list" v-else>
						<view class="course-item" v-for="(course, idx) in joinedCourseList" :key="idx">
							<van-swipe-cell right-width="65" async-close>
								<view class="swipe-cell-field" slot="right" @tap="exitCourse(course.id)">退出</view>
								<view class="course-card" @tap="goToCoursePage(course.id)">
									<view class="header">
										<view class="title">
											{{course.courseName}}
										</view>
									</view>
									<view class="footer">
										<view class="info">
											{{course.classInfo}}
										</view>
										<view class="teacher">
											<image :src="course.creator.avatarUrl"></image>
											{{course.creator.nickname}}老师
										</view>
									</view>
								</view>
							</van-swipe-cell>
						</view>
					</view>
				</van-tab>
			</van-tabs>
		</view>
	</view>
</template>

<script>
	import Grid from '@/wxcomponents/vant/dist/grid/index.js'
	import GridItem from '@/wxcomponents/vant/dist/grid-item/index.js'
	import Tab from '@/wxcomponents/vant/dist/tab/index.js'
	import Tabs from '@/wxcomponents/vant/dist/tabs/index.js'
	import VanNotify from '@/wxcomponents/vant/dist/notify/index.js'
	import Notify from '@/wxcomponents/vant/dist/notify/notify.js'
	import Icon from '@/wxcomponents/vant/dist/icon/index.js'
	import Button from '@/wxcomponents/vant/dist/button/index.js'
	import Card from '@/wxcomponents/vant/dist/card/index.js'
	import SwipeCell from '@/wxcomponents/vant/dist/swipe-cell/index.js'
	import VanDialog from '@/wxcomponents/vant/dist/dialog/index.js'
	import Dialog from '@/wxcomponents/vant/dist/dialog/dialog.js'
	import Divider from '@/wxcomponents/vant/dist/divider/index.js'

	import CourseUtils from '@/static/js/course.js'

	import CreateCourseModal from '@/components/CreateCourse.vue'
	import JoinCourseModal from '@/components/JoinCourse.vue'

	export default {
		components: {
			CreateCourseModal,
			JoinCourseModal,

			'van-grid': Grid,
			'van-grid-item': GridItem,
			'van-tab': Tab,
			'van-tabs': Tabs,
			'van-notify': VanNotify,
			'van-icon': Icon,
			'van-button': Button,
			'van-swipe-cell': SwipeCell,
			'van-dialog': VanDialog,
			"van-divider": Divider,

		},
		data() {
			return {
				courseSelectIndex: 0,
				showCreateCourseModal: false,
				showJoinCourseModal: false,
				createJoinCourseModal: true,
				teachedCourseList: [],
				joinedCourseList: []
			}
		},
		onShow() {
			// 为了解决在me页面登录后，再返回到index能自动刷新，所以写成onShow，再通过list是否为0判断是否需要刷新
			let tout = setInterval(() => {
				if (this.$store.state.checkLogin) {
					clearInterval(tout)
					if (this.$store.state.hasLogin) {
						if (this.courseSelectIndex === 0 && this.teachedCourseList.length === 0) {
							this.getCourseList(this.courseSelectIndex)
						} else if (this.courseSelectIndex === 1 && this.joinedCourseList.length === 0) {
							this.getCourseList(this.courseSelectIndex)
						}
					}
				}
			}, 200);
		},
		methods: {
			showCreateCourseModalTroggle() {
				this.showCreateCourseModal = true;
			},
			closeCreateCourseModal() {
				this.showCreateCourseModal = false;
			},
			showJoinCourseModalTroggle() {
				this.showJoinCourseModal = true;
			},
			closeJoinCourseModal() {
				this.showJoinCourseModal = false;
			},

			changeCourseSelect() {
				this.courseSelectIndex = (this.courseSelectIndex + 1) % 2;
				// 只有没有数据才加载
				if (this.courseSelectIndex === 0 && this.teachedCourseList.length === 0 ||
					this.courseSelectIndex === 1 && this.joinedCourseList.length === 0) {
					this.getCourseList(this.courseSelectIndex)
				}
			},
			getCourseList(type) {
				console.log("获取课程列表");
				let promise = CourseUtils.listCourse(type);

				promise
					.then(list => {
						if (0 === type) {
							console.log("teached", list);
							this.teachedCourseList = list === null ? [] : list;
						} else {
							console.log("joined", list);
							this.joinedCourseList = list === null ? [] : list;
						}
					});
			},

			deleteCourse(courseId) {
				Dialog.confirm({
					title: '删除课程',
					message: '确认删除吗？'
				}).then(() => {
					let promise = CourseUtils.deleteCourse(courseId);
					promise
						.then(data => {
							Notify({
								type: 'success',
								message: '删除课程成功'
							})
							this.getCourseList(0)
						});
				}).catch(() => {});
			},

			exitCourse(courseId) {
				Dialog.confirm({
					title: '退出课程',
					message: '确认退出吗？'
				}).then(() => {
					let promise = CourseUtils.exitCourse(courseId);
					promise
						.then(data => {
							Notify({
								type: 'success',
								message: '退出课程成功'
							})
							this.getCourseList(1)
						});
				}).catch(() => {});

			},

			goToCoursePage(courseId) {
				console.log("走你", courseId);
				uni.navigateTo({
					url: '../course/course?id=' + courseId
				})
			}
		},
		computed: {},
	}
</script>

<style lang="scss">
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}

	.app {

		.on-top {
			position: fixed;
			z-index: 100000;
		}

		.uni-padding-wrap {
			// height: 275rpx;

			swiper-item {
				image {
					width: 750rpx;
					height: 325rpx;
				}
			}
		}
	}

	.func-select-box {
		van-grid-item {
			image {
				width: 80rpx;
				height: 80rpx;
				margin-bottom: 12rpx;
			}

			text {
				font-size: 26rpx;
				color: #263238;
				font-weight: bold;
			}
		}
	}

	.course-select-root {
		margin-top: 10rpx;

		.course-list {
			margin-bottom: 40rpx;

			.course-item {
				height: 220rpx;
				width: 680rpx;
				margin: 20rpx auto 0 auto;
				border-radius: 14rpx;
				// background-color: #CDDC39;
				background-image: url(~@/static/img/course-card-background.png);
				box-shadow: 10rpx 10rpx 8rpx #9E9E9E;

				.swipe-cell-field {
					font-size: 40rpx;
					text-decoration: underline;
					font-weight: bold;
					color: #D84315;
					top: 50%;
					margin-top: 85rpx;
					margin-left: 17rpx;
				}

				.header {
					display: flex;
					justify-content: space-between;

					.title {
						font-size: 60rpx;
						font-weight: bold;
						margin-left: 20rpx;
						color: black;
						padding-top: 17rpx;
					}

					.course-id {
						font-size: 29rpx;
						margin: 10rpx 15rpx;
						color: #455A64;
					}
				}

				.footer {
					display: flex;
					justify-content: space-between;
					margin: 60rpx 20rpx 0 25rpx;

					.info {
						font-size: 30rpx;
					}

					.teacher {
						font-size: 30rpx;
						display: flex;
						align-content: center;
						
						image {
							width: 44rpx;
							height: 44rpx;
							border-radius: 50%;
							margin-right: 10rpx;
						}
					}

					.user-count {
						font-size: 30rpx;
						display: flex;
						align-items: center;
					}
				}

			}
		}
	}
</style>
