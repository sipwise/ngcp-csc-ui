<template>
	<div
		class="csc-list-item-title"
	>
		<q-icon
			v-if="icon"
			:name="icon"
			:color="iconColor"
			size="24px"
		/>
		<slot />
	</div>
</template>

<script>
export default {
	name: 'CscListItemTitle',
	props: {
		icon: {
			type: String,
			default: ''
		},
		iconColor: {
			type: String,
			default: ''
		}
	},
	data () {
		return {}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
