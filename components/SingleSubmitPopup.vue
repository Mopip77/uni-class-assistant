<template>
	<!-- 
		用于提交单个ipnut或者textarea的悬浮框
		传入整个行为的title 和 input或textarea的fieldName -> required
		还可传入 类型(input还是textarea,默认input), placeHolder、 content是否判空和是否是数字、取消、提交按钮text -> optional
		提交会emit successCallBack(textarea的content) 取消会emit cancelCallBack() => 不论哪个都会emit隐藏该窗口的closeModal
	 -->
	<view>
		<van-overlay show="true">
			<view class="box">
				<view class="title"><text>{{title}}</text></view>
				<view v-if="type === 'input'" class="field input-field">
					<text>{{fieldName}}</text>
					<van-cell-group>
						<input type="text" v-model="content" :placeholder="placeHolder" />
					</van-cell-group>
				</view>
				<view v-else class="field textarea-field">
					<text>{{fieldName}}</text>
					<view>
						<textarea :placeholder="realPlaceHolder" v-model="content" />
					</view>
				</view>

				<view class="button-group">
					<van-button type="info" @tap="cancel()" custom-style="height: 70rpx;width: 140rpx;">{{cancelText}}</van-button>
					<van-button type="primary" @tap="submit()" custom-style="height: 70rpx;width: 140rpx;">{{submitText}}</van-button>
				</view>
			</view>
		</van-overlay>
	</view>
</template>
<script>
	import LoginUtils from '@/static/js/login.js'
	import CourseUtils from '@/static/js/course.js'
	
	import Notify from '@/wxcomponents/vant/dist/notify/notify.js'
	import Buttonuu from '@/wxcomponents/vant/dist/button'
	import Overlay from '@/wxcomponents/vant/dist/overlay/index.js'
	import CellGroup from '@/wxcomponents/vant/dist/cell-group/index.js'

	export default {
		components: {
			'van-button': Buttonuu,
			'van-overlay': Overlay,
			'van-cell-group': CellGroup,
		},
		props: {
			type: {
				type: String,
				default: 'input'
			},
			title: {
				type: String,
				required: true
			},
			fieldName: {
				type: String,
				required: true
			},
			placeHolder: {
				type: String,
				default: ''
			},
			contentNullable: {
				type: Boolean,
				default: false
			},
			contentIsNumber: {
				type: Boolean,
				default: false
			},
			cancelText: {
				type: String,
				default: '取消',
			},
			submitText: {
				type: String,
				default: '提交'
			}
		},
		data() {
			return {
				content: '',
			}
		},
		methods: {
			cancel() {
				this.$emit('closeModal');
				this.$emit('cancelCallBack');
			},
			submit() {
				let content = this.content;
				
				if (null == content) {
					Notify({ type: 'danger', message: this.fieldName + "不能为空" });
					return;
				}
				
				content = content.trim();
				if (!this.contentNullable && '' === content) {
					Notify({ type: 'danger', message: this.fieldName + "不能为空" });
					return;
				}
				
				if (this.contentIsNumber) {
					let p = new RegExp("[0-9]+");
					if (!p.test(content)) {
						Notify({ type: 'danger', message: this.fieldName + "需要是数字" });
						return;
					}
				}
				
				this.$emit('closeModal');
				this.$emit('successCallBack', content)
			}
		},
		computed: {
			realPlaceHolder() {
				return this.placeHolder ? this.placeHolder : '请输入' + this.fieldName
			}
		}
	}
</script>

<style lang="scss">
	@import "~@../../static/css/common.scss";
	
	.box {
		background-color: #EEEEEE;
		border-radius: 9px;
		box-shadow: 7px 7px 5px #888888;
		width: 600rpx;
		height: 80%;
		position: absolute;
		margin: auto;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		
		.title {
			font-size: 50rpx;
			margin-top: 20rpx;
			margin-left: 20rpx;
			font-weight: bold;
		}

		.field {
			margin: 60rpx 0;
			
			text {
				font-size: 28rpx;
				color: #424242;
				margin-left: 11rpx;
			}
			
			input {
				@include common-input;
			}
			
			textarea {
				background-color: #fafafa;
				margin-top: 7rpx;
				width: auto;
				padding-top: 4rpx;
				padding-left: 10rpx;
				min-height: 500rpx;
				
				.placeholder {
					color: gray;
				}
			}
			.placeholder {
				color: gray;
			}
		}

		.button-group {
			display: flex;
			justify-content: space-around;
		}
	}
</style>