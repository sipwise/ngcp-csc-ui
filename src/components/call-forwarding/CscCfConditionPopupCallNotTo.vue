<template>
    <csc-cf-condition-popup
        ref="popup"
    >
        <csc-cf-group-condition-b-number-set-create
            v-if="internalStep === 'call-not-to'"
            mode="blacklist"
            :title="$t('call not to ...')"
            icon="person_add_disabled"
            :back-button="false"
            :delete-button="true"
            :unassign-button="true"
            :mapping="mapping"
            :b-number-set="bNumberSet"
            @select="internalStep='call-not-to-select'"
            @close="closePopup"
        />
        <csc-cf-group-condition-b-number-set-select
            v-if="internalStep === 'call-not-to-select'"
            mode="blacklist"
            :title="$t('call not to ...')"
            icon="person_add_disabled"
            :create-label="$t('Edit List')"
            :back-button="true"
            :mapping="mapping"
            :b-number-set="bNumberSet"
            @back="internalStep='call-not-to'"
            @create="internalStep='call-not-to'"
            @close="closePopup"
        />
    </csc-cf-condition-popup>
</template>

<script>
import CscCfConditionPopup from 'components/call-forwarding/CscCfConditionPopup'
import CscCfGroupConditionBNumberSetCreate from 'components/call-forwarding/CscCfGroupConditionBNumberSetCreate'
import CscCfGroupConditionBNumberSetSelect from 'components/call-forwarding/CscCfGroupConditionBNumberSetSelect'
export default {
    name: 'CscCfConditionPopupCallNotTo',
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
        }
    },
    data () {
        return {
            internalStep: 'call-not-to',
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
            this.internalStep = 'call-not-to'
            this.$refs.popup.close()
        }
    }
}
</script>
