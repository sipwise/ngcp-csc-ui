<template>
	<q-list
		item-separator
		link
		class="csc-toolbar-btn-popover"
	>
		<q-item @click="initCall('audioOnly')">
			<q-item-side
				icon="mic"
				color="primary"
			/>
			<q-item-main :label="$t('startAudioCall')" />
		</q-item>
		<q-item @click="initCall('audioVideo')">
			<q-item-side
				icon="videocam"
				color="primary"
			/>
			<q-item-main :label="$t('startVideoCall')" />
		</q-item>
		<q-item @click="initCall('audioScreen')">
			<q-item-side
				icon="computer"
				color="primary"
			/>
			<q-item-main :label="$t('startScreenSharing')" />
		</q-item>
	</q-list>
</template>

<script>
export default {
	name: 'CscCallOptionList',
	data () {
		return {}
	},
	methods: {
		initCall (media) {
			this.$emit('init-call', media)
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
