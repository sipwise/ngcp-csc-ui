<template>
    <csc-cf-condition-popup
        ref="popup"
    >
        <csc-cf-group-condition-b-number-set-create
            v-if="internalStep === 'call-to'"
            mode="whitelist"
            :title="$t('call to ...')"
            icon="person_add"
            :back-button="false"
            :delete-button="true"
            :unassign-button="true"
            :mapping="mapping"
            :b-number-set="bNumberSet"
            :subscriber-id="subscriberId"
            @select="internalStep='call-to-select'"
            @close="closePopup"
        />
        <csc-cf-group-condition-b-number-set-select
            v-if="internalStep === 'call-to-select'"
            mode="whitelist"
            :title="$t('call to ...')"
            icon="person_add"
            :create-label="$t('Edit List')"
            :back-button="true"
            :mapping="mapping"
            :b-number-set="bNumberSet"
            :subscriber-id="subscriberId"
            @back="internalStep='call-to'"
            @create="internalStep='call-to'"
            @close="closePopup"
        />
    </csc-cf-condition-popup>
</template>

<script>
import CscCfConditionPopup from 'components/call-forwarding/CscCfConditionPopup'
import CscCfGroupConditionBNumberSetCreate from 'components/call-forwarding/CscCfGroupConditionBNumberSetCreate'
import CscCfGroupConditionBNumberSetSelect from 'components/call-forwarding/CscCfGroupConditionBNumberSetSelect'
export default {
    name: 'CscCfConditionPopupCallTo',
    components: {
        CscCfConditionPopup,
        CscCfGroupConditionBNumberSetSelect,
        CscCfGroupConditionBNumberSetCreate
    },
    props: {
        mapping: {
            type: Object,
            required: true
        },
        bNumberSet: {
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
            internalStep: 'call-to',
            selectedBNumberSet: null
        }
    },
    watch: {
        internalStep () {
            this.$refs.popup.reOpen()
        }
    },
    methods: {
        closePopup () {
            this.internalStep = 'call-to'
            this.$refs.popup.close()
        }
    }
}
</script>
