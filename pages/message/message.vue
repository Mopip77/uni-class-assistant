<template>
	<view>
		<!-- <van-tabs active="0">
			<van-tab>
			<van-dropdown-menu>
				<van-dropdown-item :value="value1" :options="option1" />
			</van-dropdown-menu></van-tab>
			<van-tab title="标签 2">内容 2</van-tab>
			<van-tab title="标签 3">内容 3</van-tab>
			<van-tab title="标签 4">内容 4</van-tab>
		</van-tabs> -->
		<van-tabbar :active="value1">
		  <van-tabbar-item icon="home-o">标签</van-tabbar-item>
		  <van-tabbar-item icon="search">标签</van-tabbar-item>
		  <van-tabbar-item icon="friends-o">标签</van-tabbar-item>
		  <van-tabbar-item icon="setting-o">标签</van-tabbar-item>
		</van-tabbar>
	</view>
</template>

<script>
	import Tab from '../../wxcomponents/vant/dist/tab/index.js'
	import Tabs from '../../wxcomponents/vant/dist/tabs/index.js'
	import DDM from '../../wxcomponents/vant/dist/dropdown-menu/index.js'
	import DDI from '../../wxcomponents/vant/dist/dropdown-item/index.js'
	import Tabbar from '../../wxcomponents/vant/dist/tabbar/index.js'
	import TabbarItem from '../../wxcomponents/vant/dist/tabbar-item/index.js'


	export default {
		components: {
			'van-tab': Tab,
			'van-Tabs': Tabs,
			'van-dropdown-menu': DDM,
			'van-dropdown-item': DDI,
			'van-tabbar': Tabbar,
			'van-tabbar-item': TabbarItem
		},
		data() {
			return {
				value1: 0,
				option1: [
					{ text:'聊天', value: 0 },
					{ text:'超惨', value: 1 },
					{ text:'等我', value: 2 },
				]
			}
		}
 	}
</script>

<style>
</style>
