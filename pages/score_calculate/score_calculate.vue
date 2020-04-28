<template>
	<view>
		<van-notify class="on-top" id="van-notify" />
		
		<view class="main-title">
			分数结算

			<view class="my-button-group">
				<van-button custom-class="my-button six-word" square type="warning" @tap="updateScoreConstitution">更改分数构成</van-button>
				<van-button :disabled="null === scoreRule || scoreRule.calculating !== 0" custom-class="my-button" square type="danger" @tap="calScore">结算</van-button>
			</view>
		</view>

		<view v-if="null === scoreRule && !showUpdateScoreForm" class="warn-box">
			还没有设置分数构成
		</view>
		
		<view v-if="null !== scoreRule && !showUpdateScoreForm" class="score-info">
			<view class="title">
				分数构成方式(总和为100%)
			</view>
			
			<view class="score-info-item sign-in">
				<text>签到占比: {{scoreRule.signInProp}}%</text>
				<text v-if="scoreRule.signInType === 1" class="tip">每次未签到扣{{scoreRule.scoreEachSignIn}}分</text>
				<text v-else-if="scoreRule.signInType === 2" class="tip">允许{{scoreRule.nTimesFullScore}}次未签到,额外部分每次扣{{scoreRule.scoreEachSignIn}}分</text>
				<text v-else-if="scoreRule.signInType === 3" class="tip">如果超过{{scoreRule.nTimesNoScore}}次未签到则最终分数为0</text>
			</view>
			
			<view class="score-info-item contest">
				测试占比: {{scoreRule.contestProp}}%
			</view>
			
			<view class="score-info-item course-ware">
				课件预习占比: {{scoreRule.courseWareProp}}%
			</view>
		</view>
		
		<view v-if="showUpdateScoreForm" class="update-score-constitution-box">
			<view class="title">
				分数构成方式(总和为100%)
			</view>
			
			<view class="item sign-in">
				<view class="label">
					签到
				</view>
				<view class="input-box">
					<radio-group @change="changeSignInType">
						<label class="radio"><radio value="1" :checked="checked[0]" />每次未签到扣{{needX && xScore > 0 ? xScore : 'x'}}分</label>
						<label class="radio"><radio value="2" :checked="checked[1]" />允许{{needN && nScore > 0 ? nScore : 'n'}}次未签到，超出部分每次扣{{needX && xScore > 0 ? xScore : 'x'}}分</label>
						<label class="radio"><radio value="3" :checked="checked[2]" />超过{{needN && nScore > 0 ? nScore : 'n'}}次签到该课程0分</label>
					</radio-group>
					
					<view class="score-slider">
						<slider :value="signInFullScore" @change="sliderChange($event, 0)" max="100" show-value />
						<text>分</text>
					</view>
					
					<view class="detail-score">
						<view :class="needX ? '' : 'not-need'">x: <input type="text" :disabled="!needX" v-model="xScore" /></view>
						<view :class="needN ? '' : 'not-need'">n: <input type="text" :disabled="!needN" v-model="nScore" /></view>
					</view>
				</view>
			</view>
			
			<view class="item contest">
				<view class="label">
					测试
				</view>
				
				<view class="input-box">
					<view class="score-slider">
						<slider :value="contestFullScore" @change="sliderChange($event, 1)" :max="maxFullScore" show-value />
						<text>分</text>
					</view>
				</view>
			</view>
			
			<view class="item course-ware">
				<view class="label">
					课件预习
				</view>
				
				<view class="input-box">
					<text>{{courseWareFullScore}} 分</text>
				</view>
			</view>
		
			<view class="my-button-group">
				<van-button custom-class="my-button" plain square type="primary" @tap="cancelUpdateScoreForm">取消</van-button>
				<van-button custom-class="my-button" square type="primary" @tap="updateScoreForm">更改</van-button>
			</view>
		</view>
		
		<view v-if="!showUpdateScoreForm">
			<view v-if="scoreRule.calculating === 0" class="warn-box">
				已经设置了设置了分数构成，可以结算了
			</view>
			<view v-else-if="scoreRule.calculating === 1" class="warn-box">
				正在后台计算中，请稍后再来...
			</view>
			<view v-else-if="scoreRule.calculating === 2" class="score-box">
				<view class="title">
					成绩列表
				</view>
				<view class="score-list">
					<view class="score-item" v-for="(studentScore, idx) in studentScores" :key="idx">
						<view class="user-box">
							<image :src="studentScore.creator.avatarUrl"></image>
							<view class="student-name">{{studentScore.creator.nickname}}</view>
						</view>
						<view class="score" :class="studentScore.score < 60 ? 'red' :''">{{studentScore.score}}</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import CourseUtils from '@/static/js/course.js';
	import VanNotify from "@/wxcomponents/vant/dist/notify/index.js";
	import Notify from "@/wxcomponents/vant/dist/notify/notify.js";
	import Button from '@/wxcomponents/vant/dist/button/index.js'

	export default {
		components: {
			"van-notify": VanNotify,
			"van-button": Button
		},

		data() {
			return {
				course: {},
				scoreRule: null,
				signInType: 0,
				signInFullScore: 30,
				contestFullScore: 35,
				courseWareFullScore: 35,
				checked: [false, false, false],
				xScore: 0,
				nScore: 0,
				needX: false,
				needN: false,
				maxFullScore: 70,
				showUpdateScoreForm: false,
				
				studentScores: []
			};
		},

		methods: {
			updateScoreConstitution() {
				// 如果之前有rule，先显示出来
				if (null !== this.scoreRule) {
					this.signInType = this.scoreRule.signInType
					this.signInFullScore = this.scoreRule.signInProp
					this.contestFullScore = this.scoreRule.contestProp
					this.courseWareFullScore = this.scoreRule.courseWareProp
					this.xScore = this.scoreRule.scoreEachSignIn
					this.nScore = this.scoreRule.nTimesFullScore
					this.maxFullScore = 100 - this.signInFullScore
					this.checked[this.signInType - 1] = true
					
					this.changeSignInType({target:{value: this.signInType}})
				}
				
				this.showUpdateScoreForm = true;
			},
			
			cancelUpdateScoreForm() {
				this.showUpdateScoreForm = false;
			},
			
			updateScoreForm() {
				// 校验数据
				if (!this.checkScoreForm()) {
					return;
				}
				
				let rule = {
					courseId: this.course.id,
					signInProp: this.signInFullScore,
					contestProp: this.contestFullScore,
					courseWareProp: this.courseWareFullScore,
					signInType: this.signInType,
					scoreEachSignIn: this.xScore,
					nTimesFullScore: this.nScore,
					nTimesNoScore: this.nScore,
					calculating: 0
				}
				let p = CourseUtils.updateScoreRule(rule)
				p.then(() => {
					this.showUpdateScoreForm = false;
					this.scoreRule = rule
				})
			},
			
			changeSignInType(e) {
				let idx = Number(e.target.value)
				this.signInType = idx
				
				if (1 === idx) {
					// 每次未签到扣x分
					this.needX = true
					this.needN = false
				} else if (2 === idx) {
					// 允许n次未签到，超出部分每次扣x分
					this.needX = true
					this.needN = true
				} else if (3 === idx) {
					// 超过n次签到该课程0分
					this.needX = false
					this.needN = true
				}
			},
			
			sliderChange(e, idx) {
				if (0 === idx) {
					this.signInFullScore = e.detail.value
					
					let leftAvgScore = Math.floor((100 - this.signInFullScore) / 2);
					this.contestFullScore = leftAvgScore;
					this.courseWareFullScore = 100 - this.signInFullScore - this.contestFullScore;
					this.maxFullScore = 100 - this.signInFullScore;
				} else if (1 === idx) {
					this.contestFullScore = e.detail.value
					
					this.courseWareFullScore = 100 - this.signInFullScore - this.contestFullScore;
				}
			},
			
			calScore() {
				if (null === this.scoreRule || this.scoreRule.calculating !== 0) {
					return;
				}
				
				if (null !== this.scoreRule) {
					let p = CourseUtils.scoreCal(this.course.id)
					p.then(() => {
						this.scoreRule.calculating = 1
					})
				}
			},
			
			checkScoreForm() {
				if (this.signInFullScore < 0 || this.contestFullScore < 0 || this.courseWareFullScore < 0) {
					Notify({
						type: 'danger',
						message: '分数不能为0'
					})
					return false;
				}
				
				if (this.signInFullScore + this.contestFullScore + this.courseWareFullScore !== 100) {
					Notify({
						type: 'danger',
						message: '三者分数相加必须为100'
					})
					return false;
				}
				
				if (this.signInType <= 0 || this.signInType > 3) {
					Notify({
						type: 'danger',
						message: '必须勾选一种签到打分方式'
					})
					return false;
				}
				
				if (this.needX && this.xScore <= 0) {
					Notify({
						type: 'danger',
						message: 'x必须大于0'
					})
					return false;
				}
				
				if (this.needN && this.nScore <= 0) {
					Notify({
						type: 'danger',
						message: 'n必须大于0'
					})
					return false;
				}
				
				return true;
			}
		},

		onLoad(option) {
			let courseId = 7
			let that = this
			// let courseId = option.courseId

			if (!courseId) {
				Notify({
					type: 'danger',
					message: '未传入课程号'
				})
				return;
			}

			let p = CourseUtils.getCourse(courseId)
			p.then(data => {
				that.course = data
				
				let pp = CourseUtils.getScoreRule(courseId)
				pp.then(data => {
					that.scoreRule = data
				
					if (data && data.calculating === 2) {
						let ppp = CourseUtils.getStudentScoreList(that.course.id)
						ppp.then(data => {
							this.studentScores = data.userScores
							
							// 格式化小数，排序
							this.studentScores.forEach(sS => {
								let num = sS.score
								let numStr = num.toString()
								let index = numStr.indexOf('.')
								sS.score = Number(numStr.slice(0, index + 3))
							})
							
							this.studentScores.sort((x, y) => y.score - x.score)
						})
					}
				})
			})
		}
	}
</script>

<style lang="scss">
	.my-button-group {
		margin-left: auto;
		margin-right: 18rpx;
		
		.my-button {
			width: 120rpx;
			height: 70rpx;
			margin-left: 24rpx;
			border-radius: 6rpx;
			
			&.six-word {
				width: 240rpx;
			}
		}
	}
	
	.main-title {
		margin: 20rpx 10rpx;
		font-size: 50rpx;
		font-weight: 600;
		margin-bottom: 100rpx;
		display: flex;
		align-items: flex-end;
	}
	
	.title {
			font-size: 36rpx;
			background-color: #4FC3F7;
			color: #fff;
			padding: 4rpx 6rpx;
		}
		
	.score-info {
		.score-info-item {
			font-size: 30rpx;
			border-bottom: 1rpx dashed black;
			padding: 8rpx;
		}
		
		.sign-in {
			display: flex;
			justify-content: space-between;
			align-items: flex-end;

			.tip {
				font-size: 26rpx;
				color: #757575;
			}
		}
	}
	
	.update-score-constitution-box {
		.item {
			display: flex;
			align-items: center;
			border-bottom: 1px dashed;
			
			.label {
				font-size: 38rpx;
				width: 180rpx;
				margin-left: 10rpx;
			}
			
			.input-box {
				font-size: 24rpx;
				display: flex;
				flex-direction: column;
				
				radio-group {
					display: flex;
					flex-direction: column;

					.radio {
						font-size: 28rpx;
						padding: 8rpx 0;
					}
				}
				
				.score-slider {
					display: flex;
					align-items: center;
					
					slider {
						width: 400rpx;
					}
					
					text {
						color: gray;
						margin-left: -30rpx;
					}
				}
			}
		
			.detail-score {
				display: flex;
				justify-content: space-around;
				font-size: 30rpx;
				margin-top: 26rpx;
				margin-bottom: 30rpx;
				align-items: center;

				view {
					display: flex;
					width: 162rpx;
					align-items: center;
					margin-left: -48rpx;
					
					input {
						background-color: #fff;
						margin-left: 10rpx;
						padding: 0rpx 4rpx;
						border-radius: 16rpx;
						box-shadow: 4rpx 4rpx 1rpx #9E9E9E;
						text-align: center;
					}
				}
				
				.not-need {
					color: gray;
					text-decoration: line-through;
				}
			}
		}
		
		.my-button-group {
			margin-top: 70rpx;
			display: flex;
			justify-content: space-around;
			
			.my-button {
				width: 150rpx;
			}
		}
		
		.course-ware {
			.input-box {
				text {
					margin: 24rpx 0rpx;
					margin-left: 399rpx;
					font-size: 26rpx;
					color: #757575;
				}
			}
		}
	}
	
	.warn-box {
		display: flex;
		justify-content: space-around;
		margin-top: 60rpx;
		font-size: 36rpx;
		color: red;
	}
	
	.score-box {
		margin-top: 60rpx;

		.score-list {
			.score-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 14rpx 10rpx;
				border-bottom: 1rpx dashed gray;
				
				.user-box {
					display: flex;
					align-items: center;

					image {
						height: 62rpx;
						width: 62rpx;
						border-radius: 50%;
						margin-right: 10rpx;
					}
				}
			}
			
			.score.red {
				color: red;
			}
		}
	}
</style>
