<template>
	<q-popup-proxy
		ref="popup"
		persistent
		anchor="bottom middle"
		self="top middle"
		@before-show="beforeShow"
	>
		<csc-cf-group-condition-office-hours
			:mapping="mapping"
			:destination-set="destinationSet"
			:source-set="sourceSet"
			:time-set="timeSet"
			:delete-button="true"
			@close="closePopup"
		/>
	</q-popup-proxy>
</template>

<script>
import CscCfGroupConditionOfficeHours from 'components/call-forwarding/CscCfGroupConditionOfficeHours'
export default {
	name: 'CscCfConditionPopupOfficeHours',
	components: {
		CscCfGroupConditionOfficeHours
	},
	props: {
		mapping: {
			type: Object,
			required: true
		},
		destinationSet: {
			type: Object,
			required: true
		},
		sourceSet: {
			type: Object,
			default: undefined
		},
		timeSet: {
			type: Object,
			default: undefined
		}
	},
	methods: {
		beforeShow () {
			this.closed = false
		},
		closePopup () {
			this.closed = true
			this.$refs.popup.hide()
		}
	}
}
</script>
