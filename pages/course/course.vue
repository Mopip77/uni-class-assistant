<template>
	<view>
		<view class="on-top">
			<van-notify class="on-top" id="van-notify" />
		</view>

		<view v-if="showNewResourceModal" class="on-top">
			<SingleSubmitPopup :type="newResourceType" :title="newResourceTitle" :fieldName="newResourceFieldName" :placeHolder="newResourcePlaceHolder"
			 :contentNullable="newResourceNullable" :contentIsNumber="newResourceIsNumber" @closeModal="closeNewResourceModal"
			 @successCallBack="submitCallBack" />
		</view>

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
					<van-button custom-class="button" square type="primary" @tap="onOpen">+</van-button>
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
					<!-- <van-divider v-if="bulletins.length === 0" contentPosition="center">暂无公告</van-divider> -->
					<view class="list bulletin-list">
						<!-- <view class="item bulletin-item" v-for="(bulletin, idx) in bulletins" :key="idx">
							<text>{{bulletin.content}}</text>
							<text>{{bulletin.createGmt}}</text>
							
							
						</view> -->

						<van-steps custom-class="bulletin-body" desc-class="bulletin-desc" :steps="bulletins" direction="vertical" />
						<uni-load-more :status="onloadingStatus" @clickLoadMore="loadMore('公告')" :contentText="bulletinOnloadingText"></uni-load-more>
					</view>
				</STab>
				<STab title="课件">课件</STab>
				<STab title="试卷">试卷</STab>
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

	import CourseUtils from "@/static/js/course.js";
	import BulletinUtils from "@/static/js/bulletin.js";
	import Utils from "@/static/js/utils.js";
	import LSReference from '@/static/js/local_storage_reference.js';

	import SingleSubmitPopup from "@/components/SingleSubmitPopup.vue";
	import UniLoadMore from "@/components/uni-load-more/uni-load-more.vue";
	import STabs from "@/components/s-tabs/index.vue";
	import STab from "@/components/s-tab/index.vue";

	export default {
		components: {
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

				userId: 0,
				course: {},
				resourceSelectIndex: 0,
				bulletins: [],
				steps: [],

				// 四个tab使用同一个offset和count，每次获取数据传入offset和count，并且更新offset = offset + count，如果offset和所选tab的累计数量不同表示没有更多了。
				// onloadingStatus表示下拉刷新的状态，有more（loading前）、loading（loading中）、noMore（没有更多了）
				offset: 0,
				count: 10,
				onloadingStatus: "more",
				bulletinOnloadingText: {
					contentdown: "点击加载更多公告",
					contentrefresh: "加载中...",
					contentnomore: "没有更多公告了"
				},

				// new resource
				newResourceMap: [{
						title: "新建课堂",
						type: "input",
						fieldName: "课程名",
						placeHolder: "请输入课程名",
						isNumber: false,
						nullable: false
					},
					{
						title: "发布课件",
						type: "input",
						fieldName: "课件名",
						placeHolder: "请输入课件名",
						isNumber: false,
						nullable: false
					},
					{
						title: "发布试卷",
						type: "input",
						fieldName: "试卷名",
						placeHolder: "请输入试卷名",
						isNumber: false,
						nullable: false
					},
					{
						title: "发布公告",
						type: "textarea",
						fieldName: "公告内容",
						placeHolder: "请输入公告内容",
						isNumber: false,
						nullable: false
					},
					{
						title: "发布通知",
						type: "input",
						fieldName: "通知内容",
						placeHolder: "请输入通知内容",
						isNumber: false,
						nullable: false
					}
				],
				newResourceIdx: 0,
				showNewResourceModal: false,
				newResourceType: "input",
				newResourceTitle: "",
				newResourceFieldName: "",
				newResourcePlaceHolder: "",
				newResourceIsNumber: "",
				newResourceNullable: false
			};
		},
		methods: {
			// 四个tab公用一个loadMore, 传入值分别为 公告，课件，试卷，课堂
			loadMore(tabName) {
				if (this.onloadingStatus === "noMore") {
					return;
				}

				// onLoading状态的修改下方到各个加载函数中
				if (tabName === "公告") {
					// 加载公告
					this.getBulletins(this.course.id);
				} else {
					console.log("其他");
				}
			},
			closeNewResourceModal() {
				this.showNewResourceModal = false;
			},
			onOpen() {
				uni.showActionSheet({
					itemList: this.newResourceMap.map(e => e["title"]),
					success: res => {
						let idx = res.tapIndex;
						if (idx >= this.newResourceMap.length) {
							return;
						}

						let newResourceObj = this.newResourceMap[idx];

						this.newResourceIdx = idx;
						this.newResourceTitle = newResourceObj["title"];
						this.newResourceType = newResourceObj["type"];
						this.newResourceFieldName = newResourceObj["fieldName"];
						this.newResourcePlaceHolder = newResourceObj["placeHolder"];
						this.newResourceIsNumber = newResourceObj["isNumber"];
						this.newResourceNullable = newResourceObj["nullable"];

						this.showNewResourceModal = true;
					}
				});
			},

			// popup提交的callback函数，提交完，如果当前tab正好是所提交的类型，则重置offset并刷新
			submitCallBack(content) {
				if (this.newResourceIdx === 3) {
					// 发布公告
					let promise = BulletinUtils.createBulletin(this.course.id, content);
					promise.then(data => {
						if (this.resourceSelectIndex === 0) {
							// 并且正好当前选择了公告tab
							this.changeResourceTab();
						}
					});
				}
			},

			// 获取资源栏内容
			changeResourceTab() {
				// 重置offset
				this.offset = 0;

				let idx = this.resourceSelectIndex;
				if (idx === 0) {
					// 公告
					this.getBulletins(this.course.id);
				}
			},

			// bulletin
			getBulletins(courseId) {
				this.onloadingStatus = "loading";

				let promise = BulletinUtils.listBulletin(
					courseId,
					this.offset,
					this.count
				);
				promise.then(data => {
					console.log("获得bulletins", data);
					data.forEach(e => {
						let dateObj = Utils.dateConverter(e.createGmt);
						if (null !== dateObj) {
							e.createGmt = dateObj.defaultDate;
						}
					});

					// 重置字段为van-steps所需的字段
					data = data.map(e => {
						return {
							text: e.content,
							desc: e.createGmt
						};
					});

					// 如果offset为0就直接更新，否则append
					if (this.offset) {
						this.bulletins = this.bulletins.concat(data);
						console.log("offset有值", this.offset, this.bulletins);
					} else {
						this.bulletins = data;
						console.log("offset没值", this.offset, this.bulletins);
					}

					// 更新offset 和 onLoading 类型（是否有更多加载）
					this.offset += this.count;
					this.onloadingStatus =
						this.offset === this.bulletins.length ? "more" : "noMore";
					console.log("更新状态", this.offset, this.onloadingStatus);
				});
			}
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
					this.offset = 0;
					this.changeResourceTab();
				});
			}
		},
		onShow() {
			if (this.refreshOnShow) {
				let courseId = this.course.id;
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
						this.offset = 0;
						this.changeResourceTab();
					});
				}

				this.refreshOnShow = false;
			}
		}
	};
</script>

<style lang="scss">
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

				// .van-step__circle-container {
				// 	margin-bottom: -15rpx;
				// }

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
		}
	}
</style>
