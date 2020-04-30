<template>
	<view>
		
		<view class="on-top">
			<van-notify class="on-top" id="van-notify" />
		</view>
		
		<STabs effect="true" navPerView="2" v-model="tabIndex" @change="changeTab">
			<STab title="我发布的">
				<view class="list contest-list">
					<view class="contest-item" v-for="(contest, idx) in contests[0]" :key="idx" @tap="goToContest(idx)">
						<view class="header">
							<view v-if="contest.status === '未开始'" class="status" style="color: #607D8B;">未开始</view>
							<view v-if="contest.status === '已结束'" class="status" style="font-style: italic;">已结束</view>
							<view v-if="contest.status === '进行中'" class="status" style="color: red;">进行中</view>
							<view v-if="contest.status === '可进行'" class="status" style="color: #e57373;">可进行</view>
							<view class="time-box">
								<view v-if="contest.publishDate" class="publish-date">开始时间:{{contest.publishDate}}</view>
								<view v-if="contest.deadline" class="publish-date">截止时间:{{contest.deadline}}</view>
							</view>
						</view>
						<view class="footer">
							<view class="user-box">
								<image :src="contest.creator.avatarUrl"></image>
								<text>{{contest.creator.nickname}}</text>
								<text class="course-name">【{{contest.courseName}}】</text>
							</view>
				
							<view v-if="contest.limitMinutes > 0" class="limit-time">限时: {{contest.limitMinutes}}分钟</view>
						</view>
					</view>
					<uni-load-more :status="onloadingStatuses[0]" @clickLoadMore="loadMore" :contentText="onloadingTexts[0]"></uni-load-more>
				</view>
			</STab>
			<STab title="我参与的">
				<view class="list contest-list">
					<view class="contest-item" v-for="(contest, idx) in contests[1]" :key="idx" @tap="goToContest(idx)">
						<view class="header">
							<view v-if="contest.status === '未开始'" class="status" style="color: #607D8B;">未开始</view>
							<view v-if="contest.status === '已结束'" class="status" style="font-style: italic;">已结束</view>
							<view v-if="contest.status === '进行中'" class="status" style="color: red;">进行中</view>
							<view v-if="contest.status === '可进行'" class="status" style="color: #e57373;">可进行</view>
							<view class="time-box">
								<view v-if="contest.publishDate" class="publish-date">开始时间:{{contest.publishDate}}</view>
								<view v-if="contest.deadline" class="publish-date">截止时间:{{contest.deadline}}</view>
							</view>
						</view>
						<view class="footer">
							<view class="user-box">
								<image :src="contest.creator.avatarUrl"></image>
								<text>{{contest.creator.nickname}}</text>
								<text class="course-name">【{{contest.courseName}}】</text>
							</view>
				
							<view v-if="contest.limitMinutes > 0" class="limit-time">限时: {{contest.limitMinutes}}分钟</view>
						</view>
					</view>
					<uni-load-more :status="onloadingStatuses[1]" @clickLoadMore="loadMore" :contentText="onloadingTexts[1]"></uni-load-more>
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
	import ContestUtils from '@/static/js/contest.js'
	
	export default {
		components: {
			UniLoadMore,
			STabs,
			STab,
		},
		
		data() {
			return {
				tabIndex: 0,
				contests: [
					[],
					[]
				],
				steps: [],
				offsets: [0, 0],
				counts: [10, 10],
				onloadingStatuses: ["more", "more"],
				onloadingTexts: [{
						contentdown: "点击加载更多试卷",
						contentrefresh: "加载中...",
						contentnomore: "没有更多试卷了"
					},
					{
						contentdown: "点击加载更多试卷",
						contentrefresh: "加载中...",
						contentnomore: "没有更多试卷了"
					},
				],
			};
		},
		
		methods: {
			/**
			 * 四个tab公用一个loadMore加载函数
			 */
			async loadMore() {
				let idx = this.tabIndex
			
				if (this.offsets[idx] > this.contests[idx].length) {
					return;
				}
			
				this.onloadingStatuses[idx] = "loading";
			
				let data = []
				if (idx === 0) {
					// 加载发布的试卷
					data = await this.getContestsAsCreator()
					console.log("获得发布的试卷", data);
				} else if (idx === 1) {
					// 加载写过的试卷
					data = await this.getContestsAsParticipator()
					console.log("获得写过的试卷", data);
				}
			
				this.contests[idx].push(...data)
			
				// 更新offset 和 onLoading 类型（是否有更多加载）
				this.offsets[idx] += this.counts[idx];
				this.onloadingStatuses[idx] = this.offsets[idx] === this.contests[idx].length ? "more" : "noMore";
			},
			
			changeTab() {
				let idx = this.tabIndex
				console.log("change Tab: ", idx);
				if (this.offsets[idx] === 0) {
					this.loadMore()
				}
			},
			
			// 进入contest界面
			goToContest(idx) {
				let contest = this.contests[this.tabIndex][idx]
				if (contest.status === '未开始') {
					// 可能时间已经到了，还是要判断一下发布时间
					if (new Date() - new Date(contest.publishDate) < 0) {
						Notify({
							type: 'danger',
							message: '测试还未开始'
						})
						return;
					}
				}
				
				uni.navigateTo({
					url: '../contest/contest?contestId=' + contest.id
				})
			},
			
			// func
			// 通过contest创建者获取contest
			getContestsAsCreator() {
				let that = this
				let idx = this.tabIndex
				console.log("获取contest creat中... idx:", idx, " offsets:", this.offsets[idx]);
				return new Promise((resolve, reject) => {
					let promise = ContestUtils.getContestAsCreator(
						that.offsets[idx],
						that.counts[idx]
					);
					promise.then(data => {
						data.forEach(e => CommonUtils.dateConverterBatch(e, 'publishDate', 'deadline'))
						resolve(data);
					});
				})
			},
			
			getContestsAsParticipator() {
				let that = this
				let idx = this.tabIndex
				console.log("获取contest parti中... idx:", idx, " offsets:", this.offsets[idx]);
				return new Promise((resolve, reject) => {
					let promise = ContestUtils.getContestAsParticipator(
						that.offsets[idx],
						that.counts[idx]
					);
					promise.then(data => {
						data.forEach(e => CommonUtils.dateConverterBatch(e, 'publishDate', 'deadline'))
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
	@import  '~@/static/css/common.scss';

.contest-list {
			.contest-item {
				@include common-card;
				display: flex;
				flex-direction: column;
				height: 200rpx;
				background-image: $card-background-url;

				.header {
					display: flex;
					justify-content: space-between;
					padding: 10rpx 10rpx;
					
					.status {
						font-size: 50rpx;
						font-weight: 600;
					}
					
					.time-box {
						font-size: 24rpx;
						color: #424242;
						display: flex;
						flex-direction: column;
					}
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
				}
			}
}
</style>
