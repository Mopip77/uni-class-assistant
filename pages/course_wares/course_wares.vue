<template>
	<view>

		<view class="on-top">
			<van-notify class="on-top" id="van-notify" />
			<van-dialog id="van-dialog" />
		</view>

		<STabs effect="true" navPerView="2" v-model="tabIndex" @change="changeTab">
			<STab title="我发布的">
				<view class="list">
					<view class="item" v-for="(courseWare, idx) in datas[0]" :key="idx">
						<van-swipe-cell right-width="65" async-close>
							<view class="swipe-cell-field" slot="right" @tap="tryDeleteCourseWare(courseWare.id)">删除</view>
							<view class="header" @tap="goToCourseWare(idx)">
								<text class="course-ware-name">{{courseWare.displayName}}</text>
								<text class="course-name">【{{courseWare.courseName}}】</text>
							</view>
							<view class="footer" @tap="goToCourseWare(idx)">
								<view class="user-box">
									<image :src="courseWare.creator.avatarUrl"></image>
									<text>{{courseWare.creator.nickname}}</text>
								</view>

								<view class="time-box">
									<view class="publish-date">{{courseWare.createGmt}}</view>
								</view>
							</view>
						</van-swipe-cell>
					</view>
					<uni-load-more :status="onloadingStatuses[0]" @clickLoadMore="loadMore" :contentText="onloadingText"></uni-load-more>
				</view>
			</STab>
			<STab title="我收到的">
				<view class="list">
					<view class="item" v-for="(courseWare, idx) in datas[1]" :key="idx">
						<view class="header" @tap="goToCourseWare(idx)">
							<text class="course-ware-name">{{courseWare.displayName}}</text>
							<text class="course-name">【{{courseWare.courseName}}】</text>
						</view>
						<view class="footer" @tap="goToCourseWare(idx)">
							<view class="user-box">
								<image :src="courseWare.creator.avatarUrl"></image>
								<text>{{courseWare.creator.nickname}}</text>
							</view>

							<view class="time-box">
								<view class="publish-date">{{courseWare.createGmt}}</view>
							</view>
						</view>
					</view>
					<uni-load-more :status="onloadingStatuses[1]" @clickLoadMore="loadMore" :contentText="onloadingText"></uni-load-more>
				</view>
			</STab>
		</STabs>
	</view>
</template>

<script>
	import UniLoadMore from "@/components/uni-load-more/uni-load-more.vue";
	import STabs from "@/components/s-tabs/index.vue";
	import STab from "@/components/s-tab/index.vue";
	import SwipeCell from '@/wxcomponents/vant/dist/swipe-cell/index.js'
	import VanDialog from '@/wxcomponents/vant/dist/dialog/index.js'
	import Dialog from '@/wxcomponents/vant/dist/dialog/dialog.js'
	import VanNotify from "@/wxcomponents/vant/dist/notify/index.js";
	import Notify from "@/wxcomponents/vant/dist/notify/notify.js";

	import CommonUtils from '@/static/js/utils.js'
	import CourseWareUtils from '@/static/js/course_ware.js'

	export default {
		components: {
			UniLoadMore,
			STabs,
			STab,
			'van-swipe-cell': SwipeCell,
			'van-dialog': VanDialog,
			'van-notify': VanNotify
		},

		data() {
			return {
				tabIndex: 0,
				datas: [
					[],
					[]
				],
				steps: [],
				offsets: [0, 0],
				counts: [10, 10],
				onloadingStatuses: ["more", "more"],
				onloadingText: {
					contentdown: "点击加载更多课件",
					contentrefresh: "加载中...",
					contentnomore: "没有更多课件了"
				},
			};
		},

		methods: {
			async loadMore() {
				let IDX = this.tabIndex

				if (this.offsets[IDX] > this.datas[IDX].length) {
					return;
				}

				this.onloadingStatuses[IDX] = "loading";

				let data = []
				if (IDX === 0) {
					// 加载发布的课件
					data = await this.getCourseWaresAsCreator(this.offsets[IDX], this.counts[IDX])
				} else if (IDX === 1) {
					// 加载写过的课件
					data = await this.getCourseWaresAsReader(this.offsets[IDX], this.counts[IDX])
				}

				this.datas[IDX].push(...data)

				// 更新offset 和 onLoading 类型（是否有更多加载）
				this.offsets[IDX] += this.counts[IDX];
				this.onloadingStatuses[IDX] = this.offsets[IDX] === this.datas[IDX].length ? "more" : "noMore";
			},

			changeTab() {
				let idx = this.tabIndex
				if (this.offsets[idx] === 0) {
					this.loadMore()
				}
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

			// 进入courseWare界面
			goToCourseWare(idx) {
				let courseWare = this.datas[this.tabIndex][idx]

				uni.navigateTo({
					url: '../conurse_ware/course_ware?courseWareId=' + courseWare.id
				})
			},

			// func
			// 通过contest创建者获取contest
			getCourseWaresAsCreator(offset, count) {
				return new Promise((resolve, reject) => {
					let promise = CourseWareUtils.getCourseWaresAsCreator(
						offset, count
					);
					promise.then(data => {
						data.forEach(e => CommonUtils.dateConverterBatch(e, 'createGmt'))
						resolve(data);
					});
				})
			},

			getCourseWaresAsReader(offset, count) {
				return new Promise((resolve, reject) => {
					let promise = CourseWareUtils.getCourseWaresAsReader(
						offset, count
					);
					promise.then(data => {
						data.forEach(e => CommonUtils.dateConverterBatch(e, 'createGmt'))
						resolve(data);
					});
				})
			},

			resetTab() {
				let IDX = this.tabIndex
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

		onLoad() {
			this.getPageInfo()
		},

		onPullDownRefresh() {
			this.getPageInfo(true)
		}
	}
</script>

<style lang="scss">
	@import '~@/static/css/common.scss';

	.list {
		.item {
			@include common-card;
			display: flex;
			flex-direction: column;
			height: 200rpx;
			background-image: $card-background-url;

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
					font-size: 40rpx;
					text-decoration: underline;
					font-weight: bold;
					color: #D84315;
					top: 50%;
					margin-top: 64rpx;
					margin-left: 24rpx;
				}
			}

			.header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 10rpx 10rpx;
				font-size: 50rpx;
				font-weight: 600;

				.course-ware-name {
					width: 13rem;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				.course-name {
					font-size: 32rpx;
					font-weight: 500;
					color: #546E7A;
					margin-right: -10rpx;
				}
			}

			.footer {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-top: 40rpx;
				margin-bottom: 6rpx;
				padding: 0 10rpx;

				.user-box {
					display: flex;
					align-items: center;

					.course-name {
						color: #5D4037;
					}

					image {
						width: 60rpx;
						height: 60rpx;
						border-radius: 50%;
					}

					text {
						margin-left: 10rpx;
					}
				}

				.time-box {
					font-size: 24rpx;
					color: #424242;
					display: flex;
					flex-direction: column;
				}
			}
		}
	}
</style>
