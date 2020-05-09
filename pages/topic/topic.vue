<template>
	<view>
		<view class="on-top">
			<van-notify class="on-top" id="van-notify" />
			<van-dialog id="van-dialog" />
		</view>

		<view class="on-top" v-if="showNewCommentModal">
			<SingleSubmitPopup type="textarea" :title="popupTitle" fieldName="评论内容" submitText="评论" @closeModal="closeModal"
			 @successCallBack="popupCallBack" />
		</view>


		<view class="topic-box">
			<view class="header">
				<van-image round :src="topic.creator.avatarUrl"></van-image>
				<view class="user-info">
					<view class="creator-name">{{topic.creator.nickname}}</view>
					<view class="create-time">{{topic.createGmt}}</view>
				</view>

				<view class="operation-box">
					<view v-if="topic.isTeacher || topic.creator.id === loginUserId" @tap="deleteTopic()" class="delete">
						删除
					</view>

					<!-- 使用懒加载，即like后不刷新页面，直接修改对应值 -->
					<view v-if="!topic.like" class="like-count" @tap="likeTopic">
						<van-icon name="good-job-o" /> <text>{{topic.likeCount}}</text>
					</view>
					<view v-else class="like-count" @tap="unlikeTopic">
						<van-icon name="good-job" color="red" /> <text>{{topic.likeCount}}</text>
					</view>
				</view>
			</view>
			<view class="topic-body">
				<view class="title">{{topic.title}}</view>
				<view class="content"><text>{{topic.content}}</text></view>
			</view>
			<view class="footer">

			</view>
		</view>

		<view class="comment-box">
			<view class="comment-item" v-for="(comment, idx) in comments" :key="idx">
				<view class="header">
					<van-image round :src="comment.creator.avatarUrl"></van-image>
					<view class="user-info">
						<view class="creator-name">{{comment.creator.nickname}}</view>
						<view class="create-time">{{comment.createGmt}}</view>
					</view>

					<view class="operation-box">
						<view v-if="topic.isTeacher || comment.creator.id === loginUserId" @tap="deleteComment(comment.id)" class="delete">
							删除
						</view>
						<view v-if="!comment.like" class="like-count" @tap="likeComment(idx)">
							<van-icon name="good-job-o" /> <text>{{comment.likeCount}}</text>
						</view>
						<view v-else class="like-count" @tap="unlikeComment(idx)">
							<van-icon name="good-job" color="red" /> <text>{{comment.likeCount}}</text>
						</view>
					</view>
				</view>
				<view class="comment-body">
					<text>{{comment.content}}</text>
				</view>
				<view class="sub-comment">
					<text v-if="comment.commentCount === 0" @tap="showModal(comment.id, comment.creator.nickname)">回复</text>
					<text v-else @tap="goToComment(comment.id)">查看{{comment.commentCount}}条回复 ></text>
				</view>
			</view>
			<uni-load-more :status="onloadingStatus" @clickLoadMore="loadMore" :contentText="onloadingText"></uni-load-more>
		</view>

		<view class="dock-row-box">
			<view class="dock-row">
				<view class="input-column" @tap="showModal(0)">我有一个大胆的想法...</view>
				<view class="favorite-column">
					<van-icon @tap="favorite" v-if="!favorited" name="star-o" />
					<van-icon @tap="unFavorite" v-else color="#e74c3c" name="star" />
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import VanNotify from "@/wxcomponents/vant/dist/notify/index.js";
	import Notify from "@/wxcomponents/vant/dist/notify/notify.js";
	import Icon from "@/wxcomponents/vant/dist/icon/index.js";
	import Image from "@/wxcomponents/vant/dist/image/index.js";
	import VanDialog from '@/wxcomponents/vant/dist/dialog/index.js'
	import Dialog from '@/wxcomponents/vant/dist/dialog/dialog.js'

	import UniLoadMore from "@/components/uni-load-more/uni-load-more.vue";
	import STabs from "@/components/s-tabs";
	import STab from "@/components/s-tab";
	import SingleSubmitPopup from '@/components/SingleSubmitPopup.vue'

	import LSReference from '@/static/js/local_storage_reference.js'
	import FavoriteUtils from '@/static/js/favorite.js'
	import TopicUtils from '@/static/js/topic.js'
	import CommonUtils from '@/static/js/utils.js'

	export default {

		components: {
			STabs,
			STab,
			SingleSubmitPopup,
			"van-notify": VanNotify,
			"uni-load-more": UniLoadMore,
			"van-icon": Icon,
			"van-image": Image,
			'van-dialog': VanDialog,
		},

		data() {
			return {
				refreshOnShow: false,

				// modal
				showNewCommentModal: false,
				popupTitle: '',
				newSubCommentIdx: 0, // 由于一级评论和子评论公用一个Popup，所以需要一个标志位，如果是评论子评论，那么把该位置为评论id，使用完恢复0

				favorited: false,
				topic: {},

				// comments 
				comments: [],
				offset: 0,
				count: 10,
				onloadingStatus: "more",
				onloadingText: {
					contentdown: "点击加载更多评论",
					contentrefresh: "加载中...",
					contentnomore: "没有更多评论了"
				},
			};
		},

		computed: {
			loginUserId() {
				return parseInt(uni.getStorageSync(LSReference.ID))
			}
		},

		methods: {
			// modal

			/**
			 * 显示新建评论的popup
			 * 
			 * @param {Number} commendId  如果是一级评论传入0，否则传入子评论id
			 * @param {String} userName  传入被评论者的用户名
			 */
			showModal(commendId, userName = '') {
				if (commendId === 0) {
					this.popupTitle = '发表评论'
				} else if (commendId > 0 && userName) {
					this.popupTitle = '评论给: ' + userName
				} else {
					Notify({
						type: "danger",
						message: "传入评论信息错误"
					});
					return;
				}

				this.newSubCommentIdx = commendId
				this.showNewCommentModal = true
			},
			closeModal() {
				this.showNewCommentModal = false
			},
			loadMore() {
				this.getComments()
			},
			goToComment(commentId) {
				uni.navigateTo({
					url: '../sub_comments/sub_comments?commentId=' + commentId
				})
			},

			// logic func
			getTopic(topicId) {
				let promise = TopicUtils.getTopic(topicId)
				promise
					.then(data => {
						let dateObj = CommonUtils.dateConverter(data.createGmt);
						if (null !== dateObj) {
							data.createGmt = dateObj.defaultDatetime;
						}

						this.topic = data

						this.reLoadComments()
					})
			},
			likeTopic() {
				if (this.topic.like) {
					return;
				}

				let promise = TopicUtils.likeTopic(this.topic.id)
				promise
					.then(() => {
						this.topic.like = true
						this.topic.likeCount += 1
					})
			},
			unlikeTopic() {
				if (!this.topic.like) {
					return;
				}

				let promise = TopicUtils.unlikeTopic(this.topic.id)
				promise
					.then(() => {
						this.topic.like = false
						this.topic.likeCount -= 1
					})
			},
			likeComment(commentIdx) {
				if (commentIdx >= this.comments.length || this.comments[commentIdx].like) {
					return;
				}

				let promise = TopicUtils.likeComment(this.comments[commentIdx].id)
				promise
					.then(() => {
						this.comments[commentIdx].like = true
						this.comments[commentIdx].likeCount += 1
					})
			},
			unlikeComment(commentIdx) {
				if (commentIdx >= this.comments.length || !this.comments[commentIdx].like) {
					return;
				}

				let promise = TopicUtils.unlikeComment(this.comments[commentIdx].id)
				promise
					.then(() => {
						this.comments[commentIdx].like = false
						this.comments[commentIdx].likeCount -= 1
					})
			},

			createComment(content, parentId, type) {
				if (!(type === 1 || type === 0)) {
					Notify({
						type: "danger",
						message: "评论类型错误"
					});
					return;
				}

				let promise = TopicUtils.createComment(content, parentId, type)
				promise
					.then(data => {
						Notify({
							type: "success",
							message: "发表评论成功"
						});
					});
				return promise;
			},

			deleteTopic() {
				Dialog.confirm({
					title: '删除帖子',
					message: '确认删除吗？'
				}).then(() => {
					let p = TopicUtils.deleteTopic(this.topic.id)
					p.then(data => {
						Notify({
							type: "success",
							message: "删除帖子成功"
						});
						
						setTimeout(() => {
							// 通知前一页需要刷新
							let pages = getCurrentPages()
							let prevPage = pages[pages.length - 2];
							prevPage.$vm.refreshOnShow = true;
							uni.navigateBack()
						}, 1500);
					});
				}).catch(() => {});
			},
			
			deleteComment(commentId) {
				Dialog.confirm({
					title: '删除评论',
					message: '确认删除吗？'
				}).then(() => {
					let p = TopicUtils.deleteComment(commentId)
					p.then(data => {
						Notify({
							type: "success",
							message: "删除评论成功"
						});
						
						this.getPageInfo(this.topic.id)
					});
				}).catch(() => {});
			},

			// popup的回调，用于创建评论（一级或子评论）
			popupCallBack(content) {
				let promise = null
				
				if (this.newSubCommentIdx) {
					// 子评论
					promise = this.createComment(content, this.newSubCommentIdx, 1)
				} else {
					// 一级评论
					promise = this.createComment(content, this.topic.id, 0)
				}

				promise
					.then(() => {
						this.reLoadComments()
					})
			},
			
			reLoadComments() {
				this.offset = 0
				this.comments.splice(0)
				this.getComments()
			},

			getComments() {
				if (this.offset > this.comments.length) {
					return;
				}

				this.onloadingStatus = 'loading';

				let promise = TopicUtils.getComments(this.topic.id, 0, this.offset, this.count)
				promise
					.then(data => {
						data.forEach(e => {
							CommonUtils.dateConverterBatchFormatted(e, 'createGmt');
						});

						this.comments.push(...data);

						// 更新offset 和 onLoading 类型（是否有更多加载）
						this.offset += this.count;
						this.onloadingStatus =
							this.offset === this.comments.length ? "more" : "noMore";
					})
			},

			favorite() {
				let p = FavoriteUtils.favorite(FavoriteUtils.TOPIC_TYPE, this.topic.id)
				p.then(data => {
					this.favorited = true
				})
			},

			unFavorite() {
				let p = FavoriteUtils.unFavorite(FavoriteUtils.TOPIC_TYPE, this.topic.id)
				p.then(data => {
					this.favorited = false
				})
			},
			
			getPageInfo(topicId, closePullDownRefresh = false) {
				if (topicId) {
					this.getTopic(topicId)
					let p = FavoriteUtils.exist(FavoriteUtils.TOPIC_TYPE, topicId)
					p.then(data => {
						this.favorited = data
					})
				} else {
					Notify({
						type: "danger",
						message: "未传入帖子号，请刷新重试"
					});
				}
				
				if (closePullDownRefresh) {
					uni.stopPullDownRefresh()
				}
			}
		},

		onLoad(option) {
			let topicId = option.topicId
			this.getPageInfo(topicId)
		},
		
		onPullDownRefresh() {
			this.getPageInfo(this.topic.id, true)
		}
	}
</script>

<style lang="scss">
	.on-top {
		position: fixed;
		z-index: 9988;
	}

	.header {
		display: flex;

		image {
			height: 72rpx;
			width: 72rpx;
		}

		.user-info {
			display: flex;
			flex-direction: column;
			margin-left: 10rpx;

			.creator-name {
				font-size: 30rpx;
			}

			.create-time {
				font-size: 20rpx;
				color: gray;
			}
		}

		.operation-box {
			display: flex;
			margin-left: auto;
			align-items: center;

			.delete {
				margin-right: 40rpx;
				font-size: 26rpx;
				color: #757575;
				text-decoration: underline;
			}

			.like-count {
				display: flex;
				flex-direction: column;
				align-items: center;
				margin-right: 20rpx;

				text {
					font-size: 22rpx;
				}
			}
		}
	}

	.topic-box {
		background-color: white;
		padding: 10rpx;
		border-radius: 0 0 24rpx 24rpx;

		.topic-body {
			margin-top: 14rpx;
			margin-bottom: 20rpx;

			.title {
				font-weight: 500;
			}

			.content {
				font-size: 26rpx;
				margin-top: 14rpx;
				max-width: 98%;
				word-break: break-all;
			}
		}
	}

	.comment-box {
		margin-top: 35rpx;

		.comment-item {
			border-bottom: 0.5px solid #BDBDBD;
			padding: 10rpx 10rpx 14rpx 10rpx;
			margin-bottom: 10rpx;
			background-color: white;

			.comment-body {
				padding: 12rpx 0 0 4rpx;
				font-size: 30rpx;
				max-width: 98%;
				word-break: break-all;
			}

			.sub-comment {
				font-size: 26rpx;
				color: gray;
				margin-left: 6rpx;
			}
		}
	}

	.dock-row-box {
		height: 80rpx;

		.dock-row {
			position: fixed;
			bottom: 0;
			bottom: constant(safe-area-inset-bottom);
			bottom: env(safe-area-inset-bottom);
			// border: 1rpx solid black;
			width: 100%;
			display: flex;
			justify-content: space-between;
			padding: 10rpx 4rpx;
			background-color: white;
			align-items: center;
			box-shadow: -1rpx -1rpx .8rpx #9E9E9E;

			.input-column {
				font-size: 30rpx;
				width: 80%;
				line-height: 1.5rem;
				background-color: #E0E0E0;
				border-radius: 25rpx;
				padding: 14rpx 25rpx;
				color: #616161;
			}

			.favorite-column {
				font-size: 40rpx;
				margin-right: 28rpx;
				padding-top: 5rpx;
			}
		}
	}
</style>
