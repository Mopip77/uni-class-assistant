<template>
	<view class="app">
		<view class="on-top">
			<van-notify class="on-top" id="van-notify" />
			<van-dialog id="van-dialog" />
		</view>

		<view class="on-top">
			<CreateCourseModal v-if="showCreateCourseModal" @closeCreateCourseModal="closeCreateCourseModal" @successCallBack="resetTab"></CreateCourseModal>
		</view>

		<view class="on-top">
			<JoinCourseModal v-if="showJoinCourseModal" @closeJoinCourseModal="closeJoinCourseModal" @successCallBack="resetTab"></JoinCourseModal>
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

		<view class="course-box">
			<STabs effect="true" :navPerView="4" v-model="tabIdx" @change="changeTab">
				<STab title="我创建的">
					<view class="course-list">
						<view class="course-item" v-for="(course, idx) in datas[0]" :key="idx">
							<van-swipe-cell right-width="65" async-close>
								<view class="swipe-cell-field" slot="right" @tap="deleteCourse(course.id)">删除</view>
								<view class="course-card" @tap="goToCoursePage(course.id)">
									<view class="header">
										<view class="title">
											{{course.courseName}}
										</view>

										<view class="course-id">
											<text>课程号: {{course.id}}</text>
											<text>暗号: {{course.password}}</text>
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
						<van-divider v-if="datas[0].length === 0" contentPosition="center">暂无课程，新建一个吧</van-divider>
						<uni-load-more v-else :status="onloadingStatus" @clickLoadMore="loadMore()" :contentText="onloadingText"></uni-load-more>
					</view>
				</STab>

				<STab title="我教授的">
					<view class="course-list">
						<view class="course-item" v-for="(course, idx) in datas[1]" :key="idx">
							<van-swipe-cell right-width="65" async-close>
								<view class="swipe-cell-field" slot="right" @tap="exitCourse(course.id)">退出</view>
								<view class="course-card" @tap="goToCoursePage(course.id)">
									<view class="header">
										<view class="title">
											{{course.courseName}}
										</view>

										<view class="course-id">
											<text>课程号: {{course.id}}</text>
											<text>暗号: {{course.password}}</text>
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
						<uni-load-more :status="onloadingStatus" @clickLoadMore="loadMore()" :contentText="onloadingText"></uni-load-more>
					</view>
				</STab>

				<STab title="我学习的">
					<view class="course-list">
						<view class="course-item" v-for="(course, idx) in datas[2]" :key="idx">
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
						<van-divider v-if="datas[2].length === 0" contentPosition="center">暂无课程，加入一个吧</van-divider>
						<uni-load-more v-else :status="onloadingStatus" @clickLoadMore="loadMore()" :contentText="onloadingText"></uni-load-more>
					</view>
				</STab>
			</STabs>
			<view class="new-course-btn">
				<text @tap="showJoinCourseModalTroggle" v-if="tabIdx === 2">加入</text>
				<text @tap="showCreateCourseModalTroggle" v-else>新建</text>
			</view>
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
	import SwipeCell from '@/wxcomponents/vant/dist/swipe-cell/index.js'
	import VanDialog from '@/wxcomponents/vant/dist/dialog/index.js'
	import Dialog from '@/wxcomponents/vant/dist/dialog/dialog.js'
	import Divider from '@/wxcomponents/vant/dist/divider/index.js'

	import UniLoadMore from "@/components/uni-load-more/uni-load-more.vue";
	import STabs from "@/components/s-tabs";
	import STab from "@/components/s-tab";
	import CreateCourseModal from '@/components/CreateCourse.vue'
	import JoinCourseModal from '@/components/JoinCourse.vue'

	import CourseUtils from '@/static/js/course.js'

	export default {
		components: {
			CreateCourseModal,
			JoinCourseModal,

			STabs,
			STab,
			"uni-load-more": UniLoadMore,
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
				tabIdx: 0,
				showCreateCourseModal: false,
				showJoinCourseModal: false,

				datas: [
					[],
					[],
					[],
				],
				offsets: [0, 0, 0],
				counts: [10, 10, 10],
				onloadingStatuses: ["more", "more", "more"],
				onloadingText: {
					contentdown: "点击加载更多课程",
					contentrefresh: "加载中...",
					contentnomore: "没有更多课程了"
				},
			}
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

			async loadMore() {
				let IDX = this.tabIdx

				if (this.offsets[IDX] > this.datas[IDX].length) {
					return;
				}

				this.onloadingStatuses[IDX] = "loading";

				let data = await this.getCourses(IDX, this.offsets[IDX], this.counts[IDX])
				this.datas[IDX].push(...data)

				// 更新offset 和 onLoading 类型（是否有更多加载）
				this.offsets[IDX] += this.counts[IDX];
				this.onloadingStatuses[IDX] = this.offsets[IDX] === this.datas[IDX].length ? "more" : "noMore";
			},

			changeTab() {
				this.loadMore()
			},
			
			resetTab(closePullDownRefresh = false) {
				let IDX = this.tabIdx
				this.offsets[IDX] = 0
				this.datas[IDX].splice(0)
				this.loadMore()
				
				if (closePullDownRefresh) {
					uni.stopPullDownRefresh()
				}
			},

			/**
			 * @param {Number} type  0 - 创建的, 1 - 教授的, 2 - 学习的
			 * @param {Number} offset
			 * @param {Number} count
			 */
			getCourses(type, offset, count) {
				if (type < 0 || type > 2) {
					return;
				}

				return new Promise((resolve, reject) => {
					let p = null;
					if (0 === type) {
						p = CourseUtils.listCoursesAsCreator(offset, count)
					} else if (1 === type) {
						p = CourseUtils.listCoursesAsTeacher(offset, count)
					} else if (2 === type) {
						p = CourseUtils.listCoursesAsStudent(offset, count)
					}

					p.then(data => {
						resolve(data)
					});
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
							this.resetTab()
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
							this.resetTab()
						});
				}).catch(() => {});

			},

			goToCoursePage(courseId) {
				uni.navigateTo({
					url: '../course/course?courseId=' + courseId
				})
			}
		},
		
		onShow() {
			// 为了解决在me页面登录后，再返回到index能自动刷新，所以写成onShow，再通过list是否为0判断是否需要刷新
			let tout = setInterval(() => {
				let that = this
		
				if (that.$store.state.checkLogin) {
					clearInterval(tout)
					if (that.$store.state.hasLogin) {
						let idx = that.tabIdx
						if (that.datas[idx].length === 0) {
							that.loadMore()
						}
					}
				}
			}, 200);
		},
		
		onPullDownRefresh() {
			this.resetTab(true)
		}
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

	.course-box {
		margin-top: 10rpx;
		display: flex;
		justify-content: space-between;
		background-color: white;
		
		s-tabs {
			width: 100%;
		
			s-tab {
				background-color: $global-background-color;
			}
		}
		
		.new-course-btn {
			position: absolute;
			margin-right: 10rpx;
			right: 22rpx;
			margin-top: 22rpx;
			font-size: 30rpx;
			color: #1E88E5;
			font-weight: 500;
		}

		.course-list {
			margin-bottom: 40rpx;

			.course-item {
				height: 220rpx;
				width: 680rpx;
				margin: 20rpx auto 0 auto;
				border-radius: 14rpx;
				background-image: $card-background-url;
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
						display: flex;
						flex-direction: column;
						align-items: flex-end;
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
