<template>
	<view>
		<view class="on-top">
			<van-notify class="on-top" id="van-notify" />
		</view>

		<view v-if="showModal" class="on-top">
			<!-- 只用于新建公告 -->
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
			<van-grid column-num="3">
				<navigator :url="'../member_list/member_list?courseId=' + course.id">
					<van-grid-item use-slot>
						<image src="../../static/img/icon/book.png" />
						<text>成员列表</text>
					</van-grid-item>
				</navigator>
				<navigator :url="'../topics/topics?courseId=' + course.id">
					<van-grid-item use-slot>
						<image src="../../static/img/icon/paper.png" />
						<text>讨论区</text>
					</van-grid-item>
				</navigator>
				<navigator :url="'../course_settings/course_settings?courseId=' + course.id">
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
				<view v-if="course.creatorId === userId">
					<van-button custom-class="button" square type="primary" @tap="createNewResourceBtn">+</van-button>
				</view>
			</view>
			<!-- <van-tabs
        swipeable
        animated
		sticky
        :active="resourceSelectIndex"
        @change="changeResourceTab"
      > -->
			<STabs effect="true" navPerView="4" v-model="resourceSelectIndex" @change="changeResourceTab">
				<STab title="公告">
					<view class="list bulletin-list">
						<van-steps custom-class="bulletin-body" desc-class="bulletin-desc" :steps="datas[0]" direction="vertical" />
						<uni-load-more :status="onloadingStatuses[0]" @clickLoadMore="loadMore" :contentText="onloadingTexts[0]"></uni-load-more>
					</view>
				</STab>
				<STab title="课件">
					<view class="list course-ware-list">
						<view class="item course-ware-item" v-for="(courseWare, idx) in datas[1]" :key="idx" @tap="goToCourseWare(idx)">
							<view class="header">
								<view class="display-name">{{courseWare.displayName}}</view>
								<view class="time-box">
									{{courseWare.createGmt}}
								</view>
							</view>
							<view class="footer">
								<view class="user-box">
									<image :src="courseWare.creator.avatarUrl"></image>
									<text>{{courseWare.creator.nickname}}</text>
								</view>
							</view>
						</view>
						<uni-load-more :status="onloadingStatuses[1]" @clickLoadMore="loadMore" :contentText="onloadingTexts[1]"></uni-load-more>
					</view>
				</STab>
				<STab title="试卷">
					<view class="list contest-list">
						<view class="item contest-item" v-for="(contest, idx) in datas[2]" :key="idx" @tap="goToContest(idx)">
							<view class="header">
								<view v-if="contest.status === '未开始'" class="status" style="color: #607D8B;">未开始</view>
								<view v-if="contest.status === '已结束'" class="status" style="font-style: italic;">已结束</view>
								<view v-if="contest.status === '进行中'" class="status" style="color: red;">进行中</view>
								<view v-if="contest.status === '可进行'" class="status" style="color: #e57373;">可进行</view>
								<view class="time-box">
									<view v-if="contest.publishDate" class="publish-date">开始时间:{{contest.publishDate}}</view>
									<view v-if="contest.deadline" class="publish-date">截止时间:{{contest.deadline}}</view>
								</view>
							</view>
							<view class="footer">
								<view class="user-box">
									<image :src="contest.creator.avatarUrl"></image>
									<text>{{contest.creator.nickname}}</text>
								</view>

								<view v-if="contest.limitMinutes > 0" class="limit-time">限时: {{contest.limitMinutes}}分钟</view>
							</view>
						</view>
						<uni-load-more :status="onloadingStatuses[2]" @clickLoadMore="loadMore" :contentText="onloadingTexts[2]"></uni-load-more>
					</view>
				</STab>
				<STab title="课堂">课堂</STab>
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
			"van-grid": Grid,
			"van-grid-item": GridItem,
			"van-notify": VanNotify,
			"van-icon": Icon,
			"van-button": Button,
			"van-steps": Steps
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
				userId: 0,
				course: {},
				resourceSelectIndex: 0,
				datas: [
					[],
					[],
					[],
					[]
				],
				steps: [],
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
				console.log("load more offset:", this.offsets[idx]);

				if (this.offsets[idx] > this.datas[idx].length) {
					return;
				}

				this.onloadingStatuses[idx] = "loading";

				let data = []
				if (idx === 0) {
					// 加载公告
					data = await this.getBulletins();
					console.log("获得公告", data);
				} else if (idx === 1) {
					// 加载课件
					data = await this.getCourseWare()
					console.log("获得课件", data);
				} else if (idx === 2) {
					// 加载试卷
					data = await this.getContestsByCourseId()
					console.log("获得试卷", data);
				} else if (idx === 3) {
					// 加载课堂
					console.log("获得课堂");
					return;
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
						// 公告
						if (idx === 3) {
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
						url: ApiReference.UPLOAD_COURSE_WARE, //测试地址，记得更换
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

			// 进入contest界面
			goToContest(idx) {
				let contest = this.datas[2][idx]
				if (contest.status === '未开始') {
					// 可能时间已经到了，还是要判断一下发布时间
					if (new Date() - new Date(contest.publishDate) < 0) {
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
				console.log("getBulletins offset:", that.offsets[idx], " data:", that.datas[idx]);
				return new Promise((resolve, reject) => {
					let promise = BulletinUtils.listBulletin(
						that.course.id,
						that.offsets[idx],
						that.counts[idx]
					);
					promise.then(data => {
						data.forEach(e => {
							Utils.dateConverterBatch(e, false, 'createGmt')
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
							Utils.dateConverterBatch(e, false, 'publishDate', 'deadline')
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
							Utils.dateConverterBatch(e, false, 'createGmt')
						});

						resolve(data);
					});
				})
			},
		},
		onLoad(option) {
			// 传入id
			// let courseId = 7;
			this.userId = parseInt(uni.getStorageSync(LSReference.ID))
			let courseId = option.id;
			if (!courseId) {
				Notify({
					type: "danger",
					message: "未传入课程号，请刷新重试"
				});
			} else {
				let promise = CourseUtils.getCourse(courseId);
				promise.then(data => {
					console.log("获取到course", data);
					this.course = data;

					// 获取资源栏的内容
					this.changeResourceTab();
				});
			}
		},
		onShow() {
			if (this.refreshOnShow) {
				let courseId = this.course.id;

				let that = this
				if (!courseId) {
					Notify({
						type: "danger",
						message: "未传入课程号，请刷新重试"
					});
				} else {
					let promise = CourseUtils.getCourse(courseId);
					promise.then(data => {
						console.log("获取到course", data);
						that.course = data;

						// 获取资源栏的内容
						that.offsets[that.resourceSelectIndex] = 0;
						that.datas[that.resourceSelectIndex].splice(0);
						console.log("refresh by page", that.resourceSelectIndex, that.offsets, that.datas);
						that.changeResourceTab();
					});
				}

				this.refreshOnShow = false;
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
				height: 200rpx;
				background-image: url(~@/static/img/course-card-background.png);

				.header {
					display: flex;
					justify-content: space-between;
					padding: 10rpx 10rpx;

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
				}

				.footer {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-top: auto;
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
					}
				}
			}
		}
	
		.course-ware-list {
			.course-ware-item {
				height: 160rpx;
				
				.display-name {
					font-size: 34rpx;
					font-weight: 600;
				}
			}
		}
	}
</style>
