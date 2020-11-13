<template>
	<q-popup-proxy
		ref="popup"
		persistent
		anchor="bottom middle"
		self="top middle"
		@before-show="beforeShow"
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
	</q-popup-proxy>
</template>

<script>
import CscCfGroupConditionSourceSetCreate from 'components/call-forwarding/CscCfGroupConditionSourceSetCreate'
import CscCfGroupConditionSourceSetSelect from 'components/call-forwarding/CscCfGroupConditionSourceSetSelect'
export default {
	name: 'CscCfConditionPopupCallNotFrom',
	components: {
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
			this.internalStep = 'call-not-from'
			this.$refs.popup.hide()
		}
	}
}
</script>
