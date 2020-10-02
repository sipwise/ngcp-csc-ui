<template>
	<q-popup-proxy>
		<q-list
			v-bind="$attrs"
			class="bg-dark"
			v-on="$listeners"
		>
			<slot />
		</q-list>
	</q-popup-proxy>
</template>

<script>
export default {
	name: 'CscPopupMenu'
}
</script>
