<template>
	<q-btn
		flat
		icon="check"
		color="primary"
		@click="click"
	>
		{{ $t('buttons.save') }}
	</q-btn>
</template>

<script>
export default {
	name: 'CscFormSaveButton',
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
