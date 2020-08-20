<template>
	<q-item
		v-close-popup
		clickable
		@click="click"
	>
		<q-item-section
			side
		>
			<q-icon
				:name="icon"
				:color="iconColor"
			/>
		</q-item-section>
		<q-item-section>
			<slot />
		</q-item-section>
	</q-item>
</template>

<script>
export default {
	name: 'CscListMenuItem',
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
	},
	methods: {
		click () {
			this.$emit('click')
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
