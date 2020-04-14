<template>
	<!-- 传入主观题的问题和答案和主观题所处的index	question,answer,index
		emit: closeModal, successCallback(idx, score)
	 -->
	<view>
		<view class="question-box">
			<view class="header">
				<text>题目</text>
				<text>{{question.score}}分</text>
			</view>
			<view class="question">
				{{question.question}}
			</view>
			<view class="image-list">
				<view class="image-item" v-for="(url, idx) in question.imageUrls" :key="idx">
					<image @tap="previewImage(idx, 'question')" :src="url"></image>
				</view>
			</view>
		</view>

		<view class="answer-box">
			<view class="header">
				<text>回答内容</text>
			</view>
			<view class="answer">
				{{answer.content}}
			</view>
			<view v-if="answer.imageUrls.length > 0" class="image-list">
				<view class="image-item" v-for="(url, idx) in answer.imageUrls" :key="idx">
					<image @tap="previewImage(idx, 'answer')" :src="url"></image>
				</view>
			</view>
		</view>

		<view class="score-box">
			<slider :value="score" min="0" :max="question.score" @change="sliderChange" step="1" show-value />
			<text class="slider-suffix">分</text>
		</view>

		<view class="my-button-group">
			<van-button custom-class="my-button" plain square type="primary" @tap="onCancel">返回</van-button>
			<van-button custom-class="my-button" square type="primary" @tap="submitRevise">提交</van-button>
		</view>
	</view>
</template>

<script>
	import Notify from '@/wxcomponents/vant/dist/notify/notify.js'
	
	import Button from '@/wxcomponents/vant/dist/button/index.js'
	
	export default {
		props: {
			answer: {
				type: Object,
				required: true
			},
			question: {
				type: Object,
				required: true
			},
			index: {
				type: Number,
				required: true
			}
		},
		
		components: {
			"van-button": Button
		},

		data() {
			return {
				score: this.answer.score,
			}
		},
		
		methods: {
			onCancel() {
				this.$emit('closeModal')
			},
			submitRevise() {
				if (this.score < 0 || this.score > this.question.score) {
					Notify({
						type: 'error',
						message: '输入分数范围错误'
					})
					return;
				}
				
				this.$emit('successCallback', this.index, this.score)
				this.$emit('closeModal')
			},
			sliderChange(e) {
				console.log("answer", this.answer);
				console.log("question", this.question);
				this.score = e.detail.value
				console.log("sc", this.score);
			},
			previewImage(idx, type) {
				let imageUrls = []
				if (type === 'question') {
					imageUrls = this.question.imageUrls
				} else {
					imageUrls = this.answer.imageUrls
				}
				
				uni.previewImage({
					current: idx,
					urls: imageUrls
				})
			}
		}
	}
</script>

<style lang="scss">
	.header {
		background-color: #4FC3F7;
		color: white;
		font-size: 40rpx;
		display: flex;
		align-items: center;
		padding: 4rpx 10rpx;
		justify-content: space-between;
	}
	
	.image-list {
		display: flex;
		flex-wrap: wrap;
		
		.image-item {
			margin-top: 20rpx;
			margin-left: 36rpx;
		
			image {
				width: 200rpx;
				height: 200rpx;
			}
		}
	}
	
	.answer-box {
		margin-top: 60rpx;
	}
	
	.question {
		padding: 14rpx 8rpx;
	}
	
	.answer {
		padding: 14rpx 8rpx;
	}
	
	.score-box {
		display: flex;
		align-items: center;
		margin: 40rpx 10rpx;
		
		slider {
			width: 600rpx;
			margin-right: 0;
		}
		
		.slider-suffix {
			font-size: 28rpx;
			color: #616161;
			margin-left: 8rpx;
		}
	}
	
	.my-button-group {
		display: flex;
		justify-content: space-around;
	
		.my-button {
			border-radius: 10%;
			width: 120rpx;
			margin-left: 40rpx;
			height: 60rpx;
		}
	}
	
</style>
