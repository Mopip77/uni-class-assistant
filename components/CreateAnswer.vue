<template>
	<!-- 
		本页面是回答页面，包括了客观题和主观题
		既可以当作填写试卷的页面，也可以当作查看的页面，几种情况如下
		1、老师 - 查看       客观题会显示正确答案，主观题只有题目
		2、学生 - 写试卷     客观、主观题都是可编辑状态
		3、学生 - 查看 - 试卷未截止    只能查看到自己的答案并且不能编辑
		4、学生 - 查看 - 试卷截止 - 老师未批改     客观题能看到自己的答案和正确答案，主观题能看到题目和自己的答案，并且提示老师未批改
		5、学生 - 查看 - 试卷截止 - 老师已批改     客观题能看到自己的答案和正确答案，主观题能看到题目和自己的答案和分数
		
		其中老师和学生根据传入isTeacher来判断，查看和编辑状态根据传入look来判断，试卷是否截止根据传入leftSeconds来判断，老师是否批改根据传入revised值来判断
	
	
		由于只有一个可编辑的地方就是学生写题目的时候，此时提交则会emit successCallback(index, questionType, {answer}) 
		其中answer如果是客观题就返回{optionAnswers}, 如果是主观题就返回{content, answerImageUrls},
		
		默认关闭modal会emit closeModal()
	 -->
	<view>
		<van-notify class="on-top" id="van-notify" />
		
		<view class="question-box">
			<view class="header">
				<view class="left">
					<text>题目</text>
					<view class="favorite-icon">
						<!-- 先把位置固定了，还需要知道使用fav的api判断是否是已经收藏了 -->
						<van-icon v-if="favorited" name="star-o" />
						<van-icon v-else color="#e74c3c" name="star" />
					</view>
				</view>
				<text v-if="!isTeacher && look && leftSeconds <= 0"> {{answer.score}} / {{question.score}}分</text>
				<text v-else>{{question.score}}分</text>
			</view>
			
			<view class="question">
				{{question.question}}
			</view>
			
			<view class="image-list">
				<view class="image-item" v-for="(url, idx) in DimageUrls" :key="idx">
					<image @tap="previewImage(idx, 'question')" :src="url"></image>
				</view>
			</view>

			<view v-if="questionType === 'objective'" class="option-list-box">

				<view v-if="look" class="option-list">
					<view class="option" v-for="(option, idx) in Doptions" :key="idx">
						<checkbox v-if="!isTeacher" disabled :value="idx" :checked="option.checked" />
						<text :style="option.correct ? 'color:green;' : ''">{{option.value}}</text>
					</view>
				</view>
				
				<view v-else class="option-list">
					<view class="option" v-for="(option, idx) in Doptions" :key="idx">
						<checkbox :value="idx" :checked="option.checked" @click="optionChecked(option)" />
						<text>{{option.value}}</text>
					</view>
				</view>

			</view>
		</view>

		<view v-if="!isTeacher && questionType === 'subjective'" class="answer-box">
			<view class="header">回答区域</view>
			<view v-if="!look">
				<textarea v-model="Dcontent" auto-height maxlength="-1" placeholder="请输入回答内容..." />
				
				<view v-if="DanswerImageUrls.length === 0" class="image-box">
					<view class="header">上传图片附件</view>
					<robby-image-upload v-model="imageList" :limit="3"></robby-image-upload>
				</view>
				
				<view v-else class="image-box">
					<view class="header">
						<text>上传图片附件</text>
						<van-button @tap="rePickImage" custom-class="button" type="danger">重选</van-button>
					</view>
					
					<view class="image-list">
						<view class="image-item" v-for="(url, idx) in DanswerImageUrls" :key="idx">
							<image @tap="previewImage(idx, 'answer')" :src="url"></image>
						</view>
					</view>
				</view>
			</view>
			
			<view v-else>
				<view class="answer">
					{{answer.content}}
				</view>
				
				<view class="image-box">
					<view class="image-list">
						<view class="image-item" v-for="(url, idx) in DanswerImageUrls" :key="idx">
							<image @tap="previewImage(idx, 'answer')" :src="url"></image>
						</view>
					</view>
				</view>
			</view>
			
		</view>
		
		<view class="my-button-group">
			<van-button custom-class="my-button" plain square type="primary" @tap="onCancel">返回</van-button>
			<van-button :disabled="look" custom-class="my-button" square type="primary" @tap="submitAnswer">提交</van-button>
		</view>
	</view>
</template>

<script>
	import robbyImageUpload from '@/components/robby-image-upload/robby-image-upload.vue'
	import vanButton from '@/wxcomponents/vant/dist/button/index.js'
	import VanNotify from "@/wxcomponents/vant/dist/notify/index.js";
	import Notify from "@/wxcomponents/vant/dist/notify/notify.js";
	import Icon from '@/wxcomponents/vant/dist/icon/index.js'
	
	import HttpCommons from '@/static/js/http_commons.js'
	import ApiReference from '@/static/js/api_reference.js'
	
	export default {
		components: {
			vanButton,
			robbyImageUpload,
			"van-notify": VanNotify,
			"van-icon": Icon,
		},
		props: {
			index: {
				type: Number,
				required: true
			},
			questionType: {
				type: String,
				required: true
			},
			leftSeconds: {
				type: Number,
				required: true
			},
			look: {  // 是否只是查看题目
				type: Boolean,
				required: true
			},
			revised: { // 是否批改
				type: Boolean
			},
			isTeacher: { // 是否是老师
				type: Boolean
			},
			question: {  
				// 问题 根据类型不同有 
				// 客观题:{score: Number, question: String, imageUrl: String, choices:[], answerIndices: []}
				// 主观题:{score: Number, question: String, imageUrls: []}
				type: Object,
				required: true
			},
			answer: {
				// 问题 根据类型不同有 
				// 客观题答案:{score: Number, options:[]}
				// 主观题答案:{score: Number, content: String, imageUrls: []}
				type: Object,
				required: true
			}
		},
		data() {
			return {
				imageList: [],
				DanswerImageUrls: this.answer.imageUrls ? [...this.answer.imageUrls] : [],
				Dcontent: this.answer.content,
				
				favorited: false
			};
		},
		computed: {
			Doptions() {
				if (this.questionType === 'objective') {
					let that = this
					return this.question.choices.map((e, idx) => {
						return {
							checked: that.answer.options.indexOf(idx) >= 0,
							correct: that.question.answerIndices ? that.question.answerIndices.indexOf(idx) >= 0 : false,
							value: e
						}
					})
				} else {
					return []
				}
			},
			DimageUrls() {
				if (this.questionType === 'objective') {
					return this.question.imageUrl ? [this.question.imageUrl] : []
				} else {
					return [...this.question.imageUrls]
				}
			}
		},
		methods: {
			previewImage(idx, type) {
				let that = this
				if (type === 'question') {
					uni.previewImage({
						current: idx,
						urls: that.DimageUrls
					})
				} else {
					uni.previewImage({
						current: idx,
						urls: that.DanswerImageUrls
					})
				}
			},
			rePickImage() {
				this.DanswerImageUrls.splice(0)
			},
			onCancel() {
				this.$emit('closeModal')
			},
			async submitAnswer() {
				let result = {}
				if (this.questionType === 'objective') {
					let answers = []
					this.Doptions.forEach((e, idx) => {
						if (e.checked) {
							answers.push(idx)
						}
					})
					result.optionAnswers = answers
				} else {
					// 上传图片
					if (this.imageList.length > 0) {
						uni.showLoading({
							title: '上传图片中'
						});
						
						let arr = []
						for (var i = 0; i < this.imageList.length; i++) {
							try {
								let url = await HttpCommons.uploadImage(ApiReference.UPLOAD_QUESTION, this.imageList[i])
								arr.push(url)
							} catch(e) {
								Notify({
									type: 'danger',
									message: '上传图片失败'
								})
								uni.hideLoading();
								return;
							}
						}
						
						uni.hideLoading();
						this.DanswerImageUrls = arr
					}
					
					result.content = this.Dcontent
					result.answerImageUrls = this.DanswerImageUrls
				}
				
				this.$emit('successCallback', this.index, this.questionType, result)
				this.$emit('closeModal')
			},
			optionChecked(option) {
				option.checked = !option.checked
			} 
		},
		created() {
			console.log("Dindex", this.index);
			console.log("questionType", this.questionType);
			console.log("question", this.question);
			console.log("look", this.look);
			console.log("Doptions", this.Doptions);
			console.log("answer", this.answer);
		}
	}
</script>

<style lang="scss">
	@import '~@/static/css/common.scss';
	
	.header {
		background-color: #4FC3F7;
		color: white;
		font-size: 40rpx;
		display: flex;
		align-items: center;
		padding: 4rpx 10rpx;
		
		.left {
			align-items: center;
			display: flex;
			
			.favorite-icon {
				display: flex;
				align-items: center;
				margin-left: 18rpx;
			}
		}
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
	
	.question-box {
		margin-top: 50rpx;
		margin-bottom: 40rpx;
		padding: 10rpx 0;
		
		// 由于组件外面的contest页面正好也有.question-box .header，所以这要还需要覆盖一次
		.header {
			background-color: #4FC3F7;
			color: white;
			font-size: 40rpx;
			display: flex;
			align-items: center;
			padding: 4rpx 10rpx;
		}
		
		.question {
			margin-bottom: 40rpx;
			padding: 0 4rpx;
		}
	}
	
	.answer-box {
		.answer {
			margin: 28rpx 0;
			padding: 0 4rpx;
		}
		
		textarea {
			@include common-textarea;
			min-height: 300rpx;
			background-color: #fff;
		}
		
		.image-box {
			margin-top: 40rpx;
			
			.header {
				display: flex;
				justify-content: space-between;
				padding: 0;
				
				.button {
					height: 60rpx;
					width: 150rpx;
				}
			}
		}
	}
	
	.my-button-group {
		margin-top: 60rpx;
		display: flex;
		justify-content: space-around;
		
		.my-button {
			border-radius: 10%;
			width: 150rpx;
		}
	}
</style>
