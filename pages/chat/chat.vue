<template>
	<view>
		<van-notify class="on-top" id="van-notify" />

		<view id="msg-box" class="message-box">
			<uni-load-more :status="onloadingStatus" @clickLoadMore="loadMore" :contentText="onloadingText"></uni-load-more>
			<view v-for="(message, idx) in messages" :key="idx">
				<view v-if="message.speakerId === meUserInfo.id" class="message-item my-message">
					<view class="header">
						<van-image round :src="meUserInfo.avatarUrl" />
						<view class="user-info">
							<view class="creator-name">{{meUserInfo.nickname}}</view>
							<view class="create-time">{{message.createGmt}}</view>
						</view>
					</view>
					<view class="message-body">

						<view class="message-content">
							<view class="bot"></view>
							<view class="top"></view>
							{{message.content}}
						</view>
					</view>
				</view>

				<view v-else class="message-item opposite-message">
					<view class="header">
						<van-image round :src="oppositeUserInfo.avatarUrl" />
						<view class="user-info">
							<view class="creator-name">{{oppositeUserInfo.nickname}}</view>
							<view class="create-time">{{message.createGmt}}</view>
						</view>
					</view>
					<view class="message-body">
						<view class="message-content">
							<view class="bot"></view>
							<view class="top"></view>
							{{message.content}}
						</view>
					</view>
				</view>
			</view>
		</view>


		<view class="dock-row-box">
			<view class="dock-row">
				<!-- <view class="input-column" @tap="goTop">发送消息...</view> -->
				<input type="text" v-model="messageInput" class="input-column-2" confirm-type="send" placeholder="发送消息..." @confirm="sendMessage"></input>
				<!-- <view class="input-column" @tap="showModal">发送消息...</view> -->
			</view>
		</view>

	</view>
</template>

<script>
	import VanNotify from "@/wxcomponents/vant/dist/notify/index.js";
	import Notify from "@/wxcomponents/vant/dist/notify/notify.js";
	import Icon from "@/wxcomponents/vant/dist/icon/index.js";
	import Image from "@/wxcomponents/vant/dist/image/index.js";

	import UniLoadMore from "@/components/uni-load-more/uni-load-more.vue";

	import ChatUtils from '@/static/js/chat.js'
	import CommonUtils from '@/static/js/utils.js'

	export default {
		components: {
			"van-notify": VanNotify,
			"uni-load-more": UniLoadMore,
			"van-icon": Icon,
			"van-image": Image
		},
		data() {
			return {
				oppositeUserId: 0,
				scrollTop: 0,

				// modal
				popupTitle: '',

				// userInfo
				oppositeUserInfo: {},
				meUserInfo: {},

				// messages
				messageInput: '',
				messages: [],
				offset: 0,
				count: 10,
				onloadingStatus: "more",
				onloadingText: {
					contentdown: "点击加载更多消息",
					contentrefresh: "加载中...",
					contentnomore: "没有更多消息了"
				},
			};
		},
		methods: {
			loadMore() {
				this.getMessages()
			},

			// 滚动到合适的位置，如果刚进入则滚动至底部，如果加载之前消息则滚动到插入的位置
			scrollTo() {
				let that = this
				let query = uni.createSelectorQuery().in(this)
				query.select('#msg-box').boundingClientRect()
				query.exec(function(event) {
					let scT = 0
					if (that.scrollTop === event[0].height) {
						// 似乎滚动也算update，所以滚动完又会触发一次，此时这两者相等
						return;
					} else if (that.scrollTop === 0) {
						scT = event[0].height
					} else {
						scT = event[0].height - that.scrollTop
					}

					console.log("开滚", that.scrollTop, event[0].height, scT);
					uni.pageScrollTo({
						scrollTop: scT,
						duration: 200,
						selector: '#msg-box'
					})
					that.scrollTop = event[0].height
				})
			},

			// func
			getMessages() {
				this.onloadingStatus = "loading";

				let promise = ChatUtils.getMessages(
					this.oppositeUserId,
					this.offset,
					this.count
				);
				promise.then(data => {
					data.messages.forEach(e => {
						CommonUtils.dateConverterBatch(e, 'createGmt')
					});
					
					data.messages.forEach(e => this.messages.splice(0, 0, e))

					this.oppositeUserInfo = data.oppositeUser
					this.meUserInfo = data.me
					
					// 修改标题
					uni.setNavigationBarTitle({
						title: '与【' + this.oppositeUserInfo.nickname + '】的聊天'
					})

					// 更新offset 和 onLoading 类型（是否有更多加载）
					this.offset += this.count;
					this.onloadingStatus =
						this.offset === this.messages.length ? "more" : "noMore";
				});
			},

			sendMessage() {
				if (!this.messageInput) {
					Notify({
						type: "danger",
						message: "发送消息为空"
					});
					return;
				}

				let promise = ChatUtils.sendMessage(this.oppositeUserInfo.id, this.messageInput)
				promise
					.then(() => {
						this.messageInput = ''
						this.offset = 0
						this.scrollTop = 0
						this.messages.splice(0)
						this.getMessages()
					})
			}
		},
		onLoad(option) {
			// this.oppositeUserId = 11
			if (option.oppositeUserId) {
				this.oppositeUserId = option.oppositeUserId
				this.offset = 0
				this.scrollTop = 0
				this.getMessages()
			} else {
				Notify({
					type: "danger",
					message: "传入聊天对象id错误,请重试"
				})
				return;
			}

		},
		updated() {
			// 滚动
			this.scrollTo()
		}
	}
</script>

<style lang="scss">
	.on-top {
		position: fixed;
		z-index: 9988;
	}

	.header {
		display: flex;

		image {
			height: 62rpx;
			width: 62rpx;
		}

		.user-info {
			display: flex;
			flex-direction: column;
			margin: 10rpx;

			.creator-name {
				font-size: 30rpx;
			}

			.create-time {
				font-size: 20rpx;
				color: gray;
			}
		}

		.like-count {
			display: flex;
			flex-direction: column;
			margin-left: auto;
			align-items: center;
			margin-right: 20rpx;

			text {
				font-size: 22rpx;
			}
		}
	}

	.message-box {
		margin-top: 35rpx;

		.message-item {
			// border-bottom: 0.5px solid #BDBDBD;
			padding: 10rpx 10rpx 14rpx 10rpx;
			margin-bottom: 10rpx;
			// background-color: white;

			.message-body {
				padding: 12rpx 0 0 4rpx;
				font-size: 30rpx;
			}

			.sub-comment {
				font-size: 26rpx;
				color: gray;
				margin-left: 6rpx;
			}
		}

		.opposite-message {

			.message-content {
				$bkg: #8BC34A;
				background-color: $bkg;
				margin-left: 34px;
				padding: 14rpx 20rpx;
				border-radius: 18rpx;
				position: relative;
				max-width: 75%;
				width: fit-content;
				color: white;

				view {
					height: 0;
					width: 0;
					position: absolute;
				}

				.bot {
					border-width: 40rpx 24rpx;
					border-style: solid;
					border-color: $bkg $bkg transparent transparent;
					left: -16px;
					margin-top: -41rpx;
				}

				.top {
					border-width: 14rpx 24rpx;
					border-style: solid;
					border-color: $global-background-color $global-background-color transparent transparent;
					left: -32rpx;
					margin-top: -42rpx;
				}
			}
		}

		// TODO 聊天界面倒着来

		.my-message {
			.header {
				flex-direction: row-reverse;

				.creator-name {
					flex-direction: row-reverse;
					display: flex;
				}
			}

			.message-body {
				display: flex;
				flex-direction: row-reverse;

				.message-content {
					background-color: #cdcdcd;
					margin-right: 80rpx;
					padding: 14rpx 20rpx;
					border-radius: 18rpx;
					max-width: 75%;

					view {
						height: 0;
						width: 0;
						position: absolute;
					}

					.bot {
						border-width: 40rpx 24rpx;
						border-style: solid;
						border-color: #cdcdcd transparent transparent #cdcdcd;
						right: 29px;
						margin-top: -41rpx;
					}

					.top {
						border-width: 14rpx 24rpx;
						border-style: solid;
						border-color: $global-background-color transparent transparent $global-background-color;
						right: 58rpx;
						margin-top: -41rpx;
					}
				}
			}
		}
	}

	.dock-row-box {
		height: 80rpx;

		.dock-row {
			position: fixed;
			bottom: 0;
			// border: 1rpx solid black;
			width: 100%;
			display: flex;
			justify-content: space-between;
			padding: 8rpx 4rpx;
			background-color: white;
			align-items: center;
			box-shadow: -1rpx -1rpx .8rpx #9E9E9E;

			.input-column {
				font-size: 30rpx;
				width: 80%;
				line-height: 1.5rem;
				background-color: #E0E0E0;
				border-radius: 25rpx;
				padding: 2rpx 25rpx;
				color: #616161;
			}

			.input-column-2 {
				font-size: 30rpx;
				width: 90%;
				line-height: 1.5rem;
				background-color: #E0E0E0;
				border-radius: 25rpx;
				padding: 10rpx 25rpx;
			}

			.favorite-column {
				font-size: 40rpx;
				margin-right: 28rpx;
				padding-top: 5rpx;
			}
		}
	}
</style>
