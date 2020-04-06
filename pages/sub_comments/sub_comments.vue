<template>
	<view>
		<van-notify class="on-top" id="van-notify" />
		<view class="on-top" v-if="showNewCommentModal">
			<SingleSubmitPopup type="textarea" :title="popupTitle" fieldName="评论内容" submitText="评论" @closeModal="closeModal"
			 @successCallBack="popupCallBack" />
		</view>


		<view class="top-comment-box">
			<view class="header">
				<van-image round :src="comment.creator.avatarUrl"></van-image>
				<view class="user-info">
					<view class="creator-name">{{comment.creator.nickname}}</view>
					<view class="create-time">{{comment.createGmt}}</view>
				</view>
				<view v-if="!comment.like" class="like-count" @tap="likeComment(comment.id)">
					<van-icon name="good-job-o" /> <text>{{comment.likeCount}}</text>
				</view>
				<view v-else class="like-count" @tap="unlikeComment(comment.id)">
					<van-icon name="good-job" color="red" /> <text>{{comment.likeCount + 1}}</text>
				</view>
			</view>
			<view class="top-comment-body">
				<view class="title">{{comment.title}}</view>
				<view class="content">{{comment.content}}</view>
			</view>
		</view>

		<view class="sub-comment-box">
			<view class="sub-comment-item" v-for="(subComment, idx) in subComments" :key="idx">
				<view class="header">
					<van-image round :src="subComment.creator.avatarUrl"></van-image>
					<view class="user-info">
						<view class="creator-name">{{subComment.creator.nickname}}</view>
						<view class="create-time">{{subComment.createGmt}}</view>
					</view>
					<view v-if="subComment.like" class="like-count" @tap="likeSubComment(idx)">
						<van-icon name="good-job-o" /> <text>{{subComment.likeCount}}</text>
					</view>
					<view v-else class="like-count" @tap="unlikeSubComment(idx)">
						<van-icon name="good-job" color="red" /> <text>{{subComment.likeCount + 1}}</text>
					</view>
				</view>
				<view class="sub-comment-body" @tap="showModal(subComment.id, subComment.creator.nickname)">
					回复 <text class="parent-name">@{{subComment.parentCreator.nickname}}</text>: {{subComment.content}}
				</view>
			</view>
			<uni-load-more :status="onloadingStatus" @clickLoadMore="loadMore" :contentText="onloadingText"></uni-load-more>
		</view>

		<view class="dock-row-box">
			<view class="dock-row">
				<view class="input-column" @tap="showModal(comment.id, comment.creator.nickname)">我有一个大胆的想法...</view>
			</view>
		</view>

	</view>
</template>

<script>
	import VanNotify from "@/wxcomponents/vant/dist/notify/index.js";
	import Notify from "@/wxcomponents/vant/dist/notify/notify.js";
	import Icon from "@/wxcomponents/vant/dist/icon/index.js";
	import Image from "@/wxcomponents/vant/dist/image/index.js";

	import UniLoadMore from "@/components/uni-load-more/uni-load-more.vue";
	import SingleSubmitPopup from '@/components/SingleSubmitPopup.vue'

	import TopicUtils from '../../static/js/topic.js'
	import CommonUtils from '@/static/js/utils.js'

	export default {

		components: {
			SingleSubmitPopup,
			"van-notify": VanNotify,
			"uni-load-more": UniLoadMore,
			"van-icon": Icon,
			"van-image": Image
		},

		data() {
			return {
				// modal
				showNewCommentModal: false,
				popupTitle: '',
				newSubCommentIdx: 0,

				comment: {},

				// subComments 
				subComments: [],
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

		methods: {
			// modal

			/**
			 * 显示新建评论的popup
			 * 
			 * @param {Number} commendId 被评论id
			 * @param {String} userName  传入被评论者的用户名
			 */
			showModal(commendId, userName = '') {
				this.popupTitle = '评论给: ' + userName
				this.newSubCommentIdx = commendId
				this.showNewCommentModal = true
			},
			closeModal() {
				this.showNewCommentModal = false
			},
			loadMore() {
				this.getSubComments()
			},

			// logic func
			getComment(commentId) {
				let promise = TopicUtils.getComment(commentId)
				promise
					.then(data => {
						let dateObj = CommonUtils.dateConverter(data.createGmt);
						if (null !== dateObj) {
							data.createGmt = dateObj.defaultDatetime;
						}

						this.comment = data

						this.offset = 0
						this.getSubComments()
					})
			},
			
			likeComment(commentId) {
				if (this.comment.like) {
					return;
				}
				
				let promise = TopicUtils.likeComment(this.comment.id)
				promise
				.then(() => {
					this.comment.like = true
				})
			},
			
			unlikeComment(commentId) {
				if (this.comment.like) {
					return;
				}
				
				let promise = TopicUtils.unlikeComment(this.comment.id)
				promise
				.then(() => {
					this.comment.like = false
				})
			},
			
			likeSubComment(commentIdx) {
				if (this.subComments[commentIdx].like) {
					return;
				}
				
				let promise = TopicUtils.likeComment(this.subComments[commentIdx].id)
				promise
				.then(() => {
					this.subComments[commentIdx].like = true
				})
			},
			
			unlikeSubComment(commentIdx) {
				if (this.subComments[commentIdx].like) {
					return;
				}
				
				let promise = TopicUtils.unlikeComment(this.subComments[commentIdx].id)
				promise
				.then(() => {
					this.subComments[commentIdx].like = false
				})
			},

			createSubComment(content, parentId) {
				let promise = TopicUtils.createComment(content, parentId, 1)
				promise
					.then(data => {
						Notify({
							type: "success",
							message: "发表评论成功"
						});
					});
				return promise;
			},

			// popup的回调，用于创建子评论
			popupCallBack(content) {
				let promise = this.createSubComment(content, this.newSubCommentIdx)
				promise
					.then(() => {
						this.offset = 0
						this.getSubComments()
					})
			},

			getSubComments() {
				if (this.offset > this.subComments.length) {
					return;
				}

				this.onloadingStatus = 'loading';

				let promise = TopicUtils.getComments(this.comment.id, 1, this.offset, this.count)
				promise
					.then(data => {
						console.log("获得子评论", data);
						data.forEach(e => {
							let dateObj = CommonUtils.dateConverter(e.createGmt);
							if (null !== dateObj) {
								e.createGmt = dateObj.defaultDatetime;
							}
						});

						// 如果offset为0就直接更新，否则append
						if (this.offset) {
							this.subComments = this.subComments.concat(data);
						} else {
							this.subComments = data;
						}

						// 更新offset 和 onLoading 类型（是否有更多加载）
						this.offset += this.count;
						this.onloadingStatus =
							this.offset === this.subComments.length ? "more" : "noMore";
						console.log("更新状态", this.offset, this.onloadingStatus);
					})
			}
		},

		onLoad(option) {
			let commentId = option.commentId
			if (commentId) {
				this.getComment(commentId)
			} else {
				Notify({
					type: "danger",
					message: "未传入评论id，请重试"
				});
			}
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

		.like-count {
			display: flex;
			flex-direction: column;
			margin-left: auto;
			align-items: center;
			margin-right: 20rpx;

			text {
				font-size: 22rpx;
			}
		}
	}

	.top-comment-box {
		background-color: white;
		padding: 10rpx;
		border-radius: 0 0 24rpx 24rpx;

		.top-comment-body {
			margin-top: 14rpx;
			margin-bottom: 20rpx;

			.content {
				font-size: 30rpx;
				margin-top: 14rpx;
			}
		}
	}

	.sub-comment-box {
		margin-top: 35rpx;

		.sub-comment-item {
			border-bottom: 0.5px solid #BDBDBD;
			padding: 10rpx 10rpx 14rpx 10rpx;
			margin-bottom: 10rpx;
			background-color: white;

			.sub-comment-body {
				padding: 12rpx 0 0 4rpx;
				font-size: 30rpx;

				.parent-name {
					color: #039BE5;
				}
			}
		}
	}

	.dock-row-box {
		height: 80rpx;
		
		.dock-row {
			position: fixed;
			bottom: 0;
			// border: 1rpx solid black;
			width: 100%;
			display: flex;
			justify-content: space-around;
			padding: 8rpx 4rpx;
			background-color: white;
			align-items: center;
			box-shadow: -1rpx -1rpx .8rpx #9E9E9E;

			.input-column {
				font-size: 30rpx;
				width: 90%;
				line-height: 1.5rem;
				background-color: #E0E0E0;
				border-radius: 25rpx;
				padding: 2rpx 25rpx;
				color: #616161;
			}
		}
	}
</style>
