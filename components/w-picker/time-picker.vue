<template>
	<view class="w-picker-view">
		<picker-view class="d-picker-view" :indicator-style="itemHeight" :value="pickVal" @change="handlerChange">
			<picker-view-column>
				<view class="w-picker-item" v-for="(item,index) in range.hours" :key="index">{{item}}时</view>
			</picker-view-column>
			<picker-view-column>
				<view class="w-picker-item" v-for="(item,index) in range.minutes" :key="index">{{item}}分</view>
			</picker-view-column>
			<picker-view-column v-if="second">
				<view class="w-picker-item" v-for="(item,index) in range.seconds" :key="index">{{item}}秒</view>
			</picker-view-column>
		</picker-view>
	</view>
</template>

<script>
	let _this=null;
	export default {
		data() {
			return {
				pickVal:[],
				range:{},
				checkObj:{}
			};
		},
		props:{
			itemHeight:{
				type:String,
				default:"44px"
			},
			value:{
				type:[String,Array,Number],
				default:""
			},
			current:{//是否默认选中当前日期
				type:Boolean,
				default:false
			},
			second:{
				type:Boolean,
				default:true
			}
		},
		watch:{
			value(val){
				this.initData();
			}
		},
		created() {
			_this=this;
			_this.initData();
		},
		methods:{
			formatNum(n){
				return (Number(n)<10?'0'+Number(n):Number(n)+'');
			},
			checkValue(value){
				let strReg=/^\d{2}:\d{2}:\d{2}$/,example="18:00:05";
				if(!strReg.test(value)){
					console.log(new Error("请传入与mode、fields匹配的value值，例value="+example+""))
				}
				return strReg.test(value);
			},
			resetData(year,month,day,hour,minute){
				let curDate=_this.getCurrenDate();
				let curFlag=_this.current;
				let curHour=curDate.curHour;
				let curMinute=curDate.curMinute;
				let curSecond=curDate.curSecond;
				for(let hour=0;hour<24;hour++){
					hours.push(_this.formatNum(hour));
				}
				for(let minute=0;minute<60;minute++){
					minutes.push(_this.formatNum(minute));
				}
				for(let second=0;second<60;second++){
					seconds.push(_this.formatNum(second));
				}
				return{
					hours,
					minutes,
					seconds
				}
			},
			getData(curDate){
				//用来处理初始化数据
				let hours=[],minutes=[],seconds=[];
				let curFlag=_this.current;
				let disabledAfter=_this.disabledAfter;
				let fields=_this.fields;
				let curHour=curDate.curHour;
				let curMinute=curDate.curMinute;
				let curSecond=curDate.curSecond;
				for(let hour=0;hour<24;hour++){
					hours.push(_this.formatNum(hour));
				}
				for(let minute=0;minute<60;minute++){
					minutes.push(_this.formatNum(minute));
				}
				for(let second=0;second<60;second++){
					seconds.push(_this.formatNum(second));
				}
				return _this.second?{
					hours,
					minutes,
					seconds
				}:{
					hours,
					minutes
				}
			},
			getCurrenDate(){
				let curDate=new Date();
				let curHour=curDate.getHours();
				let curMinute=curDate.getMinutes();
				let curSecond=curDate.getSeconds();
				return _this.second?{
					curHour,
					curMinute,
					curSecond
				}:{
					curHour,
					curMinute,
				}
			},
			getDval(){
				let value=_this.value;
				let fields=_this.fields;
				let dVal=null;
				let aDate=new Date();
				let hour=_this.formatNum(aDate.getHours());
				let minute=_this.formatNum(aDate.getMinutes());
				let second=_this.formatNum(aDate.getSeconds());
				if(value){
					let flag=_this.checkValue(value);
					if(!flag){
						dVal=[hour,minute,second]
					}else{
						dVal=value?value.split(":"):[];
					}
				}else{
					dVal=_this.second?[hour,minute,second]:[hour,minute]
				}
				return dVal;
			},
			initData(){
				let curDate=_this.getCurrenDate();
				let dateData=this.getData(curDate);
				let pickVal=[],obj={},full="",result="",hour="",minute="",second="";
				let dVal=_this.getDval();
				let curFlag=_this.current;
				let disabledAfter=_this.disabledAfter;
				let hours=dateData.hours;
				let minutes=dateData.minutes;
				let seconds=dateData.seconds;
				let defaultArr=_this.second?[
					dVal[0]&&hours.indexOf(dVal[0])!=-1?hours.indexOf(dVal[0]):0,
					dVal[1]&&minutes.indexOf(dVal[1])!=-1?minutes.indexOf(dVal[1]):0,
					dVal[2]&&seconds.indexOf(dVal[2])!=-1?seconds.indexOf(dVal[2]):0
				]:[
					dVal[0]&&hours.indexOf(dVal[0])!=-1?hours.indexOf(dVal[0]):0,
					dVal[1]&&minutes.indexOf(dVal[1])!=-1?minutes.indexOf(dVal[1]):0
				];
				pickVal=disabledAfter?defaultArr:(curFlag?(_this.second?[
					hours.indexOf(_this.formatNum(curDate.curHour)),
					minutes.indexOf(_this.formatNum(curDate.curMinute)),
					seconds.indexOf(_this.formatNum(curDate.curSecond)),
				]:[
					hours.indexOf(_this.formatNum(curDate.curHour)),
					minutes.indexOf(_this.formatNum(curDate.curMinute))
				]):defaultArr);
				_this.range=dateData;
				_this.checkObj=obj;
				hour=dVal[0]?dVal[0]:hours[0];
				minute=dVal[1]?dVal[1]:minutes[0];
				second=dVal[2]?dVal[0]:seconds[0];
				result=_this.second?`${hour+':'+minute+':'+second}`:`${hour+':'+minute}`;
				full=_this.second?`${hour+':'+minute+':'+second}`:`${hour+':'+minute+':00'}`;
				_this.$nextTick(()=>{
					_this.pickVal=pickVal;
				});
				_this.$emit("change",{
					result:result,
					value:full,
					obj:obj
				})
			},
			handlerChange(e){
				let arr=[...e.detail.value];
				let data=_this.range;
				let hour="",minute="",second="",result="",full="",obj={};
				hour=(arr[0]||arr[0]==0)?data.hours[arr[0]]||data.hours[data.hours.length-1]:"";
				minute=(arr[1]||arr[1]==0)?data.minutes[arr[1]]||data.minutes[data.minutes.length-1]:"";
				second=(arr[2]||arr[2]==0)?data.seconds[arr[2]]||data.seconds[data.seconds.length-1]:"";
				obj=_this.second?{
					hour,
					minute,
					second
				}:{
					hour,
					minute
				};
				this.checkObj=obj;
				result=_this.second?`${hour+':'+minute+':'+second}`:`${hour+':'+minute}`;
				full=_this.second?`${hour+':'+minute+':'+second}`:`${hour+':'+minute+':00'}`;
				_this.$emit("change",{
					result:result,
					value:full,
					obj:obj
				})
			}
		}
	}
</script>

<style lang="scss">
	@import "./w-picker.css";	
</style>

