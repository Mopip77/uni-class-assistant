<template>
	<view>
		<view class="on-top">
			<van-dialog id="van-dialog" />
			<van-notify class="on-top" id="van-notify" />
		</view>

		<view v-if="showModal" class="on-top">
			<SingleSubmitPopup type="textarea" :title="modalTitle" :fieldName="modalFieldName" :placeHolder="modalPlaceHolder"
			 :submitText="modalSubmitText" :contentNullable="false" :contentIsNumber="false" @closeModal="closeModal"
			 @successCallBack="submitCallBack" />
		</view>

		<!-- 用于上传文件 -->
		<l-file ref="lFile" @up-success="upSuccess"></l-file>

		<view class="course-info">
			<view class="header">
				<view class="title">
					{{ course.courseName }}
					<view class="course-id"> 课程号: {{ course.id }} </view>
				</view>

				<van-button v-if="course.isTeacher" custom-class="score-cal" square type="danger" @tap="goToScoreCal">分数结算</van-button>
			</view>
			<view class="footer">
				<view class="info">
					{{ course.classInfo }}
				</view>
				<view class="user-count">
					<view>
						<van-icon name="friends-o" custom-style="font-size: 30rpx;margin-right: 10rpx;" />
					</view>{{ course.memberCount }} 人
				</view>
			</view>
		</view>

		<view class="func-select-box">
			<van-grid :column-num="course.isTeacher ? 3 : 2">
				<navigator :url="'../member_list/member_list?courseId=' + course.id">
					<van-grid-item use-slot>
						<image src="../../static/img/members.png" />
						<text>成员列表</text>
					</van-grid-item>
				</navigator>
				<navigator :url="'../topics/topics?courseId=' + course.id">
					<van-grid-item use-slot>
						<image src="../../static/img/chats.png" />
						<text>讨论区</text>
					</van-grid-item>
				</navigator>
				<navigator v-if="course.isTeacher" :url="'../course_settings/course_settings?courseId=' + course.id">
					<van-grid-item use-slot>
						<image src="../../static/img/icon/settings.png" />
						<text>课程设置</text>
					</van-grid-item>
				</navigator>
			</van-grid>
		</view>

		<view class="resource-select-box">
			<view class="label">
				<view><text>课程资源</text></view>
				<view v-if="course.isTeacher">
					<van-button custom-class="button" square type="primary" @tap="createNewResourceBtn">+</van-button>
				</view>
			</view>

			<STabs effect="true" navPerView="4" v-model="resourceSelectIndex" @change="changeResourceTab">
				<STab title="公告">
					<view class="list bulletin-list">
						<van-steps custom-class="bulletin-body" desc-class="bulletin-desc" :steps="datas[0]" direction="vertical" />
						<uni-load-more :status="onloadingStatuses[0]" @clickLoadMore="loadMore" :contentText="onloadingTexts[0]"></uni-load-more>
					</view>
				</STab>
				<STab title="课件">
					<view class="list course-ware-list">
						<view class="item course-ware-item" v-for="(courseWare, idx) in datas[1]" :key="idx">
							<van-swipe-cell right-width="65" async-close>
								<view class="swipe-cell-field" slot="right" @tap="tryDeleteCourseWare(courseWare.id)">删除</view>
								<view class="header" @tap="goToCourseWare(idx)">
									<view class="display-name">{{courseWare.displayName}}</view>
									<view class="time-box">
										{{courseWare.createGmt}}
									</view>
								</view>
								<view class="footer" @tap="goToCourseWare(idx)">
									<view class="user-box">
										<image :src="courseWare.creator.avatarUrl"></image>
										<text>{{courseWare.creator.nickname}}</text>
									</view>
									<van-tag v-if="!courseWare.published" plain type="primary">未发布</van-tag>
								</view>
							</van-swipe-cell>
						</view>
						<uni-load-more :status="onloadingStatuses[1]" @clickLoadMore="loadMore" :contentText="onloadingTexts[1]"></uni-load-more>
					</view>
				</STab>
				<STab title="试卷">
					<view class="list contest-list">
						<view class="item contest-item" v-for="(contest, idx) in datas[2]" :key="idx">
							<van-swipe-cell right-width="65" async-close>
								<view class="swipe-cell-field" slot="right" @tap="tryDeleteContest(contest.id)">删除</view>
								<view class="header" @tap="goToContest(idx)">
									<view v-if="!contest.published" class="status" style="font-style: italic;color: #E65100;">未发布</view>
									<view v-else-if="contest.status === '未开始'" class="status" style="color: #607D8B;">未开始</view>
									<view v-else-if="contest.status === '已结束'" class="status" style="font-style: italic;">已结束</view>
									<view v-else-if="contest.status === '进行中'" class="status" style="color: red;">进行中</view>
									<view v-else-if="contest.status === '可进行'" class="status" style="color: #e57373;">可进行</view>

									<view v-if="contest.published" class="time-box">
										<view v-if="contest.publishDate" class="publish-date">开始时间:{{contest.publishDate}}</view>
										<view v-if="contest.deadline" class="publish-date">截止时间:{{contest.deadline}}</view>
									</view>
									<view v-else class="class-name">{{contest.className}}</view>
								</view>
								<view class="footer" @tap="goToContest(idx)">
									<view class="user-box">
										<image :src="contest.creator.avatarUrl"></image>
										<text>{{contest.creator.nickname}}</text>
										
										<van-tag v-if="course.isTeacher && contest.status === '已结束' && !contest.revisedAll" class="revised" plain type="danger">未批完</van-tag>
									
									</view>

									<view v-if="contest.limitMinutes > 0" class="limit-time">限时: {{contest.limitMinutes}}分钟</view>
								</view>
							</van-swipe-cell>
						</view>
						<uni-load-more :status="onloadingStatuses[2]" @clickLoadMore="loadMore" :contentText="onloadingTexts[2]"></uni-load-more>
					</view>
				</STab>
				<STab title="课堂">
					<view class="list class-list">
						<view class="item class-item" v-for="(classObj, idx) in datas[3]" :key="idx">
							<van-swipe-cell right-width="65" async-close>
								<view class="swipe-cell-field" slot="right" @tap="tryDeleteClass(classObj.id)">删除</view>
							<view class="header" @tap="goToClass(idx)">
								<van-tag v-if="classObj.published === 0" plain type="primary">未发布</van-tag>
								<van-tag v-else-if="classObj.finished === 0" plain type="success">进行中</van-tag>
								<van-tag v-else plain type="danger">已结课</van-tag>
								<view class="title">
									{{classObj.className}}
								</view>
							</view>
							<view class="footer" @tap="goToClass(idx)">
								<view class="user-box">
									<image :src="classObj.creator.avatarUrl"></image>
									<text>{{classObj.creator.nickname}}</text>
								</view>

								<view class="create-date">{{classObj.createGmt}}</view>
							</view>
							</van-swipe-cell>
						</view>
						<uni-load-more :status="onloadingStatuses[3]" @clickLoadMore="loadMore" :contentText="onloadingTexts[3]"></uni-load-more>
					</view>
				</STab>
			</STabs>
		</view>
	</view>
</template>

<script>
	import Grid from "@/wxcomponents/vant/dist/grid/index.js";
	import GridItem from "@/wxcomponents/vant/dist/grid-item/index.js";
	import VanNotify from "@/wxcomponents/vant/dist/notify/index.js";
	import Notify from "@/wxcomponents/vant/dist/notify/notify.js";
	import Icon from "@/wxcomponents/vant/dist/icon/index.js";
	import Button from "@/wxcomponents/vant/dist/button/index.js";
	import Steps from "@/wxcomponents/vant/dist/steps/index.js";
	import Tag from '@/wxcomponents/vant/dist/tag/index.js'
	import VanDialog from '@/wxcomponents/vant/dist/dialog/index.js'
	import Dialog from '@/wxcomponents/vant/dist/dialog/dialog.js'
	import SwipeCell from '@/wxcomponents/vant/dist/swipe-cell/index.js'

	import ClassUtils from '@/static/js/class.js';
	import CourseWareUtils from '@/static/js/course_ware.js'
	import CourseUtils from "@/static/js/course.js";
	import BulletinUtils from "@/static/js/bulletin.js";
	import Utils from "@/static/js/utils.js";
	import LSReference from '@/static/js/local_storage_reference.js';
	import ContestUtils from '@/static/js/contest.js'
	import HttpCommons from '@/static/js/http_commons.js'
	import ApiReference from '@/static/js/api_reference.js'

	import lFile from '@/components/l-file/l-file.vue';
	import SingleSubmitPopup from "@/components/SingleSubmitPopup.vue";
	import UniLoadMore from "@/components/uni-load-more/uni-load-more.vue";
	import STabs from "@/components/s-tabs/index.vue";
	import STab from "@/components/s-tab/index.vue";

	export default {
		components: {
			lFile,
			SingleSubmitPopup,
			UniLoadMore,
			STabs,
			STab,
			'van-swipe-cell': SwipeCell,
			"van-tag": Tag,
			"van-grid": Grid,
			"van-grid-item": GridItem,
			"van-notify": VanNotify,
			"van-icon": Icon,
			"van-button": Button,
			"van-steps": Steps,
			'van-dialog': VanDialog,
		},
		data() {
			return {
				// 从其他页面回退回来，是否需要刷新本页，在其他页面回退之前通过page更改，刷新完再置回false
				refreshOnShow: false,

				// modalParams
				modalTitle: '',
				modalFieldName: '',
				modalPlaceHolder: '',
				modalSubmitText: '',

				// 该页面加载内容
				course: {},
				resourceSelectIndex: 0,
				datas: [
					[],
					[],
					[],
					[]
				],
				offsets: [0, 0, 0, 0],
				counts: [10, 10, 10, 10],
				onloadingStatuses: ["more", "more", "more", "more"],
				onloadingTexts: [{
						contentdown: "点击加载更多公告",
						contentrefresh: "加载中...",
						contentnomore: "没有更多公告了"
					},
					{
						contentdown: "点击加载更多课件",
						contentrefresh: "加载中...",
						contentnomore: "没有更多课件了"
					},
					{
						contentdown: "点击加载更多试卷",
						contentrefresh: "加载中...",
						contentnomore: "没有更多试卷了"
					},
					{
						contentdown: "点击加载更多课堂",
						contentrefresh: "加载中...",
						contentnomore: "没有更多课堂了"
					},
				],

				// 新建课程资源的相关内容
				newResourceMap: [{
					title: "新建课堂"
				}, {
					title: "发布课件"
				}, {
					title: "发布试卷"
				}, {
					title: "发布公告"
				}, {
					title: "发布通知"
				}],
				newResourceIdx: 0,
				showModal: false,
			};
		},
		methods: {
			// , 传入值分别为 
			/**
			 * 四个tab公用一个loadMore加载函数
			 */
			async loadMore() {
				// 处理当前tab的loadmore, tab顺序为 公告，课件，试卷，课堂
				let idx = this.resourceSelectIndex

				if (this.offsets[idx] > this.datas[idx].length) {
					return;
				}

				this.onloadingStatuses[idx] = "loading";

				let data = []
				if (idx === 0) {
					// 加载公告
					data = await this.getBulletins();
				} else if (idx === 1) {
					// 加载课件
					data = await this.getCourseWare()
				} else if (idx === 2) {
					// 加载试卷
					data = await this.getContestsByCourseId()
				} else if (idx === 3) {
					// 加载课堂
					data = await this.getClass()
				}

				this.datas[idx].push(...data)

				// 更新offset 和 onLoading 类型（是否有更多加载）
				this.offsets[idx] += this.counts[idx];
				this.onloadingStatuses[idx] = this.offsets[idx] === this.datas[idx].length ? "more" : "noMore";
			},
			closeModal() {
				this.showModal = false;
			},
			// 点击新建课程资源按钮
			createNewResourceBtn() {
				uni.showActionSheet({
					itemList: this.newResourceMap.map(e => e["title"]),
					success: res => {
						let idx = res.tapIndex;
						this.newResourceIdx = idx;
						if (idx >= this.newResourceMap.length) {
							return;
						}

						// 使用统一modal创建简单内容
						if (idx === 4) {
							// 通知
							uni.navigateTo({
								url: '../create_notification/create_notification?courseId=' + this.course.id
							})
						} else if (idx === 3) {
							// 公告
							this.modalTitle = '发布公告';
							this.modalFieldName = '公告内容';
							this.modalPlaceHolder = '请输入公告内容...';
							this.modalSubmitText = '提交';
							this.showModal = true;
						} else if (idx === 2) {
							// 试卷
							uni.navigateTo({
								url: '../create_contest/create_contest?courseId=' + this.course.id
							})
						} else if (idx === 1) {
							// PPT课件
							this.modalTitle = '发布课件';
							this.modalFieldName = '课件名';
							this.modalPlaceHolder = '请输入课件名...';
							this.modalSubmitText = '上传文件';
							this.showModal = true;
						} else if (idx === 0) {
							// 课堂
							uni.navigateTo({
								url: '../create_class/create_class?courseId=' + this.course.id
							})
						}

					}
				});
			},

			// 上传课件后的callback
			upSuccess(resp) {
				if (HttpCommons.successCheck(resp)) {
					Notify({
						type: 'success',
						message: '课件上传成功',
					});

					// 如果正好在课件tab，则刷新
					let idx = this.resourceSelectIndex
					if (idx === 1) {
						this.offsets[idx] = 0
						this.datas[idx].splice(0)
						this.loadMore()
					}
				}
			},

			// popup提交的callback函数，提交完，如果当前tab正好是所提交的类型，则重置offset并刷新
			submitCallBack(content) {
				let idx = this.newResourceIdx;
				let that = this;

				if (idx === 3) {
					// 公告
					let promise = BulletinUtils.createBulletin(that.course.id, content);
					promise.then(data => {
						if (that.resourceSelectIndex === 0) {
							// 并且正好当前选择了公告tab
							that.offsets[0] = 0
							that.datas[0].splice(0)
							that.loadMore();
						}
					});
				} else if (idx === 1) {
					// ppt
					that.$refs.lFile.upload({
						// #ifdef APP-PLUS
						currentWebview: that.$mp.page.$getAppWebview(),
						// #endif
						url: ApiReference.UPLOAD_COURSE_WARE,
						name: 'file',
						header: HttpCommons.getAuthenticationHeader(),
						formData: JSON.stringify({
							displayName: content,
							courseId: that.course.id
						})
					});
				}
			},

			// 获取资源栏内容
			changeResourceTab() {
				// 如果本tab没有任何内容(初次调用或本来就没有内容)，加载
				let idx = this.resourceSelectIndex
				if (this.offsets[idx] === 0) {
					this.loadMore()
				}
			},

			// 清空当前tab，重新加载
			resetTab() {
				this.offsets[this.resourceSelectIndex] = 0;
				this.datas[this.resourceSelectIndex].splice(0);
				this.changeResourceTab();
			},

			// 进入分数结算页面
			goToScoreCal() {
				uni.navigateTo({
					url: '../score_calculate/score_calculate?courseId=' + this.course.id
				})
			},

			// 进入contest界面
			goToContest(idx) {
				let contest = this.datas[2][idx]
				if (!this.course.isTeacher && contest.status === '未开始') {
					// 可能时间已经到了，还是要判断一下发布时间
					// 小程序时间转换
					let pD = contest.publishDate.replace(/-/g, '/')
					
					if (new Date() - new Date(pD) < 0) {
						Notify({
							type: 'danger',
							message: '测试还未开始'
						})
						return;
					}
				}

				uni.navigateTo({
					url: '../contest/contest?contestId=' + contest.id
				})
			},

			goToClass(idx) {
				uni.navigateTo({
					url: '../class/class?classId=' + this.datas[3][idx].id
				})
			},

			// 进入courseWare界面
			goToCourseWare(idx) {
				let courseWare = this.datas[1][idx]

				uni.navigateTo({
					url: '../conurse_ware/course_ware?courseWareId=' + courseWare.id
				})
			},

			// bulletin
			getBulletins() {
				let that = this
				let idx = this.resourceSelectIndex
				return new Promise((resolve, reject) => {
					let promise = BulletinUtils.listBulletin(
						that.course.id,
						that.offsets[idx],
						that.counts[idx]
					);
					promise.then(data => {
						data.forEach(e => {
							Utils.dateConverterBatch(e, 'createGmt')
						});

						// 重置字段为van-steps所需的字段
						data = data.map(e => {
							return {
								text: e.content,
								desc: e.createGmt
							};
						});

						resolve(data);
					});
				})
			},

			// 通过课程号获取试卷
			getContestsByCourseId() {
				let that = this
				let idx = this.resourceSelectIndex
				return new Promise((resolve, reject) => {
					let promise = ContestUtils.getContestByCourseId(
						that.course.id,
						that.offsets[idx],
						that.counts[idx]
					);
					promise.then(data => {
						data.forEach(e => {
							Utils.dateConverterBatch(e, 'publishDate', 'deadline')
						});
						resolve(data);
					});
				})
			},

			// 获取课件
			getCourseWare() {
				let that = this
				let idx = this.resourceSelectIndex
				return new Promise((resolve, reject) => {
					let promise = CourseWareUtils.getCourseWareByCourseId(
						that.course.id,
						that.offsets[idx],
						that.counts[idx]
					);
					promise.then(data => {
						data.forEach(e => {
							Utils.dateConverterBatch(e, 'createGmt')
						});

						resolve(data);
					});
				})
			},

			// 获取课堂
			getClass() {
				let that = this

				return new Promise((resolve, reject) => {
					let promise = ClassUtils.getClassByCourseId(that.course.id);
					promise.then(data => {
						data.forEach(e => {
							Utils.dateConverterBatch(e, 'createGmt')
						});

						resolve(data);
					});
				})
			},

			tryDeleteCourseWare(courseWareId) {
				Dialog.confirm({
					title: '删除课件',
					message: '确认删除吗？'
				}).then(() => {
					let p = CourseWareUtils.deleteCourseWare(courseWareId)
					p.then(() => {
						Notify({
							type: "success",
							message: "课件已删除"
						});

						this.resetTab();
					})
				}).catch(() => {});
			},

			tryDeleteContest(contestId) {
				Dialog.confirm({
					title: '删除试卷',
					message: '确认删除吗？'
				}).then(() => {
					let p = ContestUtils.deleteContest(contestId)
					p.then(() => {
						Notify({
							type: "success",
							message: "试卷已删除"
						});

						this.resetTab();
					})
				}).catch(() => {});
			},
			
			tryDeleteClass(classId) {
				Dialog.confirm({
					title: '删除课堂',
					message: '确认删除吗？'
				}).then(() => {
					let p = ClassUtils.deleteClass(classId)
					p.then(() => {
						Notify({
							type: "success",
							message: "课堂已删除"
						});
				
						this.resetTab();
					})
				}).catch(() => {});
			},

			getPageInfo(courseId, closePullDownRefresh = false) {
				if (!courseId) {
					Notify({
						type: "danger",
						message: "未传入课程号，请刷新重试"
					});
				} else {
					let promise = CourseUtils.getCourse(courseId);
					promise.then(data => {
						this.course = data;

						// 获取资源栏的内容
						this.resetTab();

						if (closePullDownRefresh) {
							uni.stopPullDownRefresh()
						}
					});
				}
			}
		},
		onLoad(option) {
			this.getPageInfo(option.courseId)
		},
		onShow() {
			if (this.refreshOnShow) {
				this.getPageInfo(this.course.id)
				this.refreshOnShow = false
			}
		},
		onPullDownRefresh() {
			if (this.course.id) {
				this.getPageInfo(this.course.id, true)
			} else {
				uni.stopPullDownRefresh()
			}
		}
	};
</script>

<style lang="scss">
	@import "~@../../static/css/common.scss";

	.on-top {
		position: fixed;
		z-index: 99988;
	}

	.course-info {
		.header {
			margin-bottom: 22rpx;
			margin-top: 15rpx;
			margin-left: 15rpx;
			display: flex;
			justify-content: space-between;

			.title {
				font-size: 60rpx;
				font-weight: bold;
				display: flex;

				.course-id {
					font-size: 25rpx;
					margin-left: 18rpx;
					margin-top: 41rpx;
					font-weight: normal;
				}
			}

			.score-cal {
				width: 180rpx;
				height: 70rpx;
				border-radius: 6rpx;
				margin-right: 12rpx;
			}
		}

		.footer {
			display: flex;
			justify-content: space-between;
			margin: 10rpx 18rpx;

			.info {
				font-size: 25rpx;
			}

			.user-count {
				font-size: 25rpx;
				display: flex;
				margin-top: 0rpx;
			}
		}
	}

	.func-select-box {
		margin-top: 35rpx;

		van-grid-item {
			// .van-grid-item__content {
			// 	background-color: $global-background-color;
			// }

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

	.resource-select-box {
		margin-top: 40rpx;

		.label {
			display: flex;
			justify-content: space-between;
			margin: 0 10rpx;
			margin-bottom: 10rpx;

			text {
				font-size: 40rpx;
			}

			.button {
				height: 47rpx;
				padding: 0 40rpx;
				margin-right: 10rpx;
				border-radius: 6rpx;
			}
		}

		.list {
			.bulletin-body {
				background-color: $global-background-color;

				.van-step {
					border-radius: 20rpx;
					margin-right: 10rpx;
					margin-top: 20rpx;
					padding: 0;
				}
			}

			.bulletin-desc {
				font-size: 24rpx;
			}

			.item {
				@include common-card;
				display: flex;
				flex-direction: column;
				height: 180rpx;
				background-image: $card-background-url;

				.swipe-cell-field {
					font-size: 40rpx;
					text-decoration: underline;
					font-weight: bold;
					color: #D84315;
					top: 50%;
					margin-top: 64rpx;
					margin-left: 24rpx;
				}

				.header {
					display: flex;
					justify-content: space-between;
					padding: 10rpx 10rpx;
					align-items: center;

					.status {
						font-size: 50rpx;
						font-weight: 600;
					}

					.time-box {
						font-size: 24rpx;
						color: #424242;
						display: flex;
						flex-direction: column;
					}

					.class-name {
						font-size: 32rpx;
					}
				}

				.footer {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-top: 24rpx;
					margin-bottom: 6rpx;
					padding: 0 10rpx;

					.user-box {
						display: flex;
						align-items: center;

						image {
							width: 60rpx;
							height: 60rpx;
							border-radius: 50%;
						}

						text {
							margin-left: 10rpx;
						}
						
						.revised {
							margin-left: 20rpx;
						}

						.van-tag {
							background-color: $global-background-color;
						}
					}
				}
			}
		}

		.course-ware-list {
			.course-ware-item {
				height: 160rpx;

				van-swipe-cell {
					width: 100%;
					height: 100%;
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					
					.van-swipe-cell {
						width: 100%;
						height: 100%;
					}
					
					.swipe-cell-field {
						margin-top: 54rpx;
					}
				}

				.display-name {
					font-size: 34rpx;
					font-weight: 600;
				}
			}

			.footer {
				
				.van-tag {
					background-color: $global-background-color;
				}
			}
		}

		.class-list {
			.class-item {
				height: 174rpx;

				.header {
					display: flex;
					justify-content: flex-start;
					align-items: center;
					font-size: 32rpx;
					font-weight: 500;
					padding: 20rpx 10rpx;

					.title {
						margin-left: 10rpx;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}

					van-tag {
						display: flex;
						align-items: center;

						.van-tag {
							background-color: $global-background-color;
						}
					}
				}

				.footer {
					.create-date {
						font-size: 24rpx;
						color: #37474F;
					}
				}
			}
		}
	}
</style>
