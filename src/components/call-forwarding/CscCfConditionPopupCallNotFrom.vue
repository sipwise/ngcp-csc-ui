<template>
	<csc-cf-condition-popup
		ref="popup"
	>
		<csc-cf-group-condition-source-set-create
			v-if="internalStep === 'call-not-from'"
			mode="blacklist"
			:title="$t('call not from ...')"
			icon="person_add_disabled"
			:back-button="false"
			:delete-button="true"
			:unassign-button="true"
			:mapping="mapping"
			:destination-set="destinationSet"
			:source-set="sourceSet"
			:time-set="timeSet"
			@select="internalStep='call-not-from-select'"
			@close="closePopup"
		/>
		<csc-cf-group-condition-source-set-select
			v-if="internalStep === 'call-not-from-select'"
			mode="blacklist"
			:title="$t('call not from ...')"
			icon="person_add_disabled"
			:create-label="$t('Edit List')"
			:back-button="true"
			:mapping="mapping"
			:destination-set="destinationSet"
			:source-set="sourceSet"
			:time-set="timeSet"
			@back="internalStep='call-not-from'"
			@create="internalStep='call-not-from'"
			@close="closePopup"
		/>
	</csc-cf-condition-popup>
</template>

<script>
import CscCfGroupConditionSourceSetCreate from 'components/call-forwarding/CscCfGroupConditionSourceSetCreate'
import CscCfGroupConditionSourceSetSelect from 'components/call-forwarding/CscCfGroupConditionSourceSetSelect'
import CscCfConditionPopup from 'components/call-forwarding/CscCfConditionPopup'
export default {
	name: 'CscCfConditionPopupCallNotFrom',
	components: {
		CscCfConditionPopup,
		CscCfGroupConditionSourceSetSelect,
		CscCfGroupConditionSourceSetCreate
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
	data () {
		return {
			internalStep: 'call-not-from',
			selectedSourceSet: null
		}
	},
	watch: {
		internalStep () {
			this.$refs.popup.reOpen()
		}
	},
	methods: {
		closePopup () {
			this.internalStep = 'call-not-from'
			this.$refs.popup.close()
		}
	}
}
</script>
