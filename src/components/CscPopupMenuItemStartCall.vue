<template>
	<csc-popup-menu-item
		icon="call"
		color="primary"
		:label="$t('Call back')"
		@click="$emit('click', $event)"
	/>
</template>
<script>
import CscPopupMenuItem from 'components/CscPopupMenuItem'
export default {
	name: 'CscPopupMenuItemStartCall',
	components: { CscPopupMenuItem }
}
</script>
