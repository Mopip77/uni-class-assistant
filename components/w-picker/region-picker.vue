<template>
	<view class="w-picker-view">
		<picker-view class="d-picker-view" :indicator-style="itemHeight" :value="pickVal" @change="handlerChange">
			<picker-view-column>
				<view class="w-picker-item" v-for="(item,index) in range.provinces" :key="index">{{item.label}}</view>
			</picker-view-column>
			<picker-view-column>
				<view class="w-picker-item" v-for="(item,index) in range.citys" :key="index">{{item.label}}</view>
			</picker-view-column>
			<picker-view-column v-if="!hideArea">
				<view class="w-picker-item" v-for="(item,index) in range.areas" :key="index">{{item.label}}</view>
			</picker-view-column>
		</picker-view>
	</view>
</template>

<script>
	import areaData from "./areadata/areadata.js"
	let _this=null;
	export default {
		data() {
			return {
				pickVal:[],
				range:{
					provinces:[],
					citys:[],
					areas:[]
				},
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
			hideArea:{
				type:Boolean,
				default:false
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
			getData(){
				//用来处理初始化数据
				let provinces=areaData;
				let dVal=[];
				let value=this.value;
				let a1=value[0];//默认值省
				let a2=value[1];//默认值市
				let a3=value[2];//默认值区、县
				let province,city,area;
				let provinceIndex=provinces.findIndex((v)=>{
					return v[_this.defaultType]==a1
				});
				provinceIndex=value?(provinceIndex!=-1?provinceIndex:0):0;
				let citys=provinces[provinceIndex].children;
				let cityIndex=citys.findIndex((v)=>{
					return v[_this.defaultType]==a2
				});
				cityIndex=value?(cityIndex!=-1?cityIndex:0):0;
				let areas=citys[cityIndex].children;
				let areaIndex=areas.findIndex((v)=>{
					return v[_this.defaultType]==a3;
				});
				areaIndex=value?(areaIndex!=-1?areaIndex:0):0;
				dVal=_this.hideArea?[provinceIndex,cityIndex]:[provinceIndex,cityIndex,areaIndex];
				province=provinces[provinceIndex];
				city=citys[cityIndex];
				area=areas[areaIndex];
				let obj=_this.hideArea?{
					province,
					city
				}:{
					province,
					city,
					area
				}
				return _this.hideArea?{
					provinces,
					citys,
					dVal,
					obj
				}:{
					provinces,
					citys,
					areas,
					dVal,
					obj
				}
			},
			initData(){
				let dataData=_this.getData();
				let provinces=dataData.provinces;
				let citys=dataData.citys;
				let areas=_this.hideArea?[]:dataData.areas;
				let obj=dataData.obj;
				let province=obj.province,city=obj.city,area=_this.hideArea?{}:obj.area;
				let value=_this.hideArea?[province.value,city.value]:[province.value,city.value,area.value];
				let result=_this.hideArea?`${province.label+city.label}`:`${province.label+city.label+area.label}`;
				_this.range=_this.hideArea?{
					provinces,
					citys,
				}:{
					provinces,
					citys,
					areas
				};
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
				let provinceIndex=arr[0],cityIndex=arr[1],areaIndex=_this.hideArea?0:arr[2];
				let provinces=areaData;
				let citys=(provinces[provinceIndex]&&provinces[provinceIndex].children)||provinces[provinces.length-1].children||[];
				let areas=_this.hideArea?[]:((citys[cityIndex]&&citys[cityIndex].children)||citys[citys.length-1].children||[]);
				let province=provinces[provinceIndex]||provinces[provinces.length-1],
				city=citys[cityIndex]||[citys.length-1],
				area=_this.hideArea?{}:(areas[areaIndex]||[areas.length-1]);
				let obj=_this.hideArea?{
					province,
					city
				}:{
					province,
					city,
					area
				}
				if(_this.checkObj.province.label!=province.label){
					//当省更新的时候需要刷新市、区县的数据;
					_this.range.citys=citys;
					if(!_this.hideArea){
						_this.range.areas=areas;
					}
					
				}
				if(_this.checkObj.city.label!=city.label){
					//当市更新的时候需要刷新区县的数据;
					if(!_this.hideArea){
						_this.range.areas=areas;
					}
				}
				_this.checkObj=obj;
				_this.$nextTick(()=>{
					_this.pickVal=arr;
				})
				let result=_this.hideArea?`${province.label+city.label}`:`${province.label+city.label+area.label}`;
				let value=_this.hideArea?[province.value,city.value]:[province.value,city.value,area.value];
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

