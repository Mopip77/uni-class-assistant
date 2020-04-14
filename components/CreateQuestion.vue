<template>
	<!-- 创建题目 （客观题、主观题）
		
		props:
		 - 必传
			index 创建contest界面可以创建多个question，所以需要传入index，这里修改完再emit出去
			questionType = {'objective', 'subjective'}
		 - 选传
			type = {'modify', 'create'} 默认create，也可以修改题目
			score 如果是修改题目，需要把原来的值传入
			content 同上
			imageUrls:[] 传入已经上传到OSS的照片的网址，由于使用选取图片组件只支持本地虚拟路径，所以传入这些image只能预览，如果想要修改只能全部重传
			options: [] 每个option为{checked: bool, value: String}
		
		emit:
			closeModal(): 隐藏该component
			successCallback({index, questionType, score, content, imageUrls, options})  // 可以通过index对应元素的有无来判断是修改还是新建
			delete({index, type}): 删除该question
	 -->

	<view>
		<van-notify class="on-top" id="van-notify" />

		<view class="create-question-header">
			<view class="title">
				<text v-if="type === 'create'">创建</text>
				<text v-else>修改</text>
				<text v-if="DquestionType === 'objective'">客观</text>
				<text v-else>主观</text>
				题
			</view>

			<view class="my-button-group">
				<van-button custom-class="my-button" plain square type="primary" @tap="onCancel">取消</van-button>
				<van-button v-if="type === 'modify'" custom-class="my-button" square type="danger" @tap="deleteThisQuestion">删除</van-button>
				
				<van-button custom-class="my-button" square type="primary" @tap="createQuestion">
					<text v-if="type === 'create'">创建</text>
					<text v-else>修改</text>
				</van-button>
			</view>
		</view>


		<view class="score-box">
			<text>设置分数: </text>
			<slider :value="Dscore" min="1" :max="DquestionType === 'objective' ? 20 : 100" @change="scoreChange" step="1" show-value />
			<text class="slider-suffix">分</text>
		</view>

		<view class="question-box">
			<view class="sub-title">
				题目内容
			</view>
			<textarea maxlength="-1" v-model="Dcontent" class="question-content" placeholder="请输入问题..." />
			</view>
		
		<view class="image-box">
			<view class="sub-title">
				<text>添加图片附件(可选)</text>
				<view><van-button v-if="DimageUrls.length > 0" custom-class="my-button" square type="danger" @tap="rePickImages">重选</van-button></view>
			</view>
			
			<view v-if="DimageUrls.length > 0" class="image-select">
				<view class="image-list" v-for="(url, idx) in DimageUrls" :key="idx">
					<image class="question-image" :src="url"></image>
				</view>
			</view>
			<view v-else class="image-slect">
				<robby-image-upload v-model="imageList" :limit="DquestionType === 'objective' ? 1 : 6"></robby-image-upload>
			</view>
		</view>
		
		<view v-if="DquestionType === 'objective'" class="option-list-box">
			<view class="header">
				<view class="sub-title">
					添加选项 
					<view class="sub-info">(并勾选正确选项)</view>
				</view>
				<van-button custom-class="my-button" square type="primary" @tap="addOption">+</van-button>
			</view>
			
			<view class="option-list">
				<view class="option" v-for="(option, idx) in Doptions" :key="idx">
					<checkbox :value="idx" :checked="option.checked" @click="optionChecked(option)" />
					<input v-if="option.modifying" type="text" v-model="option.value" focus confirm-type="done" placeholder="请输入选项内容..." @blur="setOptionModifying(idx, false)" @confirm="setOptionModifying(idx, false)" />
					<text v-else @tap="setOptionModifying(idx, true)">{{option.value}}</text>
	
					<view class="right-button-box">
						<van-button custom-class="my-button" square type="danger" @tap="deleteOption(idx)">删除</van-button>
					</view>
					
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import Button from "@/wxcomponents/vant/dist/button/index.js";
	import VanNotify from "@/wxcomponents/vant/dist/notify/index.js";
	import Notify from "@/wxcomponents/vant/dist/notify/notify.js";
	import robbyImageUpload from '@/components/robby-image-upload/robby-image-upload.vue'
	
	import ApiReference from '@/static/js/api_reference.js'
	import HttpCommons from '@/static/js/http_commons.js'
	
	export default {
		components: {
			robbyImageUpload,
			"van-button": Button,
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
			type: {
				type: String,
				default: 'create'
			},
			score: {
				type: Number,
				default: 1
			},
			content: {
				type: String,
				default: ''
			},
			imageUrls: {
				type: Array,
				default: () => []
			},
			options: {
				type: Array,
				default: () => []
			}
		},
		data() {
			return {
				Dindex: this.index,
				DquestionType: this.questionType,
				Dscore: this.score,
				Dcontent: this.content,
				DimageUrls: this.imageUrls,
				Doptions: [],
				imageList: [],
			};
		},
		computed: {
			// 由于是对象，所以需要深拷贝
			computedOptions() {
				let arr = []
				this.options.forEach(e => {
					arr.push({
						checked: e.checked,
						value: e.value,
						modifying: false
					})
				})
				this.Doptions = arr;
				return arr;
			}
		},
		methods: {
			// component
			// 整体相关
			onCancel() {
				this.$emit('closeModal')
			},
			deleteThisQuestion() {
				this.$emit('delete', {index: this.Dindex, type: this.DquestionType})
				this.$emit('closeModal')
			},
			// 上传图片
			async uploadImages(){
				let that = this
				let arr = []
				for (let k in that.imageList) {
					try {
						arr[k] = await HttpCommons.uploadImage(ApiReference.UPLOAD_QUESTION, that.imageList[k])
					} catch (e) {
						return null
					}
					
				} 
				return arr;
			},
			// 创建题目
			async createQuestion() {
				if (!this.Dcontent) {
					Notify({
					type: "danger",
					message: '题目不能为空'
					});
					return false;
				}
				
				if (this.DquestionType === 'objective' && !this.isOptionValid()) {
					return;
				}
				
				let imageUrls = this.DimageUrls
				// 上传照片
				if (this.imageList.length > 0) {
					uni.showLoading({
						title: '上传图片中'
					});
					
					imageUrls = await this.uploadImages()
					
					uni.hideLoading();
					if (null === imageUrls) {
						return;
					}
				}
				
				let result = {
					index: this.Dindex,
					questionType: this.DquestionType,
					score: this.Dscore,
					content: this.Dcontent,
					imageUrls: imageUrls
				}
				console.log("创建之前",this.DquestionType, result);
				if (this.DquestionType === 'objective') {
					result.options = this.Doptions
					console.log("创建之前，添加option", result);
				}
				
				this.imageList = []
				this.$emit('successCallback', result)
				this.$emit('closeModal')
			},
			// images相关
			rePickImages() {
				this.DimageUrls = []
			},
			// score相关
			scoreChange(e) {
				this.Dscore = e.detail.value
			},
			// option相关
			addOption() {
				// 最多8个选项
				let Str = "ABCDEFGH";
				
				if (this.Doptions.length >= Str.length) {
					Notify({
					type: "danger",
					message: '不能添加更多选项了'
					});
					return;
				}
				
				this.Doptions = this.Doptions.concat({
					checked: false,
					modifying: false,
					value: "选项" + Str[this.Doptions.length]
				})
			},
			optionChecked(option) {
				option.checked = !option.checked
			},
			setOptionModifying(idx, value) {
				if (idx >= this.Doptions.length) {
					Notify({
					type: "danger",
					message: '传入索引错误'
					});
					return;
				}
				
				this.Doptions[idx].modifying = value
			},
			deleteOption(idx) {
				this.Doptions.splice(idx, 1);
			},
			isOptionValid() {
				// 检查选择题选项适合合规
				if (this.DquestionType === 'objective' && this.Doptions.length <= 1) {
					Notify({
					type: "danger",
					message: '请至少提供两个或以上的选项'
					});
					return false;
				}
				
				if (this.Doptions.filter(e => e.checked).length === 0) {
					Notify({
					type: "danger",
					message: '请标注至少一个正确答案'
					});
					return false;
				}
				
				return true;
			}
		},
	}
</script>

<style lang="scss">
	@import "~@../../static/css/common.scss";
	
	.create-question-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 20rpx 20rpx 40rpx 10rpx;
		
		.title {
			margin: 0;
			font-size: 50rpx;
			font-weight: 600;
			display: flex;
			align-items: flex-end;
		}
		
		.my-button-group {
			.my-button {
				width: 120rpx;
				height: 70rpx;
				margin-left: 24rpx;
				border-radius: 6rpx;
			}
		}
	}
	
	.sub-title {
		font-size: 36rpx;
		font-weight: 500;
		margin: 10rpx;
	}
	
	.score-box {
		display: flex;
		align-items: center;
		margin: 0 10rpx;

		slider {
			width: 500rpx;
			margin-right: 0;
		}
		
		.slider-suffix {
			font-size: 28rpx;
			color: #616161;
			margin-left: 8rpx;
		}
	}
	
	.question-box {
		padding: 0;
		
		textarea {
			background-color: #fff;
			width: 100%;
			margin: 10rpx 0;
			padding: 10rpx;
		}
	}
	
	.image-box {
		margin-bottom: 40rpx;
		
		.sub-title {
			display: flex;
			justify-content: space-between;
			align-items: center;
			
			.my-button {
				width: 120rpx;
				height: 50rpx;
				border-radius: 6rpx;
			}
		}
		
		.image-select {
			display: flex;
			flex-wrap: wrap;
			
			.image-list {
				margin-top: 20rpx;
				margin-left: 36rpx;
				
				.question-image {
					width: 200rpx;
					height: 200rpx;
				}
			}
		}
	}
	
	.option-list-box {
		margin-bottom: 200rpx;
		
		.header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			
			.sub-title {
				font-size: 36rpx;
				font-weight: 500;
				margin: 10rpx;
				display: flex;
				align-items: flex-end;
				
				.sub-info {
					font-weight: 400;
					font-size: 25rpx;
					margin-left: 6rpx;
					color: gray;
				}
			}
			
			.my-button {
				width: 100rpx;
				height: 60rpx;
				margin-right: 14rpx;
				border-radius: 6rpx;
			}
		}
		
		.option-list {
			margin-top: 10rpx;
			border-bottom: 1rpx gray dashed;

			.option {
				display: flex;
				align-items: center;
				padding: 15rpx 10rpx;
				border-top: 1rpx gray dashed;
				
				text {
					margin-left: 10rpx;
					width: 500rpx;
				}
				
				input {
					@include common-input;
					padding: 2rpx 14rpx;
					width: 500rpx;
				}
				
				.right-button-box {
					margin-left: auto;
					
					.my-button {
						height: 50rpx;
						border-radius: 8rpx;
					}
				}
				
			}
		}
	}
</style>
