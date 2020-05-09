<template>
	<view>
		<view class="on-top">
			<van-notify class="on-top" id="van-notify" />
			<van-dialog id="van-dialog" />
		</view>

		<view v-if="showModal" class="on-cover">
			<Notification :notificationId="NnotificationId" @closeModal="closeModal"></Notification>
		</view>

		<STabs effect="true" navPerView="2" v-model="tabIdx" @change="changeTab">
			<STab title="聊天">
				<view class="list-box">
					<view class="list chat-list" v-for="(chat, idx) in datas[0]" :key="idx" @tap="chatWith(chat.oppositeUser.id)">
						<view class="left">
							<van-image :src="chat.oppositeUser.avatarUrl" />
						</view>

						<view class="mid">
							<view class="creator-name">{{chat.oppositeUser.nickname}}</view>
							<view class="content">{{chat.content}}</view>
						</view>

						<view class="right">
							<view class="update-time">
								<view class="date">{{chat.updateDate}}</view>
								<view class="time">{{chat.updateTime}}</view>
							</view>
						</view>

					</view>
				</view>
				<uni-load-more :status="onloadingStatuses[0]" @clickLoadMore="loadMore" :contentText="onloadingTexts[0]"></uni-load-more>
			</STab>
			<STab title="通知">
				<view class="list-box">
					<view class="list notification-list" v-for="(notification, idx) in datas[1]" :key="idx">
						<van-swipe-cell right-width="65">
							<view class="swipe-cell-field" slot="right" @tap="deleteNotification(idx)">删除</view>
							<view class="header" @tap="gotoNotification(notification.id)">
								<view :class="notification.readed ? 'readed' : ''">
									<van-tag v-if="!notification.readed" custom-class="read-tag" plain type="primary">未读</van-tag>{{notification.title}}
								</view>
							</view>

							<view @tap="gotoNotification(notification.id)" v-if="notification.content" :class="notification.readed ? 'readed' : ''" class="content"><text>{{notification.content}}</text></view>

							<view class="date-box" @tap="gotoNotification(notification.id)">
								<text>{{notification.publishGmt}}</text>
							</view>
						</van-swipe-cell>
					</view>
				</view>
				<uni-load-more :status="onloadingStatuses[1]" @clickLoadMore="loadMore" :contentText="onloadingTexts[1]"></uni-load-more>
			</STab>
		</STabs>

	</view>
</template>

<script>
	import STabs from "@/components/s-tabs/index.vue";
	import STab from "@/components/s-tab/index.vue";
	import Image from "@/wxcomponents/vant/dist/image/index.js";
	import Tag from '@/wxcomponents/vant/dist/tag/index.js'
	import SwipeCell from '@/wxcomponents/vant/dist/swipe-cell/index.js'
	import VanNotify from '@/wxcomponents/vant/dist/notify/index.js'
	import Notify from '@/wxcomponents/vant/dist/notify/notify.js'

	import Notification from '@/components/Notification.vue'
	import UniLoadMore from "@/components/uni-load-more/uni-load-more.vue";

	import ChatUtils from '@/static/js/chat.js'
	import CommonUtils from '@/static/js/utils.js'
	import NotificationUtils from '@/static/js/notification.js'

	export default {
		components: {
			Notification,
			STabs,
			STab,
			"van-tag": Tag,
			"van-image": Image,
			"uni-load-more": UniLoadMore,
			'van-swipe-cell': SwipeCell,
			'van-notify': VanNotify,
		},
		data() {
			return {
				showModal: false,
				NnotificationId: 0,

				tabIdx: 0,

				// data (chat, notification)
				datas: [
					[],
					[]
				],
				offsets: [0, 0],
				counts: [10, 10],
				onloadingStatuses: ["more", "more"],
				onloadingTexts: [{
						contentdown: "点击加载更多聊天",
						contentrefresh: "加载中...",
						contentnomore: "没有更多聊天了"
					},
					{
						contentdown: "点击加载更多通知",
						contentrefresh: "加载中...",
						contentnomore: "没有更多通知了"
					}
				]
			}
		},
		methods: {
			closeModal() {
				this.resetTab()

				this.showModal = false
			},
			changeTab() {
				this.loadMore()
			},
			async loadMore() {
				let IDX = this.tabIdx;
				if (this.offsets[IDX] > this.datas[IDX].length) {
					return;
				}

				this.onloadingStatuses[IDX] = "loading";

				let data = ''
				if (IDX === 0) {
					data = await this.getLatestChats()
				} else if (IDX === 1) {
					// 加载notification
					data = await this.getNotifications()
				} else {
					return
				}

				this.datas[IDX].push(...data)

				// 更新offset 和 onLoading 类型（是否有更多加载）
				this.offsets[IDX] += this.counts[IDX];
				this.onloadingStatuses[IDX] =
					this.offsets[IDX] === this.datas[IDX].length ? "more" : "noMore";
			},
			chatWith(oppositeUserId) {
				uni.navigateTo({
					url: '../chat/chat?oppositeUserId=' + oppositeUserId
				})
			},
			gotoNotification(notificationId) {
				let promise = NotificationUtils.getCallbackUrl(notificationId)
				promise
					.then(data => {
						if (data) {
							uni.navigateTo({
								url: data
							})
						} else {
							this.NnotificationId = notificationId
							this.showModal = true
						}
					})
			},
			getLatestChats() {
				return new Promise((resolve, reject) => {
					let promise = ChatUtils.getLatestChats(
						this.offsets[0],
						this.counts[0]
					);
					promise.then(data => {
						data.forEach(e => {
							let dateObj = CommonUtils.dateConverter(e.updateGmt);
							if (null !== dateObj) {
								e.updateGmt = dateObj.defaultDatetime;
								e.updateDate = dateObj.defaultDate;
								e.updateTime = dateObj.defaultTime;
							}
						});

						resolve(data)
					});
				});
			},
			getNotifications() {
				return new Promise((resolve, reject) => {
					let promise = NotificationUtils.getNotifications(
						this.offsets[1],
						this.counts[1]
					);
					promise.then(data => {
						data.forEach(e => {
							CommonUtils.dateConverterBatch(e, 'publishGmt')
						});

						resolve(data)
					});
				});
			},
			
			deleteNotification(idx) {
				if (idx < 0 || idx >= this.datas[1].length) {
					return;
				}
				
				let p = NotificationUtils.deleteNotifcation(this.datas[1][idx].id)
				p.then(() => {
					this.datas[1].splice(idx, 1)
					this.offsets[1] -= 1
				})
			},
			
			resetTab() {
				let IDX = this.tabIdx
				this.offsets[IDX] = 0
				this.datas[IDX].splice(0)
				
				this.loadMore()
			},
			
			getPageInfo(closePullDownRefresh = false) {
				this.resetTab()
				
				if (closePullDownRefresh) {
					uni.stopPullDownRefresh()
				}
			}
		},
		onShow() {
			this.getPageInfo()
		},
		
		onPullDownRefresh() {
			this.getPageInfo(true)
		}
	}
</script>

<style lang="scss">
	.on-cover {
		position: fixed;
		z-index: 9988;
		width: 100%;
		height: 100%;
		background-color: $global-background-color;
	}

	.list {
		display: flex;
		padding: 20rpx 10rpx;
		align-items: center;
		background-color: white;
		margin: 4rpx 0;

		.left {
			image {
				width: 80rpx;
				height: 80rpx;
			}
		}

		.mid {
			display: flex;
			flex-direction: column;
			margin-left: 20rpx;

			.creator-name {
				font-size: 28rpx;
				font-weight: 600;
			}

			.content {
				font-size: 22rpx;
				color: gray;
				overflow: hidden;
				max-width: 14rem;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}

		.right {
			margin-left: auto;

			.update-time {
				color: gray;
				margin-top: -40rpx;
				font-size: 24rpx;
				align-items: flex-end;
			}
		}
	}

	.notification-list {
		padding: 0;
		
		van-swipe-cell {
			width: 100%;
			
			.van-swipe-cell {
				width: 100%;
			}
		}
		
		.van-swipe-cell__right {
		  display: flex;
		  align-items: center;
		  justify-content: space-around;
		  width: 65px;
		  height: 100%;
		  font-size: 15px;
		  line-height: 44px;
		  color: #fff;
		  text-align: center;
		  background-color: #f44;
		}

		.header {
			font-size: 30rpx;
			display: flex;
			align-items: center;
			padding-top: 14rpx;
			padding-left: 10rpx;

			view {
				display: flex;
				align-items: center;
				margin-left: 0rpx;
				margin-right: 10rpx;
				font-weight: 500;
			}
		}

		.content {
			margin: 10rpx 10rpx;
		}

		.date-box {
			margin-top: 20rpx;
			margin-left: 10rpx;
			display: flex;
			font-size: 24rpx;
			color: gray;
		}
	}

	.readed {
		color: gray;
	}
	
	// .swipe-cell-field {
	// 	font-size: 40rpx;
	// 	text-decoration: underline;
	// 	font-weight: bold;
	// 	color: #D84315;
	// 	top: 50%;
	// 	margin-top: 38rpx;
	// 	margin-left: 17rpx;
	// }
</style>
