<template>
	<view class="w-picker-view">
		<picker-view class="d-picker-view" :indicator-style="itemHeight" :value="pickVal" @change="handlerChange">
			<picker-view-column v-for="(group,gIndex) in range" :key="gIndex">
				<view class="w-picker-item" v-for="(item,index) in group" :key="index">{{item[nodeKey]}}</view>
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
				range:[],
				checkObj:{}
			};
		},
		props:{
			itemHeight:{
				type:String,
				default:"44px"
			},
			value:{
				type:[Array,String],
				default:""
			},
			defaultType:{
				type:String,
				default:"label"
			},
			options:{
				type:Array,
				default(){
					return []
				}
			},
			defaultProps:{
				type:Object,
				default(){
					return{
						lable:"label",
						value:"value",
						children:"children"
					}
				}
			},
			level:{
				//多级联动层级，表示几级联动
				type:[Number,String],
				default:2
			}
		},
		computed:{
			nodeKey(){
				return _this.defaultProps.label;
			},
			nodeVal(){
				return _this.defaultProps.value;
			},
			nodeChild(){
				return _this.defaultProps.children;
			}
		},
		watch:{
			value(val){
				if(_this.options.length!=0){
					this.initData();
				}
			},
			options(val){
				this.initData();
			}
		},
		created() {
			_this=this;
			if(_this.options.length!=0){
				_this.initData();
			}
		},
		methods:{
			getData(){
				//用来处理初始化数据
				let options=_this.options;
				let col1={},col2={},col3={},col4={};
				let arr1=options,arr2=[],arr3=[],arr4=[];
				let col1Index=0,col2Index=0,col3Index=0,col4Index=0;
				let a1="",a2="",a3="",a4="";
				let dVal=[],obj={};
				let value=this.value;
				let data=[];
				a1=value[0];
				a2=value[1];
				if(_this.level>2){
					a3=value[2];
				}
				if(_this.level>3){
					a4=value[3];
				};
				/*第1列*/
				col1Index=arr1.findIndex((v)=>{
					return v[_this.defaultType]==a1
				});
				col1Index=value?(col1Index!=-1?col1Index:0):0;
				col1=arr1[col1Index];
				
				/*第2列*/
				arr2=arr1[col1Index][_this.nodeChild];
				col2Index=arr2.findIndex((v)=>{
					return v[_this.defaultType]==a2
				});
				col2Index=value?(col2Index!=-1?col2Index:0):0;
				col2=arr2[col2Index];
				
				/*第3列*/
				if(_this.level>2){
					arr3=arr2[col2Index][_this.nodeChild];
					col3Index=arr3.findIndex((v)=>{
						return v[_this.defaultType]==a3;
					});
					col3Index=value?(col3Index!=-1?col3Index:0):0;
					col3=arr3[col3Index];
				};
				
				
				/*第4列*/
				if(_this.level>3){
					arr4=arr3[col4Index][_this.nodeChild];
					col4Index=arr4.findIndex((v)=>{
						return v[_this.defaultType]==a4;
					});
					col4Index=value?(col4Index!=-1?col4Index:0):0;
					col4=arr4[col4Index];
				};
				switch(_this.level*1){
					case 2:
						dVal=[col1Index,col2Index];
						obj={
							col1,
							col2
						}
						data=[arr1,arr2];
						break;
					case 3:
						dVal=[col1Index,col2Index,col3Index];
						obj={
							col1,
							col2,
							col3
						}
						data=[arr1,arr2,arr3];
						break;
					case 4:
						dVal=[col1Index,col2Index,col3Index,col4Index];
						obj={
							col1,
							col2,
							col3,
							col4
						}
						data=[arr1,arr2,arr3,arr4];
						break
				}
				return {
					data,
					dVal,
					obj
				}
			},
			initData(){
				let dataData=_this.getData();
				let data=dataData.data;
				let arr1=data[0];
				let arr2=data[1];
				let arr3=data[2]||[];
				let arr4=data[3]||[];
				let obj=dataData.obj;
				let col1=obj.col1,col2=obj.col2,col3=obj.col3||{},col4=obj.col4||{};
				let result="",value=[];
				let range=[];
				switch(_this.level){
					case 2:
						value=[col1[_this.nodeVal],col2[_this.nodeVal]];
						result=`${col1[_this.nodeKey]+col2[_this.nodeKey]}`;
						range=[arr1,arr2];
						break;
					case 3:
						value=[col1[_this.nodeVal],col2[_this.nodeVal],col3[_this.nodeVal]];
						result=`${col1[_this.nodeKey]+col2[_this.nodeKey]+col3[_this.nodeKey]}`;
						range=[arr1,arr2,arr3];
						break;
					case 4:
						value=[col1[_this.nodeVal],col2[_this.nodeVal],col3[_this.nodeVal],col4[_this.nodeVal]];
						result=`${col1[_this.nodeKey]+col2[_this.nodeKey]+col3[_this.nodeKey]+col4[_this.nodeKey]}`;
						range=[arr1,arr2,arr3,arr4];
						break;
				}
				_this.range=range;
				_this.checkObj=obj;
				_this.$nextTick(()=>{
					_this.pickVal=dataData.dVal;
				});
				_this.$emit("change",{
					result:result,
					value:value,
					obj:obj
				})
			},
			handlerChange(e){
				let arr=[...e.detail.value];
				let col1Index=arr[0],col2Index=arr[1],col3Index=arr[2]||0,col4Index=arr[3]||0;
				let arr1=[],arr2=[],arr3=[],arr4=[];
				let col1,col2,col3,col4,obj={};
				let result="",value=[];
				arr1=_this.options;
				arr2=(arr1[col1Index]&&arr1[col1Index][_this.nodeChild])||arr1[arr1.length-1][_this.nodeChild]||[];
				col1=arr1[col1Index]||arr1[arr1.length-1]||{};
				col2=arr2[col2Index]||arr2[arr2.length-1]||{};
				if(_this.level>2){
					arr3=(arr2[col2Index]&&arr2[col2Index][_this.nodeChild])||arr2[arr2.length-1][_this.nodeChild];
					col3=arr3[col3Index]||arr3[arr3.length-1]||{};
				}
				if(_this.level>3){
					arr4=(arr3[col3Index]&&arr3[col3Index][_this.nodeChild])||arr3[arr3.length-1][_this.nodeChild]||[];
					col4=arr4[col4Index]||arr4[arr4.length-1]||{};
				}
				switch(_this.level){
					case 2:
						obj={
							col1,
							col2
						}
						_this.range=[arr1,arr2];
						result=`${(col1[_this.nodeKey]||'')+(col2[_this.nodeKey]||'')}`;
						value=[col1[_this.nodeVal]||'',col2[_this.nodeVal]||''];
						break;
					case 3:
						obj={
							col1,
							col2,
							col3
						}
						_this.range=[arr1,arr2,arr3];
						result=`${(col1[_this.nodeKey]||'')+(col2[_this.nodeKey]||'')+(col3[_this.nodeKey]||'')}`;
						value=[col1[_this.nodeVal]||'',col2[_this.nodeVal]||'',col3[_this.nodeVal]||''];
						break;
					case 4:
						obj={
							col1,
							col2,
							col3,
							col4
						}
						_this.range=[arr1,arr2,arr3,arr4];
						result=`${(col1[_this.nodeKey]||'')+(col2[_this.nodeKey]||'')+(col3[_this.nodeKey]||'')+(col4[_this.nodeKey]||'')}`;
						value=[col1[_this.nodeVal]||'',col2[_this.nodeVal]||'',col3[_this.nodeVal]||'',col4[_this.nodeVal]||''];
						break;
				}
				_this.checkObj=obj;
				_this.pickVal=arr;
				_this.$emit("change",{
					result:result,
					value:value,
					obj:obj
				})
			}
		}
	}
</script>

<style lang="scss">
	@import "./w-picker.css";	
</style>

