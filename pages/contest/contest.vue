<template>
	<!-- 
	这个页面是试卷的查看和编写页面
	所以调用者可能有几种组合情况
	1、老师 - 查看
	2、学生 - 完成试卷
	3、学生 - 查看试卷 - 批改前
	4、学生 - 查看试卷 - 批改后
	老师和学生使用isTeacher来判断，批改前后使用answer的revised来判断，查看还是正在进行则用leftSecond来判断 
	-->
	<view>
		<view v-if="showAnswerModal" class="on-cover">
			<CreateAnswer :index="ACIndex" :questionType="ACQuestionType" :leftSeconds="leftSecond" :look="ACLook" :revised="revised" :isTeacher="isTeacher" :question="ACQuestion" :answer="ACAnswer" @closeModal="closeModal"
			  @successCallback="updateAnswers"></CreateAnswer>
		</view>

		<van-notify class="on-top" id="van-notify" />
		<van-dialog id="van-dialog" />

		<view v-if="!published" class="expired">
			随堂测试还未发布
		</view>
		<view v-else-if="leftSecond >= 0" class="count-down-box">
			<uni-countdown class="on-everything" color="black" backgroundColor="#f2f2f2" :day="0" :hour="0" :minute="0" :second="leftSecond"
			 @timeup="autoSubmitAnswer"></uni-countdown>
		</view>
		<view v-else class="expired">
			测试已截止
		</view>


		<view class="title">
			<text v-if="!revised">总分: {{ fullScore }} 分</text>
			<text v-else>得分: {{ gotScore }} / {{ fullScore }} 分</text>

			<view class="my-button-group">
				<van-button custom-class="my-button" plain square type="primary" @tap="onCancel">取消</van-button>
				<van-button v-if="!isTeacher && leftSecond >= 0" :disabled="leftSecond < 0" custom-class="my-button" square type="primary" @tap="submitAnswer">提交</van-button>
				<van-button v-else-if="isTeacher" :disabled="leftSecond > 0" custom-class="my-button" square type="primary" @tap="goToRevise">批改</van-button>
			</view>
		</view>

		<view v-if="objectiveQuestions.length !== 0" class="question-box objective-question-box">
			<view class="header">
				<view class="sub-title">
					客观题
				</view>
			</view>

			<view class="question-list objective-question-list">
				<view @tap="gotoQuestion(idx, 'objective')" 
				:class="[objectiveQuestions[idx].answered ? 'answered' : '', revised ? (objectiveAnswers[idx].score > 0 ? 'correct' : 'error') : '']" 
				class="question-item objective-question-item"
				 v-for="(question, idx) in objectiveQuestions" :key="idx">
					<view>{{ idx + 1 }}</view>
				</view>
			</view>
		</view>

		<view v-if="subjectiveQuestions.length !== 0" class="question-box subjective-question-box">
			<view class="header">
				<view class="sub-title">
					主观题
				</view>
			</view>

			<view class="question-list subjective-question-list">
				<view @tap="gotoQuestion(idx, 'subjective')" :class="subjectiveQuestions[idx].answered ? 'answered' : ''" class="question-item subjective-question-item"
				 v-for="(question, idx) in subjectiveQuestions" :key="idx">
					<view>{{ idx + 1 }}</view>
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
	import CreateAnswer from '@/components/CreateAnswer.vue'
	import uniCountdown from '@/components/uni-countdown/uni-countdown.vue'

	import CommonUtils from '@/static/js/utils.js'
	import ContestUtils from '@/static/js/contest.js'

	export default {
		components: {
			uniCountdown,
			CreateAnswer,
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
				showAnswerModal: false,
				autoSubmit: true, // 时间到或者意外退出时自动提交，手动点取消就不自动提交，在destory方法中根据该值判断

				// answerComponentProps
				// 问题本身
				ACIndex: 0,
				ACQuestionType: 'objective',
				ACQuestion: {},
				// 回答本身
				ACLook: false, // 如果用户是教师，那么只能查看不能完成题目
				ACIsTeacher: false,
				ACAnswer: {},

				// 测试的内容
				contestId: '',
				isCreator: false,
				isTeacher: false,
				limitMinutes: 0,
				leftSecond: -1,
				contestType: 0,
				published: false,
				fullScore: 0,
				revised: false,
				publishDate: null,
				deadline: null,
				objectiveQuestions: [],
				subjectiveQuestions: [],

				// 回答的内容
				gotScore: 0,
				answerId: '',
				objectiveAnswers: [], // [[...index: Number]]
				subjectiveAnswers: [], // [{content: String, imageUrls:[]}]
			};
		},
		methods: {
			// component
			// 关闭创建answer的modal
			closeModal() {
				this.showAnswerModal = false
			},
			// 创建answer的modal的成功callback, answer的格式可在该组件文件中查看
			saveAnswer(answer) {

			},
			// 倒计时结束自动提交
			autoSubmitAnswer() {
				if (!this.isTeacher) {
					uni.showToast({
						title: '自动提交中...'
					})
					
					this.submitAnswerInternal()
				}
			},
			// 取消创建
			onCancel() {
				this.autoSubmit = false
				uni.navigateBack()
			},
			// 老师批改试卷
			goToRevise() {
				uni.navigateTo({
					url: '../revise/revise?contestId=' + this.contestId + '&fullScore=' + this.fullScore
				})
			},
			// 提交试卷（检查）
			submitAnswer() {
				let that = this
				// 检查是否全部填写
				if (this.objectiveQuestions.filter(e => !e.answered).length > 0 || this.subjectiveQuestions.filter(e => !e.answered)
					.length > 0) {
					Dialog.confirm({
							message: '还有题目没有完成，确定要提交吗？'
						}).then(() => {
							// on confirm
							that.submitAnswerInternal()
						})
						.catch(() => {});
				} else {
					that.submitAnswerInternal()
				}
			},
			// 提交试卷的真实方法
			submitAnswerInternal() {
				// 如果答案是空的需要补充，由于objective本身就是个数组，空就是数组没有元素所以不影响
				// let oA = this.objectiveAnswers.map(e => {
				// 	return {
				// 		options: e
				// 	}
				// })
				let oA = this.objectiveAnswers

				// 但是subjective就需要补充
				let sA = this.subjectiveAnswers.map((e, idx) => {
					if (!this.subjectiveQuestions[idx].answered) {
						return {
							content: '',
							imageUrls: []
						}
					}
					return e
				})

				let answer = {
					id: this.answerId,
					objectiveAnswers: oA,
					subjectiveAnswers: sA
				}

				console.log("submit一哈", answer);
				let promise = ContestUtils.updateAnswer(answer)
				promise
					.then(data => {
						this.autoSubmit = false
						uni.navigateBack()
					});
			},
			updateAnswers(index, questionType, answer) {
				console.log("index", index);
				console.log("questionType", questionType);
				console.log("answer", answer);

				if (questionType === 'objective') {
					this.objectiveAnswers[index].options = [...answer.optionAnswers]
					this.objectiveQuestions[index].answered = answer.optionAnswers.length > 0
				} else {
					this.subjectiveAnswers[index] = {
						content: answer.content,
						imageUrls: [...answer.answerImageUrls]
					}
					this.subjectiveQuestions[index].answered = answer.content || answer.answerImageUrls.length > 0
				}
			},

			// function
			// 新增一个answer，初始化所有参数，调用component
			gotoQuestion(index, type) {
				let questions = type === 'objective' ? this.objectiveQuestions : this.subjectiveQuestions;
				let answers = type === 'objective' ? this.objectiveAnswers : this.subjectiveAnswers;

				this.ACIndex = index;
				this.ACQuestionType = type;
				this.ACLook = this.isTeacher || this.leftSecond < 0;
				this.ACQuestion = questions[index];
				this.ACAnswer = answers[index];

				this.showAnswerModal = true;
			},
		},
		onLoad(option) {
			this.contestId = option.contestId
			
			// 这两个用于页面直接跳转到问题页面，如果都存在那么就在加载完试卷后自动跳转
			let qId = option.questionId
			let type = option.questionType
			
			let that = this
			let promise = ContestUtils.getContestDetail(this.contestId)
			promise
				.then(async function(data) {
					CommonUtils.dateConverterBatch(data, 'publishDate', 'deadline')

					that.isTeacher = data.isTeacher
					that.isCreator = data.isCreator
					that.limitMinutes = data.limitMinutes
					that.objectiveQuestions = data.objectiveQuestions
					that.subjectiveQuestions = data.subjectiveQuestions
					that.fullScore = data.fullScore
					that.contestType = data.type
					that.published = data.published
					that.publishDate = data.publishDate
					that.deadline = data.deadline 

					// getAllAnswers
					if (that.isTeacher) {
						// 首先leftSecond对于老师来说只是用于判断测试是否过期，而且如果是未发布的quiz只有limitMinutes，并没有另外两个，所以直接设置leftSecond为正数即可
						if (!that.publishDate && !that.deadline) {
							that.leftSecond = 500000
						} else {
							that.leftSecond = Math.floor(ContestUtils.getLeftDateForTeacher(that.publishDate, that.deadline, that.limitMinutes) / 1000)
						}
						
						// 如果没有就新建
						that.objectiveAnswers = that.objectiveQuestions.map(e => {
							return {
								options: []
							}
						})

						that.subjectiveAnswers = that.subjectiveQuestions.map(e => {
							return {
								content: '',
								imageUrls: []
							}
						})
					} else {
						// 如果是学生就要向服务器获取answer
						let answerData = await ContestUtils.getAnswer(that.contestId)
						if (answerData) {
							that.revised = answerData.revised
							that.answerId = answerData.id
							that.gotScore = answerData.score
							
							// 设置倒计时时间
							let dateObj = CommonUtils.dateConverter(answerData.startGmt)
							that.leftSecond = Math.floor(ContestUtils.getLeftDate(dateObj.defaultDatetime, that.publishDate, that.deadline,
								that.limitMinutes) / 1000)
						} else {
							// 说明学生并没有提交过试卷
							that.revised = true
							that.subjectiveAnswers = that.subjectiveQuestions.map(e => {
								return {
									score: 0,
									content: '',
									imageUrls: []
								}
							})
						}

						// 如果回答没有说明是新创建的，先生成对应数量的答案
						if (!answerData || answerData.objectiveAnswers.length === 0) {
							that.objectiveAnswers = that.objectiveQuestions.map(e => {
								return {
									score: 0,
									options: []
								}
							})
						} else {
							that.objectiveAnswers = answerData.objectiveAnswers
						}

						if (!answerData || answerData.subjectiveAnswers.length === 0) {
							that.subjectiveAnswers = that.subjectiveQuestions.map(e => {
								return {
									score: 0,
									content: '',
									imageUrls: []
								}
							})
						} else {
							that.subjectiveAnswers = answerData.subjectiveAnswers
						}

						// 补充是否填写的信息
						that.objectiveQuestions.forEach((e, idx) => {
							e.answered = that.objectiveAnswers[idx].options.length > 0
						})

						that.subjectiveQuestions.forEach((e, idx) => {
							e.answered = that.subjectiveAnswers[idx].content || that.subjectiveAnswers[idx].imageUrls.length > 0
						})
					}
				
					// redirect
					if (qId && type) {
						let questionList = []
						if (type === 'objective') {
							questionList = that.objectiveQuestions
						} else {
							questionList = that.subjectiveQuestions
						}
						
						let result = questionList.map((question, idx) => {
							if (question.id === qId) {
								return idx
							} else {
								return -1
							}
						}).filter(i => i >= 0)
						
						if (result.length > 0) {
							that.gotoQuestion(result[0], type)
						}
					}
				})
		},
		destroyed() {
			console.log("destorey");
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

	.on-everything {
		position: fixed;
		z-index: 1000000;
	}

	.expired {
		color: white;
		background-color: red;
		border-radius: 0 0 10rpx 10rpx;
		font-weight: 500;
		display: flex;
		justify-content: center;
	}

	.title {
		margin: 20rpx 10rpx;
		font-size: 50rpx;
		font-weight: 600;
		display: flex;
		align-items: flex-end;

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
			}
		}

		.option-list-box {
			margin-top: 40rpx;

			.option-list {
				margin-top: 10rpx;
				border-bottom: 1rpx gray dashed;

				.option {
					display: flex;
					align-items: center;
					padding: 15rpx 10rpx;
					border-top: 1rpx gray dashed;

					text {
						margin-left: 10rpx;
					}
				}
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
			background-color: white;
			color: black;

			view {
				display: flex;
				align-items: center;
			}
		}

		// 特化
		.objective-question-item.answered {
			background-color: #00838f;
		}
		
		.objective-question-item.correct {
			color: white;
			background-color: #4CAF50;
		}
		
		.objective-question-item.error {
			color: white;
			background-color: #f44336;
		}

		.subjective-question-item {
			border-radius: 0;
		}

		.subjective-question-item.answered {
			border-radius: 0;
			background-color: #ffb74d;

			view {
				color: black;
			}
		}
	}

	.my-button-group {
		margin-top: 60rpx;
		display: flex;
		justify-content: space-around;

		.my-button {
			border-radius: 10%;
			width: 150rpx;
		}
	}
</style>
