<template>
	<csc-main-menu
		:items="items"
	/>
</template>

<script>
import {
	mapGetters
} from 'vuex'
import CscMainMenu from 'components/CscMainMenu'
export default {
	name: 'CscMainMenuTop',
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
		}
	},
	data () {
		return {}
	},
	computed: {
		...mapGetters('user', [
			'isRtcEngineUiVisible',
			'isPbxEnabled'
		]),
		items () {
			return [
				{
					to: '/user/home',
					icon: 'call',
					label: this.callStateTitle,
					sublabel: this.callStateSubtitle,
					visible: this.isRtcEngineUiVisible
				},
				{
					to: '/conference',
					icon: 'videocam',
					label: this.$t('navigation.conference.title'),
					visible: this.isRtcEngineUiVisible
				},
				{
					to: '/user/conversations',
					icon: 'question_answer',
					label: this.$t('navigation.conversations.title'),
					sublabel: this.$t('navigation.conversations.subTitle'),
					visible: true
				},
				{
					icon: 'phone_forwarded',
					label: this.$t('navigation.callForward.title'),
					opened: this.isCallForward,
					visible: true,
					children: [
						{
							to: '/user/call-forward/always',
							icon: 'check_circle',
							label: this.$t('navigation.callForward.always'),
							visible: true
						},
						{
							to: '/user/call-forward/company-hours',
							icon: 'schedule',
							label: this.$t('navigation.callForward.companyHours'),
							visible: true
						},
						{
							to: '/user/call-forward/after-hours',
							icon: 'watch_later',
							label: this.$t('navigation.callForward.afterHours'),
							visible: true
						}
					]
				},
				{
					icon: 'block',
					label: this.$t('navigation.callBlocking.title'),
					opened: this.isCallBlocking,
					visible: true,
					children: [
						{
							to: '/user/call-blocking/incoming',
							icon: 'call_received',
							label: this.$t('navigation.callBlocking.incoming'),
							visible: true
						},
						{
							to: '/user/call-blocking/outgoing',
							icon: 'call_made',
							label: this.$t('navigation.callBlocking.outgoing'),
							visible: true
						},
						{
							to: '/user/call-blocking/privacy',
							icon: 'fas fa-user-secret',
							label: this.$t('navigation.callBlocking.privacy'),
							visible: true
						}
					]
				},
				{
					to: '/user/reminder',
					icon: 'notification_important',
					label: this.$t('navigation.reminder.title'),
					visible: true
				},
				{
					to: '/user/speeddial',
					icon: 'touch_app',
					label: this.$t('navigation.speeddial.title'),
					visible: true
				},
				{
					to: '/user/voicebox',
					icon: 'voicemail',
					label: this.$t('navigation.voicebox.title'),
					visible: true
				},
				{
					to: '/user/fax-settings',
					icon: 'fas fa-fax',
					label: this.$t('navigation.faxSettings.title'),
					visible: true
				},
				{
					icon: 'miscellaneous_services',
					label: this.$t('navigation.pbxConfiguration.title'),
					visible: this.isPbxAdmin,
					opened: this.isPbxConfiguration,
					children: [
						{
							to: '/user/pbx-configuration/seats',
							icon: 'person',
							label: this.$t('navigation.pbxConfiguration.seats'),
							visible: true
						},
						{
							to: '/user/pbx-configuration/groups',
							icon: 'group',
							label: this.$t('navigation.pbxConfiguration.groups'),
							visible: true
						},
						{
							to: '/user/pbx-configuration/devices',
							icon: 'fas fa-fax',
							label: this.$t('navigation.pbxConfiguration.devices'),
							visible: true
						},
						{
							to: '/user/pbx-configuration/call-queues',
							icon: 'filter_none',
							label: this.$t('navigation.pbxConfiguration.callQueues'),
							visible: true
						},
						{
							to: '/user/pbx-configuration/sound-sets',
							icon: 'queue_music',
							label: this.$t('navigation.pbxConfiguration.soundSets'),
							visible: true
						},
						{
							to: '/user/pbx-configuration/ms-configs',
							icon: 'arrow_forward',
							label: this.$t('navigation.pbxConfiguration.msConfigs'),
							visible: true
						}
					]
				},
				{
					to: '/user/pbx-settings',
					icon: 'settings',
					label: this.$t('navigation.pbxSettings.title'),
					visible: this.isPbxEnabled
				}
			]
		}
	}
}
</script>
