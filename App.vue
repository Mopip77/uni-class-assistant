<script>
	import LoginUtils from './static/js/login.js'

	export default {
		onLaunch: function() {
			console.log('App Launch')
			let promise = LoginUtils.checkTokenVaild()
			promise.then(() => {
					console.log("then 设置为true了");
					this.$store.commit('CHECK_LOGIN')
				})
				.catch(() => {
					console.log("catch 设置为true了");
					this.$store.commit('CHECK_LOGIN')
				})
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	@import "wxcomponents/vant/dist/common/index.wxss";

	/*每个页面公共css */
	page {
		background-color: $global-background-color;
	}
</style>
