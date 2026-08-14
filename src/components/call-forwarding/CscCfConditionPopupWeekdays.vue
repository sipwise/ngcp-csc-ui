<template>
    <csc-cf-condition-popup
        ref="popup"
    >
        <csc-cf-group-condition-weekdays
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
import CscCfGroupConditionWeekdays from 'components/call-forwarding/CscCfGroupConditionWeekdays'
export default {
    name: 'CscCfConditionPopupWeekdays',
    components: {
        CscCfConditionPopup,
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
