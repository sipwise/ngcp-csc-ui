<template>
	<q-popup-proxy
		ref="popup"
		persistent
		anchor="bottom middle"
		self="top middle"
		@before-show="beforeShow"
	>
		<csc-cf-group-condition-weekdays
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
import CscCfGroupConditionWeekdays from 'components/call-forwarding/CscCfGroupConditionWeekdays'
export default {
	name: 'CscCfConditionPopupWeekdays',
	components: {
		CscCfGroupConditionWeekdays
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
