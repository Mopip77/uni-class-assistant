<template>
	<view>
		
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
					<view class="list notification-list" v-for="(notification, idx) in datas[1]" :key="idx" @tap="gotoNotification(notification.id)">
						<view class="header">
							<view :class="notification.readed ? 'readed' : ''"><van-tag v-if="!notification.readed" plain type="primary">未读</van-tag>{{notification.title}}</view>
						</view>
				
						<view v-if="notification.content" :class="notification.readed ? 'readed' : ''" class="content"><text>{{notification.content}}</text></view>
						
						<view class="date-box">
							<text>{{notification.publishGmt}}</text>
						</view>
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
		},
		data() {
			return {
				showModal: false,
				NnotificationId: 0,
				
				tabIdx: 0,

				// data (chat, notification)
				datas: [[], []],
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
				let IDX = this.tabIdx
				this.offsets[IDX] = 0
				this.datas[IDX].splice(0)
				this.loadMore()
				
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
							CommonUtils.dateConverterBatch(e, true, 'publishGmt')
						});
					
						resolve(data)
					});
				});
			}
		},
		onShow() {
			let IDX = this.tabIdx
			this.offsets[IDX] = 0
			this.datas[IDX].splice(0)
			this.loadMore()
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
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: 20rpx 10rpx 6rpx 10rpx;
		
		.header {
			font-size: 30rpx;
			display: flex;
			align-items: center;
			
			view {
				display: flex;
				align-items: center;
				margin-left: 10rpx;
				font-weight: 500;
			}
		}
		
		.content {
			margin: 6rpx 10rpx;
		}
		
		.date-box {
			margin-top: 20rpx;
			display: flex;
			font-size: 24rpx;
			color: gray;
		}
	}
	
	.readed {
		color: gray;
	}
</style>
