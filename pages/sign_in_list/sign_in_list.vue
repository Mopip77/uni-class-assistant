<template>
	<view>
		<van-notify class="on-top" id="van-notify" />

		<van-index-bar :scroll-top="scrollTop" :index-list="indexList">
			<view>
				<van-index-anchor index="未签到" />
				<van-cell-group>
					<van-cell v-for="(member, idx) in notSignInList" :key="idx">
						<view class="slot" slot="title">
							<image :src="member.avatarUrl"></image>
							<text>{{member.nickname}}</text>
						</view>
					</van-cell>
				</van-cell-group>

			</view>

			<view>
				<van-index-anchor index="已签到" />
				<van-cell-group>
					<van-cell v-for="(member, idx) in signInList" :key="idx">
						<view class="slot" slot="title">
							<image :src="member.avatarUrl"></image>
							<text>{{member.nickname}}</text>
						</view>
					</van-cell>
				</van-cell-group>

			</view>

		</van-index-bar>

	</view>
</template>

<script>
	import IndexBar from '@/wxcomponents/vant/dist/index-bar/index.js'
	import IndexAnchor from '@/wxcomponents/vant/dist/index-anchor/index.js'
	import VanCell from '@/wxcomponents/vant/dist/cell/index.js'
	import VanCellGroup from '@/wxcomponents/vant/dist/cell-group/index.js'
	import SwipeCell from '@/wxcomponents/vant/dist/swipe-cell/index.js'
	import VanNotify from "@/wxcomponents/vant/dist/notify/index.js";
	import Notify from "@/wxcomponents/vant/dist/notify/notify.js";

	import ClassUtils from '@/static/js/class.js'

	export default {
		components: {
			"van-index-bar": IndexBar,
			"van-index-anchor": IndexAnchor,
			"van-cell": VanCell,
			"van-notify": VanNotify,
			"van-cell-group": VanCellGroup,
			"van-swipe-cell": SwipeCell
		},
		data() {
			return {
				courseId: 0,
				scrollTop: '',
				indexList: ['未签到', '已签到'],

				notSignInList: [],
				signInList: [],
			};
		},
		onPageScroll(event) {
			this.scrollTop = event.scrollTop
		},
		methods: {
			// func
			getUserList(classId) {
				let promise = ClassUtils.getSignInList(classId)
				promise
					.then(data => {
						this.notSignInList = data.notSignInList
						this.signInList = data.signInList
					})
					.catch(err => {
						console.log("err", err);
					})
			},
			
			getPageInfo(closePullDownRefresh = false) {
				this.getUserList(this.classId)
				
				if (closePullDownRefresh) {
					uni.stopPullDownRefresh()
				}
			}
		},
		onLoad(option) {
			if (option.classId) {
				this.classId = option.classId
				this.getPageInfo()
			} else {
				Notify({
					type: "danger",
					message: '未传入课堂号，请重试'
				});
			}

		},
		onPullDownRefresh() {
			this.getPageInfo(true)
		}
	}
</script>

<style lang="scss">
	van-index-anchor {
		.van-index-anchor {
			background-color: rgb(242, 242, 242);
		}

		.van-index-anchor--active {
			background-color: rgb(242, 242, 242);
		}
	}

	.swipe-cell-field-right {
		color: white;
		background-color: #f44336;
		padding: 30rpx 38rpx;
		font-size: 28rpx;
	}

	.swipe-cell-field-left {
		color: white;
		background-color: #00C853;
		padding: 22rpx 38rpx;
		font-size: 28rpx;
	}

	.slot {
		display: flex;
		align-items: center;

		image {
			width: 60rpx;
			height: 60rpx;
			border-radius: 50%;
		}

		text {
			margin-left: 16rpx;
		}
	}
</style>
