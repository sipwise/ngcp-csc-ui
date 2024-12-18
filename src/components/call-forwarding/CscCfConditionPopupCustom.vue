<template>
    <csc-cf-condition-popup
        ref="popup"
    >
        <csc-cf-group-condition-custom
            :times="times"
            @close="closePopup"
        />
    </csc-cf-condition-popup>
</template>

<script>
import CscCfConditionPopup from 'components/call-forwarding/CscCfConditionPopup'
import CscCfGroupConditionCustom from 'components/call-forwarding/CscCfGroupConditionCustom'
export default {
    name: 'CscCfConditionPopupCustom',
    components: {
        CscCfConditionPopup,
        CscCfGroupConditionCustom
    },
    props: {
        times: {
            type: Object,
            required: true
        }
    },
    methods: {
        closePopup () {
            this.$refs.popup.close()
        }
    }
}
</script>
