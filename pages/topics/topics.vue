<template>
	<!-- 需要传入courseId -->

	<view class="box">
		<van-notify class="on-top" id="van-notify" />

		<view class="topic-box">
			<STabs effect="true" v-model="tabIdx" @change="getTopicsByTab">
				<STab title="最热">
					<view class="topic-list">
						<view class="topic-item" v-for="(topic, idx) in topics" :key="idx">
							<view class="header">
								<view class="title" @tap="openTopic(topic.id)">{{topic.title}}</view>
								<view class="user-box">
									<text>{{topic.creatorName}}</text>
									<van-image round :src="topic.creatorAvatar"></van-image>
								</view>
							</view>
							<view class="content" @tap="openTopic(topic.id)">{{topic.content}}</view>
							<view class="footer">
								<view class="left">
									<text class="update-time">更新于: {{topic.updateGmt}}</text>
								</view>

								<view class="right">
									<view class="like-count">
										<van-icon name="like-o" /> <text>{{topic.likeCount}}</text></view>
									<view class="comment-count">
										<van-icon name="comment-o" /> <text>{{topic.commentCount}}</text></view>
								</view>
							</view>
						</view>
						<uni-load-more :status="onloadingStatus" @clickLoadMore="loadMore()" :contentText="topicOnloadingText"></uni-load-more>
					</view>
				</STab>
				<STab title="最新">
					<view class="topic-list">
						<view class="topic-item" v-for="(topic, idx) in topics" :key="idx">
							<view class="header">
								<view class="title" @tap="openTopic(topic.id)">{{topic.title}}</view>
								<view class="user-box">
									<text>{{topic.creatorName}}</text>
									<van-image round :src="topic.creatorAvatar"></van-image>
								</view>
							</view>
							<view class="content" @tap="openTopic(topic.id)">{{topic.content}}</view>
							<view class="footer">
								<view class="left">
									<text v-if="sortedIdx === 1" class="update-time">更新于: {{topic.updateGmt}}</text>
									<text v-else class="update-time">发布于: {{topic.createGmt}}</text>
								</view>

								<view class="right">
									<view class="like-count">
										<van-icon name="like-o" /> <view class="count">{{topic.likeCount}}</view></view>
									<view class="comment-count">
										<van-icon name="comment-o" /> <view class="count">{{topic.commentCount}}</view></view>
								</view>
							</view>
						</view>
						<uni-load-more :status="onloadingStatus" @clickLoadMore="loadMore()" :contentText="topicOnloadingText"></uni-load-more>
					</view>
				</STab>
			</STabs>
			<view class="new-topic" @click="createNewTopic">发帖</view>
			<view class="sort-by" v-if="tabIdx === 1">
				<view>
					<ms-dropdown-menu>
						<ms-dropdown-item v-model="sortedIdx" :list="sortedText" @input="changeSortBy">
						</ms-dropdown-item>
					</ms-dropdown-menu>
				</view>

			</view>
		</view>
	</view>

</template>

<script>
	import VanNotify from "@/wxcomponents/vant/dist/notify/index.js";
	import Notify from "@/wxcomponents/vant/dist/notify/notify.js";
	import Icon from "@/wxcomponents/vant/dist/icon/index.js";
	import Image from "@/wxcomponents/vant/dist/image/index.js";

	import msDropdownMenu from '@/components/ms-dropdown/dropdown-menu.vue'
	import msDropdownItem from '@/components/ms-dropdown/dropdown-item.vue'
	import UniLoadMore from "@/components/uni-load-more/uni-load-more.vue";
	import STabs from "@/components/s-tabs";
	import STab from "@/components/s-tab";

	import TopicUtils from '@/static/js/topic.js'
	import CommonUtils from '@/static/js/utils.js'

	export default {
		components: {
			"ms-dropdown-menu": msDropdownMenu,
			"ms-dropdown-item": msDropdownItem,
			STabs,
			STab,
			"van-notify": VanNotify,
			"uni-load-more": UniLoadMore,
			"van-icon": Icon,
			"van-image": Image
		},
		data() {
			return {
				refreshOnShow: false,
				courseId: 0,
				// 帖子排序方法
				sortedText: [{
						text: '最新发布',
						value: 0
					},
					{
						text: '最新回复',
						value: 1
					},
				],
				sortedIdx: 0,
				tabIdx: 0,

				// 控制topic相关
				topics: [],
				offset: 0,
				count: 10,
				onloadingStatus: "more",
				topicOnloadingText: {
					contentdown: "点击加载更多帖子",
					contentrefresh: "加载中...",
					contentnomore: "没有更多帖子了"
				},
			}
		},
		methods: {
			createNewTopic() {
				uni.navigateTo({
					url: "../create_topic/create_topic?courseId=" + this.courseId,
				})
			},
			openTopic(topicId) {
				uni.navigateTo({
					url: '../topic/topic?topicId=' + topicId
				})
			},

			// 通过所处tab获得排序字段
			getSortByText() {
				let t = ''
				if (this.tabIdx === 0) {
					// 最热
					t = 'comment'
				} else {
					// 最新
					if (this.sortedIdx === 0) {
						// 最新帖子
						t = 'createTime'
					} else {
						// 最新回复
						t = 'updateTime'
					}
				}

				console.log("类型为", t);
				return t;
			},
			/**
			 * sortBy = {'comment', 'like', 'createTime', 'updateTime'}
			 */
			getTopics(sortBy = 'comment') {
				this.onloadingStatus = 'loading'

				let promise = TopicUtils.getTopics(this.courseId, sortBy, this.offset, this.count)
				promise
					.then(data => {
						console.log("获取到topics", data);
						data.forEach(e => {
							let dateObj = CommonUtils.dateConverter(e.updateGmt);
							if (null !== dateObj) {
								e.updateGmt = dateObj.defaultDatetime;
							}
							
							dateObj = CommonUtils.dateConverter(e.createGmt);
							if (null !== dateObj) {
								e.createGmt = dateObj.defaultDatetime;
							}
						});

						if (this.offset === 0) {
							this.topics.splice(0)
						}
						this.topics.push(...data);

						// 更新offset 和 onLoading 类型（是否有更多加载）
						this.offset += this.count;
						this.onloadingStatus =
							this.offset === this.topics.length ? "more" : "noMore";
					})
			},
			getTopicsByTab() {
				// 重置offset
				this.offset = 0;
				this.getTopics(this.getSortByText())
			},
			loadMore() {
				// 判断还有没有更多
				if (this.offset <= this.topics.length) {
					this.getTopics(this.getSortByText())
				} else {
					console.log("没有更多了");
				}
			},
			changeSortBy() {
				this.getTopicsByTab()
			},
		},
		onLoad(option) {
			// let courseId = 7
			let courseId = option.courseId
			this.courseId = courseId
			if (courseId) {
				this.getTopicsByTab()
			} else {
				Notify({
					type: "danger",
					message: "未传入课程号，请刷新重试"
				});
			}
		},
		onShow() {
			if (this.refreshOnShow) {
				this.getTopicsByTab()
				this.refreshOnShow = false
			}
		}
	}
</script>

<style lang="scss">
	@import "~@../../static/css/common.scss";

	.box {

		.topic-box {
			display: flex;
			justify-content: space-between;
			background-color: white;

			s-tabs {
				width: 100%;

				s-tab {
					background-color: $global-background-color;
				}
			}

			.new-topic {
				position: absolute;
				margin-right: 10rpx;
				right: 22rpx;
				top: 19rpx;
				color: #1E88E5;
				font-weight: 500;
			}

			.sort-by {
				position: absolute;
				margin-right: 10rpx;
				right: 341rpx;
				top: 11rpx;

				.dropdown-item {
					width: 180rpx;

					.dropdown-item__selected {
						padding: 10rpx;

						.selected__name {
							font-size: 26rpx;
							color: #607D8B;
						}

						.selected__icon {
							margin-left: 10rpx;

							// 下拉标签
							label {
								font-size: 20rpx;
							}
						}
					}
				}
			}


			.topic-list {

				.topic-item {
					background-color: #FAFAFA;
					height: 220rpx;
					margin-top: 10rpx;
					border-radius: 27rpx;
					padding: 10rpx;

					.header {
						display: flex;
						justify-content: space-between;
						margin: 10rpx 10rpx;

						.title {
							font-size: 40rpx;
							white-space: nowrap;
							width: 14rem;
							text-overflow: ellipsis;
							overflow: hidden;
							font-weight: 400;
						}

						.user-box {
							display: flex;
							align-items: center;

							text {
								margin-right: 10rpx;
								color: #5D4037;
							}

							image {
								width: 50rpx;
								height: 50rpx;
							}
						}
					}

					.content {
						font-size: 26rpx;
						overflow: hidden;
						text-overflow: ellipsis;
						height: 2rem;
						line-height: 1rem;
						width: 600rpx;
						margin-top: 30rpx;
						margin-bottom: 20rpx;
						padding: 0 8rpx;
					}

					.footer {
						display: flex;
						justify-content: space-between;
						padding: 0 8rpx;
						color: gray;

						text {
							font-size: 24rpx;
							margin-left: 6rpx;
						}
						
						.count {
							font-size: 24rpx;
						}

						.right {
							width: 180rpx;
							display: flex;
							justify-content: space-around;
							
							.like-count {
								display: flex;
								align-items: center;
							}
							
							.comment-count {
								display: flex;
								align-items: center;
							}
						}
					}

				}

			}

		}

	}
</style>
