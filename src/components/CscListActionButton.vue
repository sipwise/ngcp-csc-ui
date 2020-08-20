<template>
	<q-btn
		flat
		:icon="icon"
		:color="color"
		:disable="disable"
		:label="label"
		@click="$emit('click')"
	/>
</template>

<script>
export default {
	name: 'CscListActionButton',
	props: {
		disable: {
			type: Boolean,
			default: false
		},
		icon: {
			type: String,
			default: ''
		},
		color: {
			type: String,
			default: ''
		},
		label: {
			type: String,
			default: ''
		}
	},
	data () {
		return {}
	}
}
</script>
