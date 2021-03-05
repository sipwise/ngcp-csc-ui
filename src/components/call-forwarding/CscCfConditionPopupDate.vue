<template>
    <csc-cf-condition-popup
        ref="popup"
    >
        <csc-cf-group-condition-date
            :mapping="mapping"
            :destination-set="destinationSet"
            :source-set="sourceSet"
            :time-set="timeSet"
            :delete-button="true"
            @close="closePopup"
        />
    </csc-cf-condition-popup>
</template>

<script>
import CscCfGroupConditionDate from 'components/call-forwarding/CscCfGroupConditionDate'
import CscCfConditionPopup from 'components/call-forwarding/CscCfConditionPopup'
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
        }
    },
    methods: {
        closePopup () {
            this.$refs.popup.close()
        }
    }
}
</script>
