<template>
    <csc-cf-condition-popup
        ref="popup"
    >
        <csc-cf-group-condition-source-set-create
            v-if="internalStep === 'call-from'"
            mode="whitelist"
            :title="$t('call from ...')"
            icon="person_add"
            :back-button="false"
            :delete-button="true"
            :unassign-button="true"
            :mapping="mapping"
            :destination-set="destinationSet"
            :source-set="sourceSet"
            :time-set="timeSet"
            :subscriber-id="subscriberId"
            @select="internalStep='call-from-select'"
            @close="closePopup"
        />
        <csc-cf-group-condition-source-set-select
            v-if="internalStep === 'call-from-select'"
            mode="whitelist"
            :title="$t('call from ...')"
            icon="person_add"
            :create-label="$t('Edit List')"
            :back-button="true"
            :mapping="mapping"
            :destination-set="destinationSet"
            :source-set="sourceSet"
            :time-set="timeSet"
            :subscriber-id="subscriberId"
            @back="internalStep='call-from'"
            @create="internalStep='call-from'"
            @close="closePopup"
        />
    </csc-cf-condition-popup>
</template>

<script>
import CscCfConditionPopup from 'components/call-forwarding/CscCfConditionPopup'
import CscCfGroupConditionSourceSetCreate from 'components/call-forwarding/CscCfGroupConditionSourceSetCreate'
import CscCfGroupConditionSourceSetSelect from 'components/call-forwarding/CscCfGroupConditionSourceSetSelect'
export default {
    name: 'CscCfConditionPopupCallFrom',
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
        },
        subscriberId: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            internalStep: 'call-from',
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
            this.internalStep = 'call-from'
            this.$refs.popup.close()
        }
    }
}
</script>
