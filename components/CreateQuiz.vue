<template>
	<!-- 创建QUIZ只需要限时
		props: courseId, 
		emit: closeModal, successCallback(quizId)
	 -->

	<view>
		<view v-if="showCreateQuestionModal" class="on-cover create-objective-question">
			<CreateQuestion :index="CQCIndex" :questionType="CQCQuestionType" :type="CQCType" :score="CQCScore" :content="CQCContent"
			 :imageUrls="CQCImageUrls" :options="CQCOptions" @closeModal="closeModal" @successCallback="saveQuestion" @delete="deleteQuestion" />
		</view>

		<van-notify class="on-top" id="van-notify" />

		<view class="title">
			创建随堂测试

			<view class="my-button-group">
				<van-button custom-class="my-button" plain square type="primary" @tap="onCancel">取消</van-button>
				<van-button custom-class="my-button" square type="primary" @tap="createContest">创建</van-button>
			</view>
		</view>

		<view class="limit-time-box">
			<slider :value="limitMinutes" min="3" max="120" @change="sliderChange" step="1" show-value />
			<text class="time">分钟</text>
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
	import VanNotify from "@/wxcomponents/vant/dist/notify/index.js";
	import Notify from "@/wxcomponents/vant/dist/notify/notify.js";

	import CreateQuestion from '@/components/CreateQuestion.vue'

	import CommonUtils from '@/static/js/utils.js'
	import ContestUtils from '@/static/js/contest.js'

	export default {
		components: {
			CreateQuestion,
			"van-button": Button,
			"van-notify": VanNotify,
		},
		props: {
			courseId: {
				type: Number,
				required: true
			}
		},
		data() {
			return {
				// modal
				showCreateQuestionModal: false,

				// createQuestionComponentProps
				CQCIndex: 0,
				CQCQuestionType: 'objective',
				CQCType: 'update',
				CQCScore: 2,
				CQCContent: '',
				CQCImageUrls: [],
				CQCOptions: [],

				// 创建contest所需内容
				limitMinutes: 10,
				objectiveQuestions: [],
				subjectiveQuestions: [],
			};
		},
		methods: {
			// component
			// 限时滑动条
			sliderChange(e) {
				this.limitMinutes = e.detail.value
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
				this.$emit('closeModal')
			},
			createContest() {
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
					type: 3,
					published: false,
					limitMinutes: this.limitMinutes
				}

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
				
				console.log("看看contest", contest);

				let promise = ContestUtils.createContest(contest)
				promise
					.then((data) => {
						this.$emit('successCallBack', data.id)
						this.$emit('closeModal')
					})
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

	.limit-time-box {
		display: flex;
		align-items: center;
		margin: 50rpx 0;

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
