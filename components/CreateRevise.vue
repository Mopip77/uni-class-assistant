<template>
	<view>
		<view v-if="showModal" class="on-cover">
			<ReviseSubjectiveQuestion :question="RSQQuestion" :answer="RSQAnswer" :index="RSQIndex" @closeModal="closeModal" @successCallback="revised"></ReviseSubjectiveQuestion>
		</view>
		
		<view class="title">
			<text>批改试卷</text>
			<view class="my-button-group">
				<van-button custom-class="my-button" plain square type="primary" @tap="onCancel">返回</van-button>
				<van-button :disabled="subjectiveFullscore === 0" custom-class="my-button" square type="primary" @tap="submitRevise">提交</van-button>
			</view>
		</view>

		<view v-if="contest.objectiveQuestions.length !== 0" class="revise-box objective-revise-box">
			<view class="header">
				<view class="sub-title">
					客观题
				</view>
				<view class="score-box">
					{{objectiveGotscore}} / {{objectiveFullscore}} 分
				</view>
			</view>
			
			<view class="question-list objective-question-list">
				<view class="question-item objective-question-item" :class="answer.objectiveAnswers[idx].score > 0 ? 'correct' : 'error'" v-for="(q, idx) in contest.objectiveQuestions" :key="idx">
					<view>{{idx + 1}}</view>
				</view>
			</view>
		</view>

		<view v-if="contest.subjectiveQuestions.length !== 0" class="revise-box objective-revise-box">
			<view class="header">
				<view class="sub-title">
					主观题
				</view>
				<view class="score-box">
					{{subjectiveGotscore}} / {{subjectiveFullscore}} 分
				</view>
			</view>
			
			<view class="question-list subjective-question-list">
				<view class="question-item subjective-question-item" v-for="(q, idx) in contest.subjectiveQuestions" :key="idx" @tap="reviseSubjectiveQuestion(idx)">
					<view>{{idx + 1}}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import Button from '@/wxcomponents/vant/dist/button/index.js'
	import VanNotify from "@/wxcomponents/vant/dist/notify/index.js";
	import Notify from "@/wxcomponents/vant/dist/notify/notify.js";

	import ReviseSubjectiveQuestion from '@/components/ReviseSubjectiveQuestion.vue'

	import ContestUtils from '@/static/js/contest.js'
	import CommonUtils from '@/static/js/utils.js'

	export default {
		props: {
			contestId: {
				type: String,
				required: true
			},
			userId: {
				type: Number,
				required: true
			}
		},
		components: {
			ReviseSubjectiveQuestion,
			"van-button": Button,
			"van-notify": VanNotify,
		},
		computed: {
			objectiveFullscore() {
				return this.contest.objectiveQuestions ? this.contest.objectiveQuestions.reduce((total, answerQuestion) => total +
					answerQuestion.score, 0) : 0
			},
			subjectiveFullscore() {
				return this.contest.subjectiveQuestions ? this.contest.subjectiveQuestions.reduce((total, answerQuestion) => total +
					answerQuestion.score, 0) : 0
			},
			objectiveGotscore() {
				return this.answer.objectiveAnswers ? this.answer.objectiveAnswers.reduce((total, answerQuestion) => total + answerQuestion.score, 0) : 0
			},
			subjectiveGotscore() {
				return this.answer.subjectiveAnswers ? this.answer.subjectiveAnswers.reduce((total, answerQuestion) => total + answerQuestion.score, 0) : 0
			},
		},

		data() {
			return {
				contest: {},
				answer: {},
				
				// component
				showModal: false,
				RSQAnswer: {},
				RSQQuestion: {},
				RSQIndex: {}
			}
		},

		methods: {
			// component
			closeModal() {
				this.showModal = false
			},
			revised(idx, score) {
				this.answer.subjectiveAnswers[idx].score = score
			},
			
			reviseSubjectiveQuestion(idx) {
				this.RSQQuestion = this.contest.subjectiveQuestions[idx]
				this.RSQAnswer = this.answer.subjectiveAnswers[idx]
				this.RSQIndex = idx
				
				this.showModal = true
			},
			
			submitRevise() {
				let promise = ContestUtils.updateRevise(this.answer.id, this.answer.subjectiveAnswers.map(e => e.score))
				promise
				.then(data => {
					console.log("看看", data);
					uni.navigateBack()
				})
			}
		},

		created() {
			let that = this
			let p = ContestUtils.getContestDetail(this.contestId)
			p.then(data => {
				CommonUtils.dateConverterBatch(data, false, 'createGmt', 'deadline', 'publishDate')
				that.contest = data

				let pr = ContestUtils.getReviseAnswer(that.userId, that.contestId)
				pr
					.then(answer => {
						CommonUtils.dateConverterBatch(answer, false, 'startGmt', 'updateGmt')
						that.answer = answer
					})
			})
		}
	}
</script>

<style lang="scss">
	.on-cover {
		z-index: 8889;
		position: absolute;
		width: 100%;
		height: 100%;
		background-color: $global-background-color;
	}
	
	.title {
		margin: 20rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;

		text {
			font-size: 50rpx;
			font-weight: 600;
		}

		.my-button-group {
			display: flex;
			justify-content: space-around;

			.my-button {
				border-radius: 10%;
				width: 120rpx;
				margin-left: 40rpx;
				height: 60rpx;
			}
		}
	}

	.revise-box {

		margin-bottom: 40rpx;

		.header {
			background-color: #4FC3F7;
			color: white;
			font-size: 40rpx;
			display: flex;
			align-items: center;
			padding: 4rpx 10rpx;
			justify-content: space-between;
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
			background-color: #fff;
	
			view {
				color: black;
			}
		}
		
		.correct {
			background-color: #4CAF50;
		}
		
		.error {
			background-color: #f44336;
		}
	}
</style>