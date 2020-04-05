<template>
	<view>
		<view class="on-top">
			<van-notify class="on-top" id="van-notify" />
		</view>

		<view v-if="showNewResourceModal" class="on-top">
			<SingleSubmitPopup :type="newResourceType" :title="newResourceTitle" :fieldName="newResourceFieldName" :placeHolder="newResourcePlaceHolder" :contentNullable="newResourceNullable" :contentIsNumber="newResourceIsNumber" @closeModal="closeNewResourceModal" @successCallBack="submitCallBack" />
		</view>


		<view class="course-info">
			<view class="header">
				<view class="title">
					{{course.courseName}}
					<view class="course-id">
						课程号: {{course.id}}
					</view>
				</view>


			</view>
			<view class="footer">
				<view class="info">
					{{course.classInfo}}
				</view>
				<view class="user-count">
					<view>
						<van-icon name="friends-o" custom-style="font-size: 30rpx;margin-right: 10rpx;" />
					</view>{{course.memberCount}} 人
				</view>
			</view>
		</view>


		<view class="func-select-box">
			<van-grid column-num="2">
				<navigator url="../conurse_ware/course_ware">
					<van-grid-item use-slot>
						<image src="../../static/img/icon/book.png" />
						<text>成员列表</text>
					</van-grid-item>
				</navigator>
				<navigator url="../contest/contest">
					<van-grid-item use-slot>
						<image src="../../static/img/icon/paper.png" />
						<text>讨论区</text>
					</van-grid-item>
				</navigator>
			</van-grid>
		</view>

		<view class="resource-select-box">
			<view class="label">
				<view><text>课程资源</text></view>
				<view>
					<van-button custom-class="button" square type="primary" @tap="onOpen">+</van-button>
				</view>
			</view>
			<van-tabs swipeable animated :active="resourceSelectIndex" @change="getResourceByTab">
				<van-tab title="公告">
					<van-divider v-if="bulletins.length === 0" contentPosition="center">暂无公告</van-divider>
					<view class="list bulletin-list">
						<!-- <view class="item bulletin-item" v-for="(bulletin, idx) in bulletins" :key="idx">
							<text>{{bulletin.content}}</text>
							<text>{{bulletin.createGmt}}</text>
							
							
						</view> -->
						<van-steps custom-class="bulletin-body" desc-class="bulletin-desc"
						  :steps="steps"
						  direction="vertical"
						/>
					</view>
				</van-tab>
				<van-tab title="课件">课件</van-tab>
				<van-tab title="试卷">试卷</van-tab>
				<van-tab title="课堂">课堂</van-tab>
			</van-tabs>
		</view>
	</view>
</template>

<script>
	import Grid from '../../wxcomponents/vant/dist/grid/index.js'
	import GridItem from '../../wxcomponents/vant/dist/grid-item/index.js'
	import VanNotify from '../../wxcomponents/vant/dist/notify/index.js'
	import Notify from '../../wxcomponents/vant/dist/notify/notify.js'
	import Icon from '../../wxcomponents/vant/dist/icon/index.js'
	import Tab from '../../wxcomponents/vant/dist/tab/index.js'
	import Tabs from '../../wxcomponents/vant/dist/tabs/index.js'
	import Button from '../../wxcomponents/vant/dist/button/index.js'
	import ActionSheet from '../../wxcomponents/vant/dist/action-sheet/index.js'
	import Divider from '../../wxcomponents/vant/dist/divider/index.js'
	import Steps from '../../wxcomponents/vant/dist/steps/index.js'

	import CourseUtils from '../../static/js/course.js'
	import BulletinUtils from '../../static/js/bulletin.js'
	import Utils from '../../static/js/utils.js'

	import SingleSubmitPopup from '../../components/SingleSubmitPopup.vue'

	export default {
		components: {
			SingleSubmitPopup,
			'van-grid': Grid,
			'van-grid-item': GridItem,
			'van-notify': VanNotify,
			'van-icon': Icon,
			'van-tab': Tab,
			'van-tabs': Tabs,
			'van-button': Button,
			'van-action-sheet': ActionSheet,
			'van-divider': Divider,
			'van-steps': Steps
		},
		data() {
			return {
				course: {},
				resourceSelectIndex: 0,
				bulletins: [],
				steps: [],
				
				// new resource
				newResourceMap: [
					{ title:'新建课堂', type:'input', fieldName: '课程名', placeHolder: '请输入课程名', isNumber: false, nullable: false },
					{ title:'发布课件', type:'input', fieldName: '课件名', placeHolder: '请输入课件名', isNumber: false, nullable: false },
					{ title:'发布试卷', type:'input', fieldName: '试卷名', placeHolder: '请输入试卷名', isNumber: false, nullable: false },
					{ title:'发布公告', type:'textarea', fieldName: '公告内容', placeHolder: '请输入公告内容', isNumber: false, nullable: false },
					{ title:'发布通知', type:'input', fieldName: '通知内容', placeHolder: '请输入通知内容', isNumber: false, nullable: false },
				],
				newResourceIdx: 0,
				showNewResourceModal: false,
				newResourceType: 'input',
				newResourceTitle: '',
				newResourceFieldName: '',
				newResourcePlaceHolder: '',
				newResourceIsNumber: '',
				newResourceNullable: false,
			}
		},
		methods: {
			closeNewResourceModal() {
				this.showNewResourceModal = false;
			},
			onOpen() {
				uni.showActionSheet({
					itemList: this.newResourceMap.map(e => e['title']),
					success: (res) => {
						let idx = res.tapIndex;
						if (idx >= this.newResourceMap.length) {
							return;
						}
						
						let newResourceObj = this.newResourceMap[idx]
						
						this.newResourceIdx = idx
						this.newResourceTitle = newResourceObj['title']
						this.newResourceType = newResourceObj['type']
						this.newResourceFieldName = newResourceObj['fieldName']
						this.newResourcePlaceHolder = newResourceObj['placeHolder']
						this.newResourceIsNumber = newResourceObj['isNumber']
						this.newResourceNullable = newResourceObj['nullable']
						
						this.showNewResourceModal = true
					}
				});
			},
			
			// popup提交的callback函数
			submitCallBack(content) {
				if (this.newResourceIdx === 3) {
					// 发布公告
					let promise = BulletinUtils.createBulletin(this.course.id, content)
					promise
					.then(data => {
						if (this.resourceSelectIndex === 0) {
							// 如果此时选择的也是公告栏，则刷新
							this.getBulletins(this.course.id)
						}
					})
				}
			},
			
			// 获取资源栏内容
			getResourceByTab() {
				let idx = this.resourceSelectIndex
				
				if (idx === 0) {
					// 公告
					this.getBulletins(this.course.id)
					
				}
			},
			
			// bulletin
			getBulletins(courseId, offset = undefined, count = undefined) {
				let promise = BulletinUtils.listBulletin(courseId, offset, count)
				promise
				.then(data => {
					console.log("获得bulletins", data);
					data.forEach(e => {
						let dateObj = Utils.dateConverter(e.createGmt)
						if (null !== dateObj) {
							e.createGmt = dateObj.defaultDate
						}
					})
					
					this.bulletins = data
					this.steps = this.bulletins.map(e => {
						return {
							text: e.content,
							desc: e.createGmt
						}
					})
				})
			}
		},
		onLoad(option) {
			// 传入id
			let courseId = 7
			// let courseId = option.id
			if (!courseId) {
				Notify({
					'type': 'danger',
					'message': '未传入课程号，请刷新重试'
				})
			} else {
				let promise = CourseUtils.getCourse(courseId)
				promise
					.then(data => {
						console.log("获取到course", data);
						this.course = data
						
						// 获取资源栏的内容
						this.getResourceByTab()
					})
			}
		}
	}
</script>

<style lang="scss">
	.on-top {
		position: fixed;
		z-index: 99988;
	}

	.course-info {
		.header {
			margin-bottom: 22rpx;
			margin-top: 15rpx;
			margin-left: 15rpx;

			.title {
				font-size: 60rpx;
				font-weight: bold;
				display: flex;

				.course-id {
					font-size: 25rpx;
					margin-left: 18rpx;
					margin-top: 41rpx;
					font-weight: normal;
				}
			}
		}

		.footer {
			display: flex;
			justify-content: space-between;
			margin: 10rpx 18rpx;

			.info {
				font-size: 25rpx;
			}

			.user-count {
				font-size: 25rpx;
				display: flex;
				margin-top: 0rpx;
			}
		}
	}

	.func-select-box {
		margin-top: 35rpx;

		van-grid-item {

			// .van-grid-item__content {
			// 	background-color: $global-background-color;
			// }

			image {
				width: 80rpx;
				height: 80rpx;
				margin-bottom: 12rpx;
			}

			text {
				font-size: 26rpx;
				color: #263238;
				font-weight: bold;
			}
		}
	}

	.resource-select-box {
		margin-top: 40rpx;

		.label {
			display: flex;
			justify-content: space-between;
			margin: 0 10rpx;
			margin-bottom: 10rpx;

			text {
				font-size: 40rpx;
			}

			.button {
				height: 47rpx;
				padding: 0 40rpx;
				margin-right: 10rpx;
			}
		}
		
		.list {
			.bulletin-body {
				background-color: $global-background-color;
				
				// .van-step__circle-container {
				// 	margin-bottom: -15rpx;
				// }
				
				.van-step {
					border-radius: 20rpx;
					margin-right: 10rpx;
					margin-top: 20rpx;
					padding: 0;
				}
			}
			
			.bulletin-desc {
				font-size: 24rpx;
			}
		}
	}
</style>
