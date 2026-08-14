<template>
    <csc-cf-condition-popup
        ref="popup"
    >
        <csc-cf-group-condition-date-range
            :mapping="mapping"
            :destination-set="destinationSet"
            :source-set="sourceSet"
            :time-set="timeSet"
            :delete-button="true"
            :subscriber-id="subscriberId"
            @close="closePopup"
        />
    </csc-cf-condition-popup>
</template>

<script>
import CscCfConditionPopup from 'components/call-forwarding/CscCfConditionPopup'
import CscCfGroupConditionDateRange from 'components/call-forwarding/CscCfGroupConditionDateRange'
export default {
    name: 'CscCfConditionPopupDateRange',
    components: {
        CscCfConditionPopup,
        CscCfGroupConditionDateRange
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
        },
        subscriberId: {
            type: String,
            default: ''
        }
    },
    methods: {
        closePopup () {
            this.$refs.popup.close()
        }
    }
}
</script>
