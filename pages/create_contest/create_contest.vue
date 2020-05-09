<template>
	<view>
		<view v-if="showCreateQuestionModal" class="on-cover create-objective-question">
			<CreateQuestion :index="CQCIndex" :questionType="CQCQuestionType" :type="CQCType" :score="CQCScore" :content="CQCContent"
			 :imageUrls="CQCImageUrls" :options="CQCOptions" @closeModal="closeModal" @successCallback="saveQuestion" @delete="deleteQuestion" />
		</view>

		<van-dialog id="van-dialog" custom-style="padding-right: 10rpx;" />
		<van-notify class="on-top" id="van-notify" />


		<view class="title">
			创建测试
			<van-icon custom-class="icon" name="question-o" @tap="showHelpDialog" />

			<view class="my-button-group">
				<van-button custom-class="my-button" plain square type="primary" @tap="onCancel">取消</van-button>
				<van-button custom-class="my-button" square type="primary" @tap="createContest">创建</van-button>
			</view>
		</view>

		<view class="date-box publish-date-box">
			<view class="line-1">
				<text>设置测试开始时间</text>
				<switch @change="switchChange($event, 'publishDate')" />
			</view>

			<view v-if="usePublishDate" class="line-2">
				<van-button square type="primary" @tap="onPicker('publishDate')">选择时间</van-button>
				<text class="time">开始时间为: {{formatPublishDate}}</text>

				<w-picker mode="shortTerm" :value="formatPublishDate" :current="true" expand="30" @confirm="onConfirm($event,'publishDate')"
				 ref="publishDate"></w-picker>
			</view>
		</view>
		<view v-if="usePublishDate" class="divider publish-date-divider">
			<van-divider dashed />
		</view>


		<view class="date-box deadline-date-box">
			<view class="line-1">
				<text>设置测试截止时间</text>
				<switch  @change="switchChange($event, 'deadlineDate')" />
			</view>
			<view v-if="useDeadlineDate" class="line-2">
				<van-button square type="primary" @tap="onPicker('deadlineDate')">选择时间</van-button>
				<text class="time">截止时间为: {{formatDeadlineDate}}</text>

				<w-picker mode="shortTerm" :value="formatDeadlineDate" :current="true" expand="30" @confirm="onConfirm($event,'deadlineDate')"
				 ref="deadlineDate"></w-picker>
			</view>
		</view>
		<view v-if="useDeadlineDate" class="divider deadline-date-divider">
			<van-divider dashed />
		</view>

		<view class="limit-time-box">
			<view class="line-1">
				<text>设置测试限时</text>
				<switch @change="switchChange($event, 'limitTime')" />
			</view>
			<view v-if="useLimitTime" class="line-2">
				<slider :value="limitMinutes" min="1" max="300" @change="sliderChange" step="1" show-value />
				<text class="time">分钟</text>
			</view>
		</view>
		<view v-if="useLimitTime" class="divider limit-time-divider">
			<van-divider dashed />
		</view>
		<view class="check-date-valid">
			检查时间可行性 <van-button custom-class="check-date-btn" square type="warning" @tap="checkDateVaild(false)">检查</van-button>
		</view>

		<view class="question-box objective-question-box">

			<view class="header">
				<view class="sub-title">
					客观题
				</view>
				<van-button custom-class="button" square type="primary" @tap="addQuestion('objective')">+</van-button>
			</view>

			<view class=" question-list objective-question-list">
				<view @tap="modifyQuestion(idx, 'objective')" class="question-item objective-question-item" v-for="(question, idx) in objectiveQuestions"
				 :key="idx">
					<view>{{idx + 1}}</view>
				</view>
			</view>

		</view>

		<view class="question-box subjective-question-box">
			<view class="header">
				<view class="sub-title">
					主观题
				</view>
				<van-button custom-class="button" square type="primary" @tap="addQuestion('subjective')">+</van-button>
			</view>

			<view class="question-list subjective-question-list">
				<view @tap="modifyQuestion(idx, 'subjective')" class="question-item subjective-question-item" v-for="(question, idx) in subjectiveQuestions"
				 :key="idx">
					<view>{{idx + 1}}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import Button from "@/wxcomponents/vant/dist/button/index.js";
	import Icon from '@/wxcomponents/vant/dist/icon/index.js'
	import VanDialog from '@/wxcomponents/vant/dist/dialog/index.js'
	import Dialog from '@/wxcomponents/vant/dist/dialog/dialog.js'
	import Divider from '@/wxcomponents/vant/dist/divider/index.js'
	import VanNotify from "@/wxcomponents/vant/dist/notify/index.js";
	import Notify from "@/wxcomponents/vant/dist/notify/notify.js";

	import WPicker from '@/components/w-picker/w-picker.vue'
	import CreateQuestion from '@/components/CreateQuestion.vue'

	import CommonUtils from '@/static/js/utils.js'
	import ContestUtils from '@/static/js/contest.js'

	export default {
		components: {
			CreateQuestion,
			"w-picker": WPicker,
			"van-button": Button,
			"van-icon": Icon,
			"van-dialog": VanDialog,
			"van-divider": Divider,
			"van-notify": VanNotify,
		},
		data() {
			return {
				// modal
				showCreateQuestionModal: false,
				
				// 前一个页面传来用于判断类型（创建，修改）, 是否可更新
				type: 'create',
				updatable: true,

				// component
				usePublishDate: false,
				useDeadlineDate: false,
				useLimitTime: false,

				// createQuestionComponentProps
				CQCIndex: 0,
				CQCQuestionType: 'objective',
				CQCType: 'update',
				CQCScore: 2,
				CQCContent: '',
				CQCImageUrls: [],
				CQCOptions: [],

				// 创建contest所需内容
				courseId: 0,
				deadlineDate: new Date(),
				publishDate: new Date(),
				limitMinutes: 60,
				objectiveQuestions: [],
				// objectiveQuestions: [{
				// 	content:'1+1=?', 
				// 	imageUrls:["http://mopip77-question.oss-cn-hangzhou.aliyuncs.com/3c577be1-c724-4d7a-a8e3-518e793e7098-wxbd21241fb6e026b4.o6zAJs3p6ZYRZ1F3HkG4kH3R95Sw.bANg4yOLWBnA371d17d79397396b01676bc0c9aa89b2.png?Expires=4740169843&OSSAccessKeyId=LTAI4FpQRdpp4WXG3WPuuBru&Signature=bYTKMIsV81AD%2Bxl%2FLhVsGw19sE8%3D"],
				// 	options: [
				// 		{checked: true, value: '等于1'},
				// 		{checked: false, value: '等于2'},
				// 	],
				// 	score: 5
				// 	}],
				subjectiveQuestions: [],
			};
		},
		computed: {
			formatPublishDate() {
				let dateObj = CommonUtils.jsDateConverter(this.publishDate)
				return dateObj ? dateObj.defaultDatetime.substr(0, dateObj.defaultDatetime.length - 3) : '日期错误';
			},
			formatDeadlineDate() {
				let dateObj = CommonUtils.jsDateConverter(this.deadlineDate)
				return dateObj ? dateObj.defaultDatetime.substr(0, dateObj.defaultDatetime.length - 3) : '日期错误';
			},
		},
		methods: {
			// component
			showHelpDialog() {
				Dialog.alert({
					title: '帮助',
					messageAlign: 'left',
					message: '1、只有截止时间 ==> 作业\n2、开始时间+截止时间 ==> 定时发布的作业\n3、开始时间+限时 ==> 统一考试\n4、截止时间+限时 ==> 自由选择时间考试\n5、都有 ==> 同上，外加定时发布',

				})
			},
			// 通过开启switch来启用某一种时间
			switchChange(e, type) {
				if (type === 'publishDate') {
					this.usePublishDate = e.detail.value
				} else if (type === 'deadlineDate') {
					this.useDeadlineDate = e.detail.value
				} else if (type === 'limitTime') {
					this.useLimitTime = e.detail.value
				}
			},
			// invoke w-picker
			onPicker(type) {
				this.$refs[type].show();
			},
			// 限时滑动条
			sliderChange(e) {
				this.limitMinutes = e.detail.value
			},
			// w-picker选择时间后确定后的调用
			onConfirm(e, type) {
				// 传入有e有两种格式，一种是"今天 17:01:02"， 一种是"2020-12-12 17:01:02"
				let selectDateStr = null
				if (typeof e.obj.date === 'object') {
					selectDateStr = e.obj.date.value + ' ' + e.obj.hour.value + ':' + e.obj.minute.value
				} else {
					selectDateStr = e.value
				}
				
				selectDateStr = selectDateStr.replace(/-/g, '/')
				let selectDate = new Date(selectDateStr)

				if (type === 'publishDate') {
					this.publishDate = selectDate
				} else if (type === 'deadlineDate') {
					this.deadlineDate = selectDate
				}
			},
			// 关闭创建question的modal
			closeModal() {
				this.showCreateQuestionModal = false
			},
			// 创建question的modal的成功callback, question的格式可在该组件文件中查看
			saveQuestion(question) {
				let result = {
					score: question.score,
					content: question.content,
					imageUrls: question.imageUrls
				}

				let questions = []
				if (question.questionType === 'objective') {
					questions = this.objectiveQuestions

					let options = []
					question.options.forEach(e => {
						options.push({
							checked: e.checked,
							value: e.value
						})
					})
					result.options = options
				} else {
					questions = this.subjectiveQuestions
				}

				if (question.index >= questions.length) {
					// create
					questions.push(result)
				} else {
					// update
					questions[question.index] = result
				}

				console.log(questions);
			},
			deleteQuestion(e) {
				if (e.type === 'objective') {
					this.objectiveQuestions.splice(e.index, 1)
				} else {
					this.subjectiveQuestions.splice(e.index, 1)
				}
			},
			// 取消创建contest
			onCancel() {
				uni.navigateBack()
			},
			createContest() {
				if (!this.checkDateVaild()) {
					Notify({
						type: "danger",
						message: '时间有问题请检查'
					});
					return;
				}

				// 至少有一道题目
				if (this.objectiveQuestions.length === 0 && this.subjectiveQuestions.length === 0) {
					Notify({
						type: "danger",
						message: '至少创建一道题目'
					});
					return;
				}

				// 包装成后端所需对象
				let contest = {
					courseId: this.courseId,
					type: 2,
				}

				if (this.usePublishDate) {
					contest.publishDate = this.formatPublishDate
				}

				if (this.useDeadlineDate) {
					contest.deadline = this.formatDeadlineDate
				}

				contest.limitMinutes = this.useLimitTime ? this.limitMinutes : 0;

				let objectiveQuestions = this.objectiveQuestions.map(e => {
					let result = {
						score: e.score,
						question: e.content,
						choices: e.options.map(opt => opt.value),
						answerIndices: e.options.map((opt, idx) => opt.checked ? idx : -1).filter(idx => idx >= 0)
					}

					if (e.imageUrls.length > 0) {
						result.imageUrl = e.imageUrls[0]
					}
					return result
				})
				contest.objectiveQuestions = objectiveQuestions

				let subjectiveQuestions = this.subjectiveQuestions.map(e => {
					return {
						score: e.score,
						question: e.content,
						imageUrls: e.imageUrls
					}
				})
				contest.subjectiveQuestions = subjectiveQuestions

				let promise = ContestUtils.createContest(contest)
				promise
					.then(() => {
						// 通知前一页需要刷新
						let pages = getCurrentPages()
						let prevPage = pages[pages.length - 2];
						prevPage.$vm.refreshOnShow = true;
						uni.navigateBack()
					})
			},

			// function
			/**
			 * 检查时间是否可行，如果通过button调用则slient=false触发提醒，在提交前通过代码调用则不需要触发提醒
			 * @param {Boolean} slient
			 * @return {Boolean} 时间是否有效
			 */
			checkDateVaild(slient = true) {
				let publishDate = this.usePublishDate ? this.publishDate : null;
				let deadlineDate = this.useDeadlineDate ? this.deadlineDate : null;
				let limitMinutes = this.useLimitTime ? this.limitMinutes : null;

				let result = ContestUtils.isDateRelationValid(publishDate, deadlineDate, limitMinutes);
				if (!result.value) {
					if (!slient) {
						Notify({
							type: "danger",
							message: result.msg
						});
					}
					return false;
				}
				if (!slient) {
					Notify({
						type: "success",
						message: '没有问题'
					});
				}
				return true;
			},
			// 新增一个question，初始化所有参数，调用component
			addQuestion(type) {
				this.CQCIndex = type === 'objective' ? this.objectiveQuestions.length : this.subjectiveQuestions.length;
				this.CQCQuestionType = type;
				this.CQCType = 'create';
				this.CQCScore = 2;
				this.CQCContent = '';
				this.CQCImageUrls = [];
				this.CQCOptions = [{
					checked: false,
					value: '选项A'
				}, {
					checked: false,
					value: '选项B'
				}];

				this.showCreateQuestionModal = true;
			},
			// 更新一个question，传入问题在问题列表中的索引值和类型
			modifyQuestion(idx, type) {
				let questions = []
				if (type === 'objective') {
					questions = this.objectiveQuestions
				} else if (type === 'subjective') {
					questions = this.subjectiveQuestions
				} else {
					Notify({
						type: "danger",
						message: '传入类型错误'
					});
					return;
				}

				if (idx >= questions.length) {
					Notify({
						type: "danger",
						message: '传入索引错误'
					});
					return;
				}

				this.CQCIndex = idx
				this.CQCQuestionType = type
				this.CQCType = 'modify'
				this.CQCScore = questions[idx].score
				this.CQCContent = questions[idx].content
				this.CQCImageUrls = questions[idx].imageUrls
				this.CQCOptions = type === 'objective' ? questions[idx].options : [],

					this.showCreateQuestionModal = true
			}
		},
		onLoad(option) {
			// this.courseId = 7
			this.courseId = option.courseId
		}
	}
</script>

<style lang="scss">
	.on-top {
		position: fixed;
		z-index: 9988;
	}

	.on-cover {
		position: absolute;
		z-index: 8888;
		width: 100%;
		height: 100%;
		background-color: $global-background-color;
	}

	.title {
		margin: 20rpx 10rpx;
		font-size: 50rpx;
		font-weight: 600;
		display: flex;
		align-items: flex-end;

		.icon {
			font-size: 40rpx;
			color: gray;
			margin-left: 10rpx;
			margin-bottom: 10rpx;
		}

		.my-button-group {
			margin-left: auto;
			margin-right: 18rpx;

			.my-button {
				width: 120rpx;
				height: 70rpx;
				margin-left: 24rpx;
				border-radius: 6rpx;
			}
		}
	}

	.date-box {
		display: flex;
		flex-direction: column;
		padding: 0 10rpx;

		switch {
			transform: scale(.7);
			margin-left: 10rpx;
		}

		button {
			height: 60rpx;
			width: 180rpx;
		}

		.line-2 {
			display: flex;
			align-items: center;

			.time {
				font-size: 28rpx;
				margin-left: 8rpx;
				// margin-left: 18rpx;
				color: #616161;
			}
		}
	}

	.limit-time-box {
		display: flex;
		flex-direction: column;
		margin-bottom: 10rpx;

		switch {
			transform: scale(.7);
			margin-left: 10rpx;
		}

		.line-2 {
			display: flex;
			align-items: center;

			slider {
				width: 600rpx;
				margin-right: 0;
			}

			.time {
				font-size: 28rpx;
				margin-left: 8rpx;
				color: #8f8f8f;
			}
		}
	}

	.limit-time-divider {
		margin-bottom: 15rpx;
	}

	.check-date-valid {
		display: flex;
		align-items: center;
		margin-bottom: 15rpx;

		.check-date-btn {
			height: 53rpx;
			margin-left: 20rpx;
		}
	}

	.question-box {
		padding: 10rpx;
		margin-bottom: 40rpx;

		.header {
			border-bottom: 0.5px solid gray;
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 28rpx;
			padding-bottom: 10rpx;


			.sub-title {
				font-size: 42rpx;
				font-weight: 400;
			}

			.button {
				height: 50rpx;
				margin-right: 10px;
				padding: 4rpx 40rpx;
				border-radius: 6rpx;
			}

		}
	}

	.question-list {
		display: flex;
		flex-wrap: wrap;

		.question-item {
			border: 1rpx solid black;
			width: 80rpx;
			height: 80rpx;
			margin-left: 53rpx;
			margin-top: 27rpx;
			display: flex;
			justify-content: space-around;
			border-radius: 50%;
			background-color: #00838F;
			color: #fff;

			view {
				display: flex;
				align-items: center;
			}
		}

		// 特化
		.subjective-question-item {
			border-radius: 0;
			background-color: #FFB74D;

			view {
				color: black;
			}
		}
	}
</style>
