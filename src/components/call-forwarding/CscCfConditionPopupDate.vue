<template>
    <csc-cf-condition-popup
        ref="popup"
    >
        <csc-cf-group-condition-date
            :mapping="mapping"
            :destination-set="destinationSet"
            :source-set="sourceSet"
            :time-set="timeSet"
            :subscriber-id="subscriberId"
            :delete-button="true"
            @close="closePopup"
        />
    </csc-cf-condition-popup>
</template>

<script>
import CscCfConditionPopup from 'components/call-forwarding/CscCfConditionPopup'
import CscCfGroupConditionDate from 'components/call-forwarding/CscCfGroupConditionDate'
export default {
    name: 'CscCfConditionPopupDate',
    components: {
        CscCfConditionPopup,
        CscCfGroupConditionDate
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
