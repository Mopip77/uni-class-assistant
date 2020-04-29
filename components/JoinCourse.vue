<template>
	<view>
		<van-overlay show="true">
			<view class="join-course-box">
				<view class="class-number-field">
					<text>课程号</text>
					<van-cell-group>
						<input type="text" v-model="courseId" placeholder="请输入课程号" />
					</van-cell-group>
				</view>

				<view class="class-password-field">
					<text>暗号</text>
					<van-cell-group>
						<input type="text" v-model="password" placeholder="请输入暗号" />
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
		},
		data() {
			return {
				courseId: '',
				password: '',
			}
		},
		methods: {
			cancel() {
				this.$emit('closeJoinCourseModal');
			},
			submit() {
				let courseId = this.courseId;
				
				if (null == courseId) {
					Notify({ type: 'danger', message: "课程号不能为空" });
					return;
				}
				
				courseId = courseId.trim();
				
				let p = new RegExp("[0-9]+");
				if (!p.test(courseId)) {
					Notify({ type: 'danger', message: "课程号不能为空且需要是数字" });
					return;
				}
				
				let password = this.password
				if (null == courseId) {
					Notify({ type: 'danger', message: "暗号不能为空" });
					return;
				}
 				
				let promise = CourseUtils.joinCourse(courseId, password)
				this.$emit('closeJoinCourseModal');
				
				promise
				.then(data => {
					Notify({ type: 'success', message: "加入成功" });
					this.$emit('successCallBack');
				})
				.catch(err => {
					Notify({ type: 'danger', message: "加入失败" });
				})
			}
		}
	}
</script>

<style lang="scss">
	@import "~@../../static/css/common.scss";
	
	.join-course-box {
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
		
		text {
			font-size: 28rpx;
			color: gray;
			margin-left: 10rpx;
		}
		
		input {
			@include common-input;
		}

		.class-number-field {
			margin: 60rpx 0;
		}

		.class-password-field {
			margin-bottom: 54rpx;
		}
		
		.button-group {
			display: flex;
			justify-content: space-around;
		}
	}
</style>
