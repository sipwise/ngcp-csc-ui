<template>
	<div>
		<div
			v-if="!menuMinimized"
			class="q-pr-md q-pl-md q-pt-xs q-pb-xs text-subtitle2"
		>
			{{ $t('New features') }}
		</div>
		<csc-main-menu
			:items="items"
		/>
	</div>
</template>

<script>
import {
	mapGetters
} from 'vuex'
import CscMainMenu from 'components/CscMainMenu'
export default {
	name: 'CscMainMenuNewFeatures',
	components: {
		CscMainMenu
	},
	props: {
		callStateTitle: {
			type: String,
			default: ''
		},
		callStateSubtitle: {
			type: String,
			default: ''
		},
		isCallForward: {
			type: Boolean,
			default: false
		},
		isCallBlocking: {
			type: Boolean,
			default: false
		},
		isPbxAdmin: {
			type: Boolean,
			default: false
		},
		isPbxConfiguration: {
			type: Boolean,
			default: false
		},
		menuMinimized: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {}
	},
	computed: {
		...mapGetters('user', [
			'isRtcEngineUiVisible'
		]),
		items () {
			return [
				{
					to: '/user/new-call-forward',
					icon: 'phone_forwarded',
					label: this.$t('Call Forwarding'),
					visible: true
				}
			]
		}
	}
}
</script>
