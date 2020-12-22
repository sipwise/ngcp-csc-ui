<template>
	<q-btn
		icon="undo"
		color="white"
		flat
		dense
		:label="$t('Reset')"
		:disable="$attrs.loading"
		v-bind="$attrs"
		v-on="$listeners"
	/>
</template>

<script>
export default {
	name: 'CscInputButtonReset'
}
</script>
