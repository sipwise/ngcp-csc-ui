<template>
	<q-btn
		icon="more_vert"
		color="primary"
		flat
		dense
		@click.stop.prevent
	>
		<csc-popup-menu>
			<slot />
		</csc-popup-menu>
	</q-btn>
</template>
<script>
import CscPopupMenu from 'components/CscPopupMenu'
export default {
	name: 'CscMoreMenu',
	components: {
		CscPopupMenu
	}
}
</script>
