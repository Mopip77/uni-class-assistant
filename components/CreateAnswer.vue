<template>
	<!-- 
		本页面是回答页面，包括了客观题和主观题
		既可以当作填写试卷的页面，也可以当作查看的页面，几种情况如下
		1、老师 - 查看       客观题会显示正确答案，主观题只有题目
		2、学生 - 写试卷     客观、主观题都是可编辑状态
		3、学生 - 查看 - 试卷未截止    只能查看到自己的答案并且不能编辑
		4、学生 - 查看 - 试卷截止 - 老师未批改     客观题能看到自己的答案和正确答案，主观题能看到题目和自己的答案，并且提示老师未批改
		5、学生 - 查看 - 试卷截止 - 老师已批改     客观题能看到自己的答案和正确答案，主观题能看到题目和自己的答案和分数
		
		其中老师和学生根据传入isTeacher来判断，查看和编辑状态根据传入look来判断，试卷是否截止根据传入question是否有正确答案来判断，老师是否批改根据传入revised值来判断
	
	
		由于只有一个可编辑的地方就是学生写题目的时候，此时提交则会emit successCallback(index, questionType, {answer}) 
		其中answer如果是客观题就返回{optionAnswers}, 如果是主观题就返回{content, answerImageUrls},
		
		默认关闭modal会emit closeModal()
	 -->
	<view>
		<van-notify class="on-top" id="van-notify" />
		
		<view class="question-box">
			<view class="header">
				<text>题目</text>
				<text>{{Dscore}}分</text>
			</view>
			<view class="question">
				{{Dquestion}}
			</view>
			<view class="image-list">
				<view class="image-item" v-for="(url, idx) in DimageUrls" :key="idx">
					<image @tap="previewImage(idx, 'question')" :src="url"></image>
				</view>

			</view>

			<view v-if="DquestionType === 'objective'" class="option-list-box">

				<view v-if="Dlook" class="option-list">
					<view class="option" v-for="(option, idx) in Doptions" :key="idx">
						<checkbox v-if="!isTeacher" disabled :value="idx" :checked="option.checked" @click="optionChecked(option, idx)" />
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

		<view v-if="!Dlook && DquestionType === 'subjective'" class="answer-box">
			<view class="header">回答区域</view>
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
		
		<view class="my-button-group">
			<van-button custom-class="my-button" plain square type="primary" @tap="onCancel">返回</van-button>
			<van-button :disabled="Dlook" custom-class="my-button" square type="primary" @tap="submitAnswer">提交</van-button>
		</view>
	</view>
</template>

<script>
	import robbyImageUpload from '@/components/robby-image-upload/robby-image-upload.vue'
	import vanButton from '@/wxcomponents/vant/dist/button/index.js'
	import VanNotify from "@/wxcomponents/vant/dist/notify/index.js";
	import Notify from "@/wxcomponents/vant/dist/notify/notify.js";
	
	import HttpCommons from '@/static/js/http_commons.js'
	import ApiReference from '@/static/js/api_reference.js'
	
	export default {
		components: {
			vanButton,
			robbyImageUpload,
			"van-notify": VanNotify,
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
			score: {
				type: Number,
				required: true
			},
			question: {
				type: String,
				required: true
			},
			imageUrls: {
				type: Array,
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
			options: {
				type: Array,
			},
			correctOptions: { // 正确答案 <!-- 如果传入正确答案说明要么是老师，要么是学生并且答题已经结束了 -->
				type: Array,
			},
			optionAnswers: {
				type: Array,
			},
			content: {
				type: String,
			},
			answerImageUrls: {
				type: Array,
			},
		},
		data() {
			return {
				Dindex: this.index,
				DquestionType: this.questionType,
				Dscore: this.score,
				Dquestion: this.question,
				DimageUrls: [],
				Dlook: this.look,
				Drevised: this.revised,
				DisTeacher: this.isTeacher,
				Doptions: [],
				DcorrectOptions: [],
				DoptionAnswers: [],
				Dcontent: this.content,
				DanswerImageUrls: [],
				
				
				imageList: [],
			};
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
				if (this.DquestionType === 'objective') {
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
				
				this.$emit('successCallback', this.Dindex, this.DquestionType, result)
				this.$emit('closeModal')
			},
			optionChecked(option) {
				option.checked = !option.checked
			} 
		},
		created() {
			console.log("onload。。。");
			this.DimageUrls = [...this.imageUrls]
			console.log("提前看看options", this.options);
			this.Doptions = this.options.map((e, idx)=> {
				return {
					correct: this.correctOptions.indexOf(idx) >= 0,
					checked: this.optionAnswers.indexOf(idx) >= 0,
					value: e
				}
			})
			this.DcorrectOptions = [...this.correctOptions]
			this.DoptionAnswers = [...this.optionAnswers]
			this.DanswerImageUrls = [...this.answerImageUrls]
			
			console.log("Dindex", this.Dindex);
			console.log("DquestionType", this.DquestionType);
			console.log("Dscore", this.Dscore);
			console.log("Dquestion", this.Dquestion);
			console.log("DimageUrls", this.DimageUrls);
			console.log("Dlook", this.Dlook);
			console.log("Doptions", this.Doptions);
			console.log("DoptionAnswers", this.DoptionAnswers);
			console.log("Dcontent", this.Dcontent);
			console.log("DanswerImageUrls", this.DanswerImageUrls);
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
		
		textarea {
			@include common-textarea;
			background-color: #fff;
			height: 600rpx;
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
