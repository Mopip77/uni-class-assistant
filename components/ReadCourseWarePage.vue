<template>
	<!-- 课件每一页的组件
		
		传入课件ID courseWareId:String, 课件页信息pages: [{url, readSeconds}, ...], 已读的页数readPageIdx: [], 当前页索引值currentPageIdx: Number, 是否是老师isTeacher: boolean
		关闭的回调: closeModal()
	 -->

	<view>

		<view class="page-box">
			<view class="header">
				<view class="title">
					第 {{DcurrentPageIdx + 1}} 页
				</view>
				<van-button custom-class="my-button" plain square type="primary" @tap="goBack">返回</van-button>
			</view>

			<view class="image-box">
				<image @tap="previewImage" :src="pages[DcurrentPageIdx].url"></image>
			</view>

			<view class="navi-box">
				<view class="my-button-group">
					<van-button :disabled="DcurrentPageIdx === 0" custom-class="my-button" square type="primary" @tap="formerPage">上一页</van-button>
					<van-button :disabled="DcurrentPageIdx === pages.length - 1" custom-class="my-button" square type="primary" @tap="nextPage">下一页</van-button>
				</view>
			</view>
		</view>

	</view>
</template>

<script>
	import Button from "@/wxcomponents/vant/dist/button/index.js";
	import CourseWareUtils from '@/static/js/course_ware.js'

	export default {
		components: {
			"van-button": Button,
		},

		props: {
			courseWareId: {
				type: String,
				required: true
			},
			pages: {
				type: Array,
				required: true
			},
			readPageIdx: {
				type: Array,
				required: true
			},
			currentPageIdx: {
				type: Number,
				required: true
			},
			isTeacher: {
				type: Boolean,
				required: true
			}
		},

		data() {
			return {
				DreadPageIdx: [...this.readPageIdx],
				DcurrentPageIdx: this.currentPageIdx,

				// 定时器
				tout: '',
			}
		},
		computed: {
			imageUrls() {
				return this.pages.map(e => e.url)
			}
		},

		methods: {
			goBack() {
				this.$emit('closeModal')
			},
			previewImage() {
				let idx = this.DcurrentPageIdx

				uni.previewImage({
					urls: this.imageUrls,
					current: idx
				})
			},
			formerPage() {
				this.DcurrentPageIdx = this.DcurrentPageIdx - 1 < 0 ? 0 : this.DcurrentPageIdx - 1
			},
			nextPage() {
				this.DcurrentPageIdx = this.DcurrentPageIdx + 1 >= this.pages.length ? this.pages.length - 1 : this.DcurrentPageIdx +
					1
			},
			readPage(readSeconds) {
				let idx = this.DcurrentPageIdx
				if (this.DreadPageIdx.indexOf(idx) < 0) {
					let promise = CourseWareUtils.readPage(this.courseWareId, idx, readSeconds)
					promise
						.then(data => {
							console.log("readPage", data);
						})
				}
			}
		},
		created() {
			if (!this.isTeacher) {
				this.tout = setInterval(() => {
					this.readPage(6)
				}, 2000);
			}

		},
		destroyed() {
			clearInterval(this.tout)
		}
	}
</script>

<style lang="scss">
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 40rpx 20rpx;
		background-color: $global-background-color;

		.title {
			font-size: 40rpx;
			font-weight: 600;
		}

		.my-button {
			width: 120rpx;
			height: 60rpx;
		}
	}

	.image-box {
		display: flex;
		justify-content: space-around;
		margin: 80rpx;

		image {
			width: 700rpx;
			height: 525rpx;
		}
	}

	.my-button-group {
		display: flex;
		justify-content: space-around;

		.my-button {
			width: 160rpx;
			height: 80rpx;
		}
	}
</style>
