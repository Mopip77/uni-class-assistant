<template>
	<view>

		<view class="on-top">
			<van-notify class="on-top" id="van-notify" />
		</view>

		<STabs effect="true" navPerView="2" v-model="tabIndex" @change="changeTab">
			<STab title="我发布的">
				<view class="list">
					<view class="item" v-for="(courseWare, idx) in datas[0]" :key="idx" @tap="goToCourseWare(idx)">
						<view class="header">
							{{courseWare.displayName}}
						</view>
						<view class="footer">
							<view class="user-box">
								<image :src="courseWare.creator.avatarUrl"></image>
								<text>{{courseWare.creator.nickname}}</text>
							</view>

							<view class="time-box">
								<view class="publish-date">{{courseWare.createGmt}}</view>
							</view>
						</view>
					</view>
					<uni-load-more :status="onloadingStatuses[0]" @clickLoadMore="loadMore" :contentText="onloadingText"></uni-load-more>
				</view>
			</STab>
			<STab title="我参与的">
				<view class="list">
					<view class="item" v-for="(courseWare, idx) in datas[1]" :key="idx" @tap="goToCourseWare(idx)">
						<view class="header">
							{{courseWare.displayName}}
						</view>
						<view class="footer">
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

	import CommonUtils from '@/static/js/utils.js'
	import CourseWareUtils from '@/static/js/course_ware.js'

	export default {
		components: {
			UniLoadMore,
			STabs,
			STab,
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
			/**
			 * 四个tab公用一个loadMore加载函数
			 */
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
					console.log("获得发布的课件", data);
				} else if (IDX === 1) {
					// 加载写过的课件
					data = await this.getCourseWaresAsReader(this.offsets[IDX], this.counts[IDX])
					console.log("获得读过的课件", data);
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
						data.forEach(e => CommonUtils.dateConverterBatch(e, false, 'createGmt'))
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
						data.forEach(e => CommonUtils.dateConverterBatch(e, false, 'createGmt'))
						resolve(data);
					});
				})
			}
		},

		onLoad() {
			this.loadMore()
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
			background-image: url(~@/static/img/course-card-background.png);

			.header {
				display: flex;
				justify-content: space-between;
				padding: 10rpx 10rpx;
				font-size: 50rpx;
				font-weight: 600;
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
