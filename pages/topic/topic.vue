<template>
	<view>
		<van-notify class="on-top" id="van-notify" />
		<view class="on-top" v-if="showNewCommentModal">
			<SingleSubmitPopup type="textarea" :title="popupTitle" fieldName="评论内容" submitText="评论" @closeModal="closeModal"
			 @successCallBack="popupCallBack" />
		</view>


		<view class="topic-box">
			<view class="header">
				<van-image round :src="topic.creatorAvatar"></van-image>
				<view class="user-info">
					<view class="creator-name">{{topic.creatorName}}</view>
					<view class="create-time">{{topic.createGmt}}</view>
				</view>
				
				<!-- 使用懒加载，即like后不刷新页面，直接修改对应值 -->
				<view v-if="!topic.like" class="like-count" @tap="likeTopic">
					<van-icon name="good-job-o" /> <text>{{topic.likeCount}}</text>
				</view>
				<view v-else class="like-count" @tap="unlikeTopic">
					<van-icon name="good-job" color="red" /> <text>{{topic.likeCount + 1}}</text>
				</view>
			</view>
			<view class="topic-body">
				<view class="title">{{topic.title}}</view>
				<view class="content">{{topic.content}}</view>
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
					<view v-if="!comment.like" class="like-count" @tap="likeComment(idx)">
						<van-icon name="good-job-o" /> <text>{{comment.likeCount}}</text>
					</view>
					<view v-else class="like-count" @tap="unlikeComment(idx)">
						<van-icon name="good-job" color="red" /> <text>{{comment.likeCount + 1}}</text>
					</view>
				</view>
				<view class="comment-body">
					{{comment.content}}
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
				<van-icon name="star-o" />
			</view>
		</view>
	</view>
	</view>
</template>

<script>
	import DropdownMenu from '@/wxcomponents/vant/dist/dropdown-menu/index.js'
	import DropdownItem from '@/wxcomponents/vant/dist/dropdown-item/index.js'
	import VanNotify from "@/wxcomponents/vant/dist/notify/index.js";
	import Notify from "@/wxcomponents/vant/dist/notify/notify.js";
	import Icon from "@/wxcomponents/vant/dist/icon/index.js";
	import Image from "@/wxcomponents/vant/dist/image/index.js";

	import msDropdownMenu from '@/components/ms-dropdown/dropdown-menu.vue'
	import msDropdownItem from '@/components/ms-dropdown/dropdown-item.vue'
	import UniLoadMore from "@/components/uni-load-more/uni-load-more.vue";
	import STabs from "@/components/s-tabs";
	import STab from "@/components/s-tab";
	import SingleSubmitPopup from '@/components/SingleSubmitPopup.vue'

	import TopicUtils from '@/static/js/topic.js'
	import CommonUtils from '@/static/js/utils.js'

	export default {

		components: {
			"ms-dropdown-menu": msDropdownMenu,
			"ms-dropdown-item": msDropdownItem,
			STabs,
			STab,
			SingleSubmitPopup,
			"van-dropdown-menu": DropdownMenu,
			"van-dropdown-item": DropdownItem,
			"van-notify": VanNotify,
			"uni-load-more": UniLoadMore,
			"van-icon": Icon,
			"van-image": Image
		},

		data() {
			return {
				refreshOnShow: false,

				// modal
				showNewCommentModal: false,
				popupTitle: '',
				newSubCommentIdx: 0, // 由于一级评论和子评论公用一个Popup，所以需要一个标志位，如果是评论子评论，那么把该位置为评论id，使用完恢复0

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

						this.offset = 0
						this.getComments()
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
						this.offset = 0
						this.getComments()
					})
			},

			getComments() {
				if (this.offset > this.comments.length) {
					return;
				}

				this.onloadingStatus = 'loading';

				let promise = TopicUtils.getComments(this.topic.id, 0, this.offset, this.count)
				promise
					.then(data => {
						console.log("获得一级评论", data);
						data.forEach(e => {
							let dateObj = CommonUtils.dateConverter(e.createGmt);
							if (null !== dateObj) {
								e.createGmt = dateObj.defaultDatetime;
							}
						});

						// 如果offset为0就直接更新，否则append
						if (this.offset) {
							this.comments = this.comments.concat(data);
						} else {
							this.comments = data;
						}

						// 更新offset 和 onLoading 类型（是否有更多加载）
						this.offset += this.count;
						this.onloadingStatus =
							this.offset === this.comments.length ? "more" : "noMore";
						console.log("更新状态", this.offset, this.onloadingStatus);
					})
			}
		},

		onLoad(option) {
			let topicId = 4
			// let topicId = option.topicId
			if (topicId) {
				this.getTopic(topicId)
			} else {
				Notify({
					type: "danger",
					message: "未传入帖子号，请刷新重试"
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
		// border: 1rpx solid black;
		width: 100%;
		display: flex;
		justify-content: space-between;
		padding: 8rpx 4rpx;
		background-color: white;
		align-items: center;
		box-shadow: -1rpx -1rpx .8rpx #9E9E9E;

		.input-column {
			font-size: 30rpx;
			width: 80%;
			line-height: 1.5rem;
			background-color: #E0E0E0;
			border-radius: 25rpx;
			padding: 2rpx 25rpx;
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
