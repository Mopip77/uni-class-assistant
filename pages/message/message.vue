<template>
	<view>
		<STabs effect="true" navPerView="2" v-model="tabIdx" @change="changeTab">
			<STab title="聊天">
				<view class="list-box">
					<view class="list chat-list" v-for="(chat, idx) in chats" :key="idx" @tap="chatWith(chat.oppositeUser.id)">
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
				<uni-load-more :status="onloadingStatuses[chatTabIdx]" @clickLoadMore="loadMore" :contentText="onloadingTexts[chatTabIdx]"></uni-load-more>
			</STab>
			<STab title="通知">通知</STab>
		</STabs>

	</view>
</template>

<script>
	import STabs from "@/components/s-tabs/index.vue";
	import STab from "@/components/s-tab/index.vue";
	import Image from "@/wxcomponents/vant/dist/image/index.js";

	import UniLoadMore from "@/components/uni-load-more/uni-load-more.vue";

	import ChatUtils from '@/static/js/chat.js'
	import CommonUtils from '@/static/js/utils.js'

	export default {
		components: {
			STabs,
			STab,
			"van-image": Image,
			"uni-load-more": UniLoadMore,
		},
		data() {
			return {
				tabIdx: 0,
				chatTabIdx: 0,
				notificationTabIdx: 1,

				// data (chat, notification)
				chats: [],
				notifications: [],
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
			loadMore(idx) {
				if (idx === chatTabIdx) {
					this.getLatestChats()
				} else if (idx === this.notificationTabIdx) {
					// 加载notification
				}
			},
			chatWith(oppositeUserId) {
				uni.navigateTo({
					url: '../chat/chat?oppositeUserId=' + oppositeUserId
				})
			},
			getLatestChats() {
				let IDX = this.chatTabIdx;
				if (this.offsets[IDX] > this.chats.length) {
					return;
				}

				this.onloadingStatuses[IDX] = "loading";

				let promise = ChatUtils.getLatestChats(
					this.offsets[IDX],
					this.counts[IDX]
				);
				promise.then(data => {
					console.log("获得chats", data);
					data.forEach(e => {
						let dateObj = CommonUtils.dateConverter(e.updateGmt);
						if (null !== dateObj) {
							e.updateGmt = dateObj.defaultDatetime;
							e.updateDate = dateObj.defaultDate;
							e.updateTime = dateObj.defaultTime;
						}
					});

					this.chats.push(...data)

					console.log("data", IDX, this.chats);

					// 更新offset 和 onLoading 类型（是否有更多加载）
					this.offsets[IDX] += this.counts[IDX];
					this.onloadingStatuses[IDX] =
						this.offsets[IDX] === this.chats.length ? "more" : "noMore";
				});
			}
		},
		onShow() {
			if (this.tabIdx === this.chatTabIdx) {
				this.getLatestChats()
			} else {
				// 更新noti

			}
		}
	}
</script>

<style lang="scss">
	.chat-list {
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
</style>
