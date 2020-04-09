<template>
	<view>
		<van-overlay show="true">
			<view class="update-userinfo-box">
				<view class="avatar">
					<view class="box">
						<van-image @tap="uploadAvatar" round width="100" height="100" lazy-load :src="avatarUrl">
							<view class="edit-avatar">
								<van-icon name="edit" />
							</view>
						</van-image>
					</view>
				</view>


				<view class="name-field">
					<text>真实姓名</text>
					<van-cell-group>
						<input type="text" v-model="nickname" placeholder="请输入真实姓名" />
					</van-cell-group>
				</view>

				<view class="school-field">
					<text>学生信息</text>
					<van-cell-group>
						<input type="text" v-model="schoolName" placeholder="请输入学校名" />
						<input type="text" v-model="stuNumber" placeholder="请输入教职工号" />
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
	import LoginUtils from '@/static/js/login.js'
	import ApiReference from '@/static/js/api_reference.js'
	import HttpCommons from '@/static/js/http_commons.js'

	import Notify from '@/wxcomponents/vant/dist/notify/notify.js'
	import Buttonuu from '@/wxcomponents/vant/dist/button/index.js'
	import Image from '@/wxcomponents/vant/dist/image/index.js'
	import Overlay from '@/wxcomponents/vant/dist/overlay/index.js'
	import CellGroup from '@/wxcomponents/vant/dist/cell-group/index.js'
	import Icon from '@/wxcomponents/vant/dist/icon/index.js'

	export default {

		props: {
			loginUser: {
				type: Object,
				required: true
			}
		},
		components: {
			'van-button': Buttonuu,
			'van-image': Image,
			'van-overlay': Overlay,
			'van-cell-group': CellGroup
		},
		data() {
			return {
				nickname: this.loginUser.nickname || '',
				schoolName: this.loginUser.schoolName || '',
				stuNumber: this.loginUser.stuNumber || '',
				avatarUrl: this.loginUser.avatarUrl || '',
			}
		},
		methods: {
			cancel() {
				this.$emit('closeUpdateUserInfoModal');
			},
			uploadAvatar() {
				let that = this
				
				uni.chooseImage({
					count: 1,
					success: function(res) {
						const tempFilePaths = res.tempFilePaths;
						uni.uploadFile({
							url: ApiReference.UPLOAD_AVATAR,
							header: HttpCommons.getAuthenticationHeader(),
							filePath: tempFilePaths[0],
							name: 'image',
							success: (resp) => {
								console.log("上传头像完成", resp);
								if (HttpCommons.successCheck(resp)) {
									if (typeof resp.data === 'string') {
										console.log("转换奥");
										resp.data = JSON.parse(resp.data)
									}
									that.avatarUrl = resp.data.data
								}
							},
							fail: (err) => {
								HttpCommons.commonFailHanlder(err)
							}
						})
					}
				})
			},
			submit() {
				let nickname = this.nickname;
				let schoolName = this.schoolName;
				let stuNumber = this.stuNumber;
				let avatarUrl = this.avatarUrl;
				// console.log(nickname, schoolName, stuNumber);

				if (null === nickname || null === schoolName || null === stuNumber || null === avatarUrl) {
					Notify({
						type: 'danger',
						message: "内容不能为空"
					});
					return;
				}

				nickname = nickname.trim();
				schoolName = schoolName.trim();
				stuNumber = stuNumber.trim();
				avatarUrl = avatarUrl.trim();

				if ("" === nickname) {
					Notify({
						type: 'danger',
						message: "用户名不能为空"
					});
					return;
				}
				if ("" === schoolName) {
					Notify({
						type: 'danger',
						message: "学校名不能为空"
					});
					return;
				}
				if ("" === avatarUrl) {
					Notify({
						type: 'danger',
						message: "头像不能为空"
					});
					return;
				}
				let p = new RegExp("[0-9]+");
				if (!p.test(stuNumber)) {
					Notify({
						type: 'danger',
						message: "学生号不能为空且需要是数字"
					});
					return;
				}

				LoginUtils.updateUserInfo({
					nickname,
					schoolName,
					stuNumber,
					avatarUrl
				});
				this.$emit('closeUpdateUserInfoModal');
			}
		}
	}
</script>

<style lang="scss">
	@import "~@../../static/css/common.scss";

	.update-userinfo-box {
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

		.avatar {
			.box {
				margin-top: 35rpx;
				// margin-bottom: 40rpx;
				display: flex;
				justify-content: center;
				
				.edit-avatar {
					color: red;
				}
			}
		}

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

		.school-field {
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
