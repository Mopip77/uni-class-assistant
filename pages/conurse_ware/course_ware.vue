<template>
	<view>
		<van-notify class="on-top" id="van-notify" />

		<view v-if="showModal" class="on-cover">
			<ReadCourseWarePage :courseWareId="courseWare.id" :pages="courseWare.pages" :readPageIdx="userCourseWare.readPageIdx"
			 :currentPageIdx="viewingPageIdx" :isTeacher="courseWare.isTeacher" @closeModal="closeModal"></ReadCourseWarePage>
		</view>

		<l-file ref="lFile"></l-file>

		<view class="info-header">
			<view class="line-1">
				<view class="title">
					<text>{{courseWare.displayName}}</text>
					<view class="favorite-icon">
						<van-icon @tap="favorite" v-if="!favorited" name="star-o" />
						<van-icon @tap="unFavorite" v-else color="#e74c3c" name="star" />
					</view>
				</view>
				<van-button custom-class="button" square type="primary" @tap="downloadCourseWare">下载</van-button>
			</view>

			<view class="line-2">
				<view class="user-box">
					<image :src="courseWare.creator.avatarUrl"></image>
					<text>{{courseWare.creator.nickname}}</text>
				</view>
				<view class="time-box">
					{{courseWare.createGmt}}
				</view>
			</view>
		</view>

		<view v-if="!courseWare.isTeacher" class="read-time">已阅读时长: {{readTime}} 分</view>

		<view v-if="courseWare.pages.length === 0" class="course-ware-warning">
			课件正在后台解析中，请稍后再来...
		</view>
		<view v-else class="page-box">
			<view class="header">
				<view class="sub-title">课件页码</view>
			</view>

			<view class="page-list">
				<view @tap="readPage(idx)" :class="hasRead(idx) ? 'read' : ''" class="page-item" v-for="(page, idx) in courseWare.pages"
				 :key="idx">
					<view>{{idx + 1}}</view>
				</view>
			</view>
		</view>

		<view v-if="!courseWare.isTeacher" class="comment-box">
			<view class="header">
				<view class="sub-title">
					课件备注
				</view>
				<van-button custom-class="button" square type="primary" @tap="updateComment">更改</van-button>
			</view>

			<textarea auto-height v-model="userCourseWare.comment" />
			</view>
	
	</view>
</template>

<script>
	import VanNotify from "@/wxcomponents/vant/dist/notify/index.js";
	import Notify from "@/wxcomponents/vant/dist/notify/notify.js";
	import Button from "@/wxcomponents/vant/dist/button/index.js";
	import Icon from "@/wxcomponents/vant/dist/icon/index.js";
	
	import lFile from '@/components/l-file/l-file.vue'
	import ReadCourseWarePage from '@/components/ReadCourseWarePage.vue'

	import CourseWareUtils from '@/static/js/course_ware.js'
	import FavoriteUtils from '@/static/js/favorite.js'
	import CommonUtils from '@/static/js/utils.js'

	export default {
		components: {
			lFile,
			ReadCourseWarePage,
			"van-notify": VanNotify,
			"van-button": Button,
			"van-icon": Icon
		},
		
		computed: {
			readTime() {
				return this.userCourseWare.readTime ? Math.floor(this.userCourseWare.readTime / 60) : 0
			} 
		},

		data() {
			return {
				showModal: false,
				viewingPageIdx: 0,
				
				favorited: false,
				courseWare: {},
				userCourseWare: {}
			}
		},
		
		methods: {
			// component
			closeModal() {
				this.showModal = false
				
				// 更新userCourseWare信息
				if (!this.userCourseWare.isTeacher) {
					let p = CourseWareUtils.getUserCourseWare(this.courseWare.id)
					p.then(uC => {
						this.userCourseWare = uC
					})
				}
				
			},
			
			downloadCourseWare() {
				this.$refs.lFile.download(this.courseWare.url,'local')
				.then(path=>{
				    uni.saveFile({
				    	tempFilePath: path,
						success: (res) => {
						}
				    })
				});
			},
			
			hasRead(idx) {
				return this.userCourseWare.readPageIdx instanceof Array && this.userCourseWare.readPageIdx.indexOf(idx) >= 0
			},
			
			readPage(idx) {
				this.viewingPageIdx = idx
				
				this.showModal = true
			},
			
			updateComment() {
				let comment = this.userCourseWare.comment
				if (comment) {
					let p = CourseWareUtils.updateComment(this.courseWare.id, comment)
					p.then(data => {
						Notify({
							type: 'success',
							message: '更新备注成功'
						})
					})
				}
			},
			
			favorite() {
				let p = FavoriteUtils.favorite(FavoriteUtils.COURSE_WARE_TYPE, this.courseWare.id)
				p.then(data => {
					this.favorited = true
				})
			},
			
			unFavorite() {
				let p = FavoriteUtils.unFavorite(FavoriteUtils.COURSE_WARE_TYPE, this.courseWare.id)
				p.then(data => {
					this.favorited = false
				})
			}
		},

		onLoad(option) {
			let courseWareId = option.courseWareId;

			if (!courseWareId) {
				Notify({
					type: "danger",
					message: "未传入课件号，请刷新重试"
				});
			} else {
				let promise = CourseWareUtils.getCourseWare(courseWareId)
				promise.then(data => {
					CommonUtils.dateConverterBatch(data, false, 'createGmt')
					this.courseWare = data;
					
					if (!data.isTeacher) {
						let p = CourseWareUtils.getUserCourseWare(courseWareId)
						p.then(uC => {
							this.userCourseWare = uC
						})
					} else {
						this.userCourseWare = {
							id: '',
							isTeacher: true,
							readPageIdx: []
						}
					}
					
				});
				
				let p = FavoriteUtils.exist(FavoriteUtils.COURSE_WARE_TYPE, courseWareId)
				p.then(data => {
					this.favorited = data
				})
			}
		}
	}
</script>

<style lang="scss">
	@import '~@/static/css/common.scss';
	
	.on-cover {
		position: absolute;
		z-index: 9988;
		width: 100%;
		height: 100%;
		background-color: $global-background-color;
	}
	
	.info-header {
		margin: 20rpx 10rpx;
		display: flex;
		flex-direction: column;

		.line-1 {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin: 10rpx 10rpx 40rpx 10rpx;

			.title {
				font-size: 40rpx;
				font-weight: 600;
				display: flex;
				align-items: center;
			}
			
			.button {
				width: 120rpx;
				height: 54rpx;
			}
		}

		.line-2 {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin: 10rpx;
			
			.user-box {
				display: flex;
				align-items: center;

				image {
					width: 60rpx;
					height: 60rpx;
					border-radius: 50%;
				}
				
				text {
					margin-left: 10rpx;
				}
			}
			
			.time-box {
				color: #616161;
				font-size: 26rpx;
			}
		}
	}
	
	.read-time {
		margin: 30rpx 10rpx;
	}
	
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 28rpx;
		background-color: #4FC3F7;
	
		.sub-title {
			font-size: 42rpx;
			font-weight: 400;
			width: 100%;
			color: #fff;
			padding: 4rpx 0;
		}
	
	}

	.page-box {
		margin-bottom: 60rpx;

		.page-list {
			display: flex;
			flex-wrap: wrap;

			.page-item {
				border: 1rpx solid black;
				width: 80rpx;
				height: 80rpx;
				margin-left: 53rpx;
				margin-top: 27rpx;
				display: flex;
				justify-content: space-around;
				background-color: #fff;

				view {
					display: flex;
					align-items: center;
				}
			}
			
			.read {
				background-color: #FFB74D;
			}
		}
	}
	
	.course-ware-warning {
		margin: 40rpx 10rpx;
		color: red;
		font-weight: 500;
	}
	
	.comment-box {
		
		.header {
			margin-bottom: 0;
		}
		
		.button {
			width: 120rpx;
			height: 66rpx;
		}
		
		textarea {
			@include common-textarea;
			min-height: 300rpx;
		}
	}
</style>
