<template>
	<view>
		<van-popup :show="firstLogin">
			<UpdateUserInfo loginUser="loginUser"></UpdateUserInfo>
		</van-popup>
	</view>
</template>

<script>
	import UpdateUserInfo from '../../components/UpdateUserInfo.vue'
	import VanPopup from '../../wxcomponents/vant/dist/popup/index.js'

	export default {
		components: {
			UpdateUserInfo,
			'van-popup': VanPopup,
		},
		computed: {
			loginUser() {
				return this.$store.state.loginUser
			}
		},
		data() {
			return {
				firstLogin: false
			}
		}
	}
</script>

<style>
</style>
