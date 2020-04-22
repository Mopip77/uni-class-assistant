<template>
	<view>

		<STabs effect="true" navPerView="3" v-model="tabIdx" @change="changeTab">
			<STab title="题目">
				<view class="list">
					<view class="item" v-for="(fav, idx) in datas[0]" :key="idx" @tap="goToQuestion(fav)">
						<view class="title">
							<text>{{fav.data.question}}</text>
						</view>

						<view class="footer">
							<view class="date-box">
								{{fav.createGmt}}
							</view>
							<van-tag v-if="fav.data.isObjectiveQuestion" plain type="primary">客观题</van-tag>
							<van-tag v-else plain type="success">主观题</van-tag>
						</view>

					</view>
				</view>
				<uni-load-more :status="onloadingStatuses[1]" @clickLoadMore="loadMore" :contentText="onloadingText"></uni-load-more>
			</STab>
			<STab title="课件">
				<view class="list">
					<view class="item" v-for="(fav, idx) in datas[1]" :key="idx" @tap="goToCourseWare(fav)">
						<view class="title">
							<text>{{fav.data.displayName}}</text>
						</view>

						<view class="date-box2">
							{{fav.createGmt}}
						</view>
					</view>
				</view>
				<uni-load-more :status="onloadingStatuses[1]" @clickLoadMore="loadMore" :contentText="onloadingText"></uni-load-more>
			</STab>
			<STab title="帖子">
				<view class="list">
					<view class="item" v-for="(fav, idx) in datas[2]" :key="idx" @tap="goToTopic(fav)">
						<view class="title">
							<text>{{fav.data.title}}</text>
						</view>

						<view class="date-box2">
							{{fav.createGmt}}
						</view>
					</view>
					<uni-load-more :status="onloadingStatuses[2]" @clickLoadMore="loadMore" :contentText="onloadingText"></uni-load-more>
				</view>
			</STab>
		</STabs>

	</view>
</template>

<script>
	import VanTag from '@/wxcomponents/vant/dist/tag/index.js'

	import UniLoadMore from "@/components/uni-load-more/uni-load-more.vue";
	import STabs from "@/components/s-tabs/index.vue";
	import STab from "@/components/s-tab/index.vue";

	import CommonUtils from '@/static/js/utils.js'
	import FavoriteUtils from '@/static/js/favorite.js';

	export default {
		components: {
			"van-tag": VanTag,
			UniLoadMore,
			STabs,
			STab,
		},

		data() {
			return {
				tabIdx: 0,
				datas: [
					[],
					[],
					[]
				],
				offsets: [0, 0, 0],
				counts: [10, 10, 10],
				onloadingStatuses: ["more", "more", "more"],
				onloadingText: {
					contentdown: "点击加载更多收藏",
					contentrefresh: "加载中...",
					contentnomore: "没有更多收藏了"
				},
			}
		},

		methods: {
			changeTab() {
				this.loadMore()
			},
			goToQuestion(favorite) {
				if (favorite.data.isObjectiveQuestion) {
					uni.navigateTo({
						url: '../contest/contest?contestId=' + favorite.data.contestId + '&questionId=' + favorite.data.id +
							'&questionType=objective'
					})
				} else {
					uni.navigateTo({
						url: '../contest/contest?contestId=' + favorite.data.contestId + '&questionId=' + favorite.data.id +
							'&questionType=subjective'
					})
				}
			},
			goToCourseWare(fav) {
				uni.navigateTo({
					url: '../conurse_ware/course_ware?courseWareId=' + fav.data.id
				})
			},
			goToTopic(fav) {
				uni.navigateTo({
					url: '../topic/topic?topicId=' + fav.data.id
				})
			},

			async loadMore() {
				// 处理当前tab的loadmore, tab顺序为 题目，课件，评论
				let IDX = this.tabIdx
				console.log("load more offset:", this.offsets[IDX]);

				if (this.offsets[IDX] > this.datas[IDX].length) {
					return;
				}

				this.onloadingStatuses[IDX] = "loading";

				let data = []
				if (IDX === 0) {
					// 加载题目
					data = await this.getFavoriteQuestions(this.offsets[IDX], this.counts[IDX]);
					console.log("获得题目", data);
				} else if (IDX === 1) {
					// 加载课件
					data = await this.getFavoriteCourseWares(this.offsets[IDX], this.counts[IDX])
					console.log("获得课件", data);
				} else if (IDX === 2) {
					// 加载评论
					data = await this.getFavoriteTopics(this.offsets[IDX], this.counts[IDX])
					console.log("获得评论", data);
				}

				this.datas[IDX].push(...data)

				// 更新offset 和 onLoading 类型（是否有更多加载）
				this.offsets[IDX] += this.counts[IDX];
				this.onloadingStatuses[IDX] = this.offsets[IDX] === this.datas[IDX].length ? "more" : "noMore";
			},

			getFavoriteQuestions(offset, count) {
				return new Promise((resolve, reject) => {
					let p = FavoriteUtils.getFavoritesByType([FavoriteUtils.OBJECTIVE_QUESTION_TYPE, FavoriteUtils.SUBJECTIVE_QUESTION_TYPE],
						offset, count)
					p.then(data => {
						data.forEach(e => {
							CommonUtils.dateConverterBatch(e, false, 'createGmt')
						});

						resolve(data);
					});
				})
			},

			getFavoriteCourseWares(offset, count) {
				return new Promise((resolve, reject) => {
					let p = FavoriteUtils.getFavoritesByType([FavoriteUtils.COURSE_WARE_TYPE],
						offset, count)
					p.then(data => {
						data.forEach(e => {
							CommonUtils.dateConverterBatch(e, false, 'createGmt')
						});

						resolve(data);
					});
				})
			},

			getFavoriteTopics(offset, count) {
				return new Promise((resolve, reject) => {
					let p = FavoriteUtils.getFavoritesByType([FavoriteUtils.TOPIC_TYPE],
						offset, count)
					p.then(data => {
						data.forEach(e => {
							CommonUtils.dateConverterBatch(e, false, 'createGmt')
						});

						resolve(data);
					});
				})
			},
		},

		onLoad() {
			this.loadMore()
		}
	}
</script>

<style lang="scss">
	.item {
		background-color: #fff;
		margin: 4rpx 0;
		padding: 14rpx;

		.title {
			font-size: 34rpx;
			font-weight: 500;
			word-break: break-all;
			max-width: 98%;
		}

		.footer {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-top: 20rpx;

			.date-box {
				font-size: 24rpx;
				color: gray;
			}
		}

		.date-box2 {
			margin-top: 20rpx;
			font-size: 24rpx;
			color: gray;
		}

	}
</style>
