<template>
	<view class="container">
		<van-notify class="on-top" id="van-notify" />
		<UpdateUserInfo v-if="showUpdateUserInfo" @closeUpdateUserInfoModal="closeUpdateUserInfoModal" :loginUser="loginUser"></UpdateUserInfo>

		<view class="user-box">
			<view class="user-login-box" v-if="!hasLogin">
				<text>用户未登录</text>
				<view class="inner-button">
					<van-button round color="linear-gradient(to right, #4bb0ff, #6149f6)" open-type="getUserInfo" @tap="login()">登录</van-button>
				</view>

			</view>
			<view v-else class="user-info">
				<view class="left">
					<text class="name">{{loginUser.nickname}}</text>
					<text v-if="loginUser.schoolName !== null" class="school-name">{{loginUser.schoolName}}</text>

					<van-button plain type="primary" custom-style="height: 62rpx; margin-top: 10rpx" @tap="updateUserInfo()">修改用户资料</van-button>
				</view>

				<view class="right">
					<van-image round width="150rpx" height="150rpx" :src="loginUser.avatarUrl" />
				</view>
			</view>
		</view>
		<view class="select-box">
			<navigator url="../conurse_ware/course_ware">
				<view class="list select-item">
					<view class="list-info">
						<image src="../../static/img/icon/book.png" /><text>课件</text></view>
					<view>></view>
				</view>
			</navigator>

			<navigator url="../contest/contest">
				<view class="list select-item">
					<view class="list-info">
						<image src="../../static/img/icon/paper.png" /><text>试卷</text></view>
					<view>></view>
				</view>
			</navigator>

			<navigator url="../favorite/favorite">
				<view class="list select-item">
					<view class="list-info">
						<image src="../../static/img/icon/fav.png" /> <text>收藏</text></view>
					<view>></view>
				</view>
			</navigator>

			<navigator url="../helpme/helpme">
				<view class="list select-item" style="margin-top: 120rpx; border-top: 1rpx #CFD8DC solid;">
					<view class="list-info">
						<image src="../../static/img/icon/help.png" /> <text>帮助</text></view>
					<view>></view>
				</view>
			</navigator>
		</view>

	</view>
</template>

<script>
	import LoginUtils from '../../static/js/login.js';
	import UpdateUserInfo from '../../components/UpdateUserInfo.vue'

	import Button from '../../wxcomponents/vant/dist/button/index.js'
	import VanNotify from '../../wxcomponents/vant/dist/notify/index.js'
	import Notify from '../../wxcomponents/vant/dist/notify/notify.js'
	import Image from '../../wxcomponents/vant/dist/image/index.js'

	export default {
		components: {
			UpdateUserInfo,
			'van-button': Button,
			'van-notify': VanNotify,
			'van-image': Image
		},
		data() {
			return {
				tryLogin: 0, // 登录尝试次数，用于刷新vuex内容的传入
				showUpdateUserInfo: false,
			}
		},

		computed: {
			hasLogin(tryLogin) {
				return this.$store.state.hasLogin
			},
			loginUser(tryLogin) {
				return this.$store.state.loginUser
			},
			needLoginAlert() {
				return this.$store.state.needLoginAlert
			}
		},

		methods: {
			login() {
				LoginUtils.login(LoginUtils.getUserInfo)
				this.tryLogin += 1
			},

			updateUserInfo() {
				this.showUpdateUserInfo = true
			},

			closeUpdateUserInfoModal() {
				this.showUpdateUserInfo = false
			}
		},
		onShow() {
			if (this.needLoginAlert) {
				Notify({
					type: 'danger',
					message: "请先登录"
				});
				this.$store.commit('NEED_LOGIN_ALERT', false)
			}

			if (this.hasLogin && null === this.$store.state.loginUser) {
				LoginUtils.getUserInfo()
				this.tryLogin += 1
			}
		}
	}
</script>

<style lang="scss">
	.on-top {
		position: fixed;
		z-index: 9988;
	}
	
	.user-box {

		margin: 50rpx 30rpx 100rpx 30rpx;

		.user-login-box {
			display: flex;
			flex-direction: column;

			.inner-button {
				margin: 10rpx 10rpx;
				
				button {
	
					padding: 0 1.8rem;
					height: 2rem;
				}
			}
		}

		text {
			margin-bottom: 10rpx;
			font-size: 40rpx;
			font-weight: bold;
			display: block;
		}

		.user-info {
			display: flex;
			justify-content: space-between;
			padding-right: 40rpx;

			.name {
				font-size: 60rpx;
			}

			.school-name {
				font-size: 30rpx;
			}
		}
	}

	.select-box {
		.select-item {
			border-bottom: 1rpx #CFD8DC solid;
			line-height: 100rpx;
			margin: 0 20rpx;
			padding: 0 15rpx;
			display: flex;
			justify-content: space-between;

			image {
				width: 60rpx;
				height: 60rpx;

			}
		}
		
		.list {
			display: flex;
			align-items: center;
			
			.list-info {
				display: flex;
				align-items: center;
				
				text {
					margin-left: 10rpx;
				}
			}
		}
	}
</style>
