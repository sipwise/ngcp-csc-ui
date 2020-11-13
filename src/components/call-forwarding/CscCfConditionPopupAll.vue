<template>
	<q-popup-proxy
		ref="popup"
		persistent
		anchor="bottom middle"
		self="top middle"
		@before-show="beforeShow"
	>
		<csc-cf-group-condition-menu
			v-if="internalStep === 'menu'"
			:mapping="mapping"
			:destination-set="destinationSet"
			:source-set="sourceSet"
			:time-set="timeSet"
			@step="internalStep=$event"
			@close="closePopup"
		/>
		<csc-cf-group-condition-source-set-create
			v-if="internalStep === 'call-from'"
			mode="whitelist"
			:title="$t('call from ...')"
			icon="person_add"
			:back-button="true"
			:mapping="mapping"
			:destination-set="destinationSet"
			:source-set="sourceSet"
			:time-set="timeSet"
			@back="internalStep='menu'"
			@select="internalStep='call-from-select'"
			@close="closePopup"
		/>
		<csc-cf-group-condition-source-set-select
			v-if="internalStep === 'call-from-select'"
			mode="whitelist"
			:title="$t('call from ...')"
			icon="person_add"
			:create-label="$t('Create List')"
			:back-button="true"
			:mapping="mapping"
			:destination-set="destinationSet"
			:source-set="sourceSet"
			:time-set="timeSet"
			@back="internalStep='call-from'"
			@create="internalStep='call-from'"
			@close="closePopup"
		/>
		<csc-cf-group-condition-source-set-create
			v-if="internalStep === 'call-not-from'"
			mode="blacklist"
			:title="$t('call not from ...')"
			icon="person_add_disabled"
			:back-button="true"
			:mapping="mapping"
			:destination-set="destinationSet"
			:source-set="sourceSet"
			:time-set="timeSet"
			@back="internalStep='menu'"
			@select="internalStep='call-not-from-select'"
			@close="closePopup"
		/>
		<csc-cf-group-condition-source-set-select
			v-if="internalStep === 'call-not-from-select'"
			mode="blacklist"
			:title="$t('call not from ...')"
			icon="person_add_disabled"
			:create-label="$t('Create List')"
			:back-button="true"
			:mapping="mapping"
			:destination-set="destinationSet"
			:source-set="sourceSet"
			:time-set="timeSet"
			@back="internalStep='call-not-from'"
			@create="internalStep='call-not-from'"
			@close="closePopup"
		/>
		<csc-cf-group-condition-date
			v-if="internalStep === 'date-is'"
			:back-button="true"
			:mapping="mapping"
			:destination-set="destinationSet"
			:source-set="sourceSet"
			:time-set="timeSet"
			@back="internalStep='menu'"
			@close="closePopup"
		/>
		<csc-cf-group-condition-date-range
			v-if="internalStep === 'date-range-is'"
			:back-button="true"
			:mapping="mapping"
			:destination-set="destinationSet"
			:source-set="sourceSet"
			:time-set="timeSet"
			@back="internalStep='menu'"
			@close="closePopup"
		/>
		<csc-cf-group-condition-weekdays
			v-if="internalStep === 'date-weekdays'"
			:back-button="true"
			:mapping="mapping"
			:destination-set="destinationSet"
			:source-set="sourceSet"
			:time-set="timeSet"
			@back="internalStep='menu'"
			@close="closePopup"
		/>
		<csc-cf-group-condition-office-hours
			v-if="internalStep.startsWith('office-hours')"
			:step="internalStep"
			:back-button="true"
			:mapping="mapping"
			:destination-set="destinationSet"
			:source-set="sourceSet"
			:time-set="timeSet"
			@navigate="navigate"
			@back="internalStep='menu'"
			@close="closePopup"
		/>
	</q-popup-proxy>
</template>

<script>
import CscCfGroupConditionMenu from 'components/call-forwarding/CscCfGroupConditionMenu'
import CscCfGroupConditionSourceSetCreate from 'components/call-forwarding/CscCfGroupConditionSourceSetCreate'
import CscCfGroupConditionSourceSetSelect from 'components/call-forwarding/CscCfGroupConditionSourceSetSelect'
import CscCfGroupConditionDate from 'components/call-forwarding/CscCfGroupConditionDate'
import CscCfGroupConditionDateRange from 'components/call-forwarding/CscCfGroupConditionDateRange'
import CscCfGroupConditionWeekdays from 'components/call-forwarding/CscCfGroupConditionWeekdays'
import CscCfGroupConditionOfficeHours from 'components/call-forwarding/CscCfGroupConditionOfficeHours'
export default {
	name: 'CscCfConditionPopupAll',
	components: {
		CscCfGroupConditionOfficeHours,
		CscCfGroupConditionWeekdays,
		CscCfGroupConditionDateRange,
		CscCfGroupConditionDate,
		CscCfGroupConditionSourceSetSelect,
		CscCfGroupConditionSourceSetCreate,
		CscCfGroupConditionMenu
	},
	props: {
		step: {
			type: String,
			required: true
		},
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
	data () {
		return {
			closed: false,
			internalStep: this.step,
			selectedSourceSet: null
		}
	},
	watch: {
		internalStep () {
			if (!this.closed) {
				this.$refs.popup.hide()
				this.$nextTick(() => {
					this.$refs.popup.show()
				})
			}
		}
	},
	methods: {
		beforeShow () {
			this.closed = false
		},
		closePopup () {
			this.closed = true
			this.internalStep = 'menu'
			this.$refs.popup.hide()
		},
		openPopup () {
			if (!this.closed) {
				this.$refs.popup.hide()
				this.$nextTick(() => {
					this.$refs.popup.show()
				})
			}
		},
		navigate (step) {
			this.internalStep = step
			this.openPopup()
		}
	}
}
</script>
