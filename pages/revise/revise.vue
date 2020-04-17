<template>
	<view>
		<van-notify class="on-top" id="van-notify" />
		<view v-if="showModal" class="on-cover">
			<CreateRevise :contestId="contestId" :userId="revisingUserId" @closeModal="closeModal"></CreateRevise>
		</view>

		<view class="revise-list">
			<view class="title">未批改</view>
			<view class="revise-item un-revised" v-for="(revise, idx) in unRevised" :key="idx" @tap="revise(revise.user.id)">
				<view class="user">
					<image :src="revise.user.avatarUrl"></image>
					<text>{{revise.user.nickname}}</text>
				</view>
			</view>
		</view>

		<view class="revise-list">
			<view class="title">已批改</view>
			<view class="revise-item un-revised" v-for="(revise, idx) in revised" :key="idx" @tap="revise(revise.user.id)">
				<view class="user">
					<image :src="revise.user.avatarUrl"></image>
					<text>{{revise.user.nickname}}</text>
				</view>
				<view class="score">{{revise.score}} / {{fullScore}} 分</view>
			</view>
		</view>

		<view class="revise-list">
			<view class="title">未提交</view>
			<view class="revise-item un-revised" v-for="(revise, idx) in unSubmit" :key="idx">
				<view class="user">
					<image :src="revise.user.avatarUrl"></image>
					<text>{{revise.user.nickname}}</text>
				</view>
			</view>
		</view>

	</view>
</template>

<script>
	import IndexBar from '@/wxcomponents/vant/dist/index-bar/index.js'
	import IndexAnchor from '@/wxcomponents/vant/dist/index-anchor/index.js'
	import VanNotify from "@/wxcomponents/vant/dist/notify/index.js";
	import Notify from "@/wxcomponents/vant/dist/notify/notify.js";

	import ContestUtils from '@/static/js/contest.js'

	import CreateRevise from '@/components/CreateRevise.vue'

	export default {
		components: {
			CreateRevise,
			"van-index-bar": IndexBar,
			"van-index-anchor": IndexAnchor,
			"van-notify": VanNotify,
		},
		data() {
			return {
				refreshOnShow: false,

				showModal: false,
				revisingUserId: 0,

				contestId: '',
				fullScore: 0,
				unSubmit: [],
				unRevised: [],
				revised: []
			};
		},
		methods: {
			closeModal() {
				this.showModal = false
			},
			revise(userId) {
				console.log("revise", userId);
				this.revisingUserId = userId
				this.showModal = true
			}
		},
		onLoad(option) {
			// this.contestId = '5e943c0505704513d99d2e0a';
			this.contestId = option.contestId
			this.fullScore = option.fullScore
			let promise = ContestUtils.getAnswerList(this.contestId)
			promise
				.then(data => {
					this.unSubmit = data.unSubmit
					this.unRevised = data.unRevised
					this.revised = data.revised.sort((x, y) => y.score - x.score)
				})
		},
		updated() {
			console.log("onshow，看看", this.refreshOnShow);
			if (this.refreshOnShow) {
				let promise = ContestUtils.getAnswerList(this.contestId)
				promise
					.then(data => {
						this.unSubmit = data.unSubmit
						this.unRevised = data.unRevised
						this.revised = data.revised.sort((x, y) => y.score - x.score)
					})

				this.refreshOnShow = false;
			}
		}
	}
</script>

<style lang="scss">
	.on-top {
		z-index: 9988;
		position: fixed;
	}

	.on-cover {
		z-index: 8888;
		position: absolute;
		width: 100%;
		height: 100%;
		background-color: $global-background-color;
	}

	.revise-list {
		margin-bottom: 20rpx;

		.title {
			font-size: 40rpx;
			background-color: #4FC3F7;
			color: #fff;
			padding: 4rpx 6rpx;
		}

		.revise-item {
			background-color: #fff;
			padding: 20rpx 8rpx;
			border-bottom: 1rpx gray dashed;
			display: flex;
			align-items: center;
			justify-content: space-between;

			.user {
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
		}
	}
</style>
