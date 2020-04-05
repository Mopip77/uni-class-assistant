<template>
	<view>
		<van-overlay show="true">
			<view class="create-course-box">
				<view class="name-field">
					<text>课程名</text>
					<van-cell-group>
						<input type="text" v-model="courseName" placeholder="请输入课程名" />
					</van-cell-group>
				</view>

				<view class="class-info-field">
					<text>班级信息</text><text style="font-size: 24rpx;margin-left: 10rpx;">(例如: 计算机4-6班)</text>
					<van-cell-group>
						<input type="text" v-model="classInfo" placeholder="请输入班级信息"/>
					</van-cell-group>
				</view>

				<view class="button-group">
					<van-button type="info" @tap="cancel()" custom-style="height: 70rpx;width: 140rpx;">取消</van-button>
					<van-button type="primary" @tap="submit()" custom-style="height: 70rpx;width: 140rpx;">提交</van-button>
				</view>
			</view>
		</van-overlay>
	</view>
</template>
<script>
	import LoginUtils from '../static/js/login.js'
	import CourseUtils from '../static/js/course.js'
	
	import Notify from '../wxcomponents/vant/dist/notify/notify.js'
	// import VanNotify from '../wxcomponents/vant/dist/notify/index.js'
	import Buttonuu from '../wxcomponents/vant/dist/button'
	import Image from '../wxcomponents/vant/dist/image'
	import Overlay from '../wxcomponents/vant/dist/overlay/index.js'
	import CellGroup from '../wxcomponents/vant/dist/cell-group/index.js'

	export default {
		components: {
			'van-button': Buttonuu,
			'van-image': Image,
			'van-overlay': Overlay,
			'van-cell-group': CellGroup,
			// 'van-notify': VanNotify
		},
		data() {
			return {
				courseName: '',
				classInfo: '',
			}
		},
		methods: {
			cancel() {
				this.$emit('closeCreateCourseModal');
			},
			submit() {
				let courseName = this.courseName;
				let classInfo = this.classInfo;
				
				if (null == courseName || null == classInfo) {
					Notify({ type: 'danger', message: "内容不能为空" });
					return;
				}
				
				courseName = courseName.trim();
				classInfo = classInfo.trim();
				
				if ("" === courseName) {
					Notify({ type: 'danger', message: "课程名不能为空" });
					return;
				}
				if ("" === classInfo) {
					Notify({ type: 'danger', message: "班级信息不能为空" });
					return;
				}
 				
				let promise = CourseUtils.createCourse(courseName, classInfo)
				this.$emit('closeCreateCourseModal');
				
				promise
				.then(data => {
					Notify({ type: 'success', message: "创建成功" });
					this.$emit('successCallBack');
				})
				.catch(err => {
					Notify({ type: 'danger', message: "登录失败" });
				})
			}
		}
	}
</script>

<style lang="scss">
	@import "~@../../static/css/common.scss";
	
	.create-course-box {
		background-color: #EEEEEE;
		border-radius: 9px;
		box-shadow: 7px 7px 5px #888888;
		width: 600rpx;
		height: 80%;
		position: fixed;
		margin: auto;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;

		.name-field {
			margin: 60rpx 0;
			
			text {
				font-size: 28rpx;
				color: gray;
			}
			
			input {
				@include common-input;
			}
		}

		.class-info-field {
			margin-bottom: 54rpx;
			
			text {
				font-size: 28rpx;
				color: gray;
			}
			
			input {
				@include common-input;
			}
		}

		.button-group {
			display: flex;
			justify-content: space-around;
		}
	}
</style>
