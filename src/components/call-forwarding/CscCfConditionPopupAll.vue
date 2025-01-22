<template>
    <csc-cf-condition-popup
        ref="popup"
    >
        <csc-cf-group-condition-menu
            v-if="internalStep === 'menu'"
            :mapping="mapping"
            :b-number-set="bNumberSet"
            :destination-set="destinationSet"
            :source-set="sourceSet"
            :time-set="timeSet"
            @step="internalStep=$event"
            @close="closePopup"
        />
        <csc-cf-group-condition-b-number-set-create
            v-if="internalStep === 'call-to'"
            mode="whitelist"
            :title="$t('call to ...')"
            icon="person_add"
            :back-button="true"
            :mapping="mapping"
            :b-number-set="bNumberSet"
            :subscriber-id="subscriberId"
            @back="internalStep='menu'"
            @select="internalStep='call-to-select'"
            @close="closePopup"
        />
        <csc-cf-group-condition-b-number-set-select
            v-if="internalStep === 'call-to-select'"
            mode="whitelist"
            :title="$t('call to ...')"
            icon="person_add"
            :create-label="$t('Create List')"
            :back-button="true"
            :mapping="mapping"
            :b-number-set="bNumberSet"
            :subscriber-id="subscriberId"
            @back="internalStep='call-to'"
            @create="internalStep='call-to'"
            @close="closePopup"
        />
        <csc-cf-group-condition-b-number-set-create
            v-if="internalStep === 'call-not-to'"
            mode="blacklist"
            :title="$t('call not to ...')"
            icon="person_add_disabled"
            :back-button="true"
            :mapping="mapping"
            :b-number-set="bNumberSet"
            :subscriber-id="subscriberId"
            @back="internalStep='menu'"
            @select="internalStep='call-not-to-select'"
            @close="closePopup"
        />
        <csc-cf-group-condition-b-number-set-select
            v-if="internalStep === 'call-not-to-select'"
            mode="blacklist"
            :title="$t('call not to ...')"
            icon="person_add_disabled"
            :create-label="$t('Create List')"
            :back-button="true"
            :mapping="mapping"
            :b-number-set="bNumberSet"
            :subscriber-id="subscriberId"
            @back="internalStep='call-not-to'"
            @create="internalStep='call-not-to'"
            @close="closePopup"
        />
        <csc-cf-group-condition-source-set-create
            v-if="internalStep === 'call-from'"
            mode="whitelist"
            :title="$t('call from ...')"
            icon="person_add"
            :back-button="true"
            :mapping="mapping"
            :destination-set="destinationSet"
            :source-set="sourceSet"
            :time-set="timeSet"
            :subscriber-id="subscriberId"
            @back="internalStep='menu'"
            @select="internalStep='call-from-select'"
            @close="closePopup"
        />
        <csc-cf-group-condition-source-set-select
            v-if="internalStep === 'call-from-select'"
            mode="whitelist"
            :title="$t('call from ...')"
            icon="person_add"
            :create-label="$t('Create List')"
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
        <csc-cf-group-condition-source-set-create
            v-if="internalStep === 'call-not-from'"
            mode="blacklist"
            :title="$t('call not from ...')"
            icon="person_add_disabled"
            :back-button="true"
            :mapping="mapping"
            :destination-set="destinationSet"
            :source-set="sourceSet"
            :time-set="timeSet"
            :subscriber-id="subscriberId"
            @back="internalStep='menu'"
            @select="internalStep='call-not-from-select'"
            @close="closePopup"
        />
        <csc-cf-group-condition-source-set-select
            v-if="internalStep === 'call-not-from-select'"
            mode="blacklist"
            :title="$t('call not from ...')"
            icon="person_add_disabled"
            :create-label="$t('Create List')"
            :back-button="true"
            :mapping="mapping"
            :destination-set="destinationSet"
            :source-set="sourceSet"
            :time-set="timeSet"
            :subscriber-id="subscriberId"
            @back="internalStep='call-not-from'"
            @create="internalStep='call-not-from'"
            @close="closePopup"
        />
        <csc-cf-group-condition-date
            v-if="internalStep === 'date-is'"
            :back-button="true"
            :mapping="mapping"
            :destination-set="destinationSet"
            :source-set="sourceSet"
            :time-set="timeSet"
            :subscriber-id="subscriberId"
            @back="internalStep='menu'"
            @close="closePopup"
        />
        <csc-cf-group-condition-date-range
            v-if="internalStep === 'date-range-is'"
            :back-button="true"
            :mapping="mapping"
            :destination-set="destinationSet"
            :source-set="sourceSet"
            :time-set="timeSet"
            :subscriber-id="subscriberId"
            @back="internalStep='menu'"
            @close="closePopup"
        />
        <csc-cf-group-condition-weekdays
            v-if="internalStep === 'date-weekdays'"
            :back-button="true"
            :mapping="mapping"
            :destination-set="destinationSet"
            :source-set="sourceSet"
            :time-set="timeSet"
            :subscriber-id="subscriberId"
            @back="internalStep='menu'"
            @close="closePopup"
        />
        <csc-cf-group-condition-office-hours
            v-if="internalStep.startsWith('office-hours')"
            :step="internalStep"
            :back-button="true"
            :mapping="mapping"
            :destination-set="destinationSet"
            :source-set="sourceSet"
            :time-set="timeSet"
            :subscriber-id="subscriberId"
            @back="internalStep='menu'"
            @close="closePopup"
        />
    </csc-cf-condition-popup>
</template>

<script>
import CscCfConditionPopup from 'components/call-forwarding/CscCfConditionPopup'
import CscCfGroupConditionBNumberSetCreate from 'components/call-forwarding/CscCfGroupConditionBNumberSetCreate'
import CscCfGroupConditionBNumberSetSelect from 'components/call-forwarding/CscCfGroupConditionBNumberSetSelect'
import CscCfGroupConditionDate from 'components/call-forwarding/CscCfGroupConditionDate'
import CscCfGroupConditionDateRange from 'components/call-forwarding/CscCfGroupConditionDateRange'
import CscCfGroupConditionMenu from 'components/call-forwarding/CscCfGroupConditionMenu'
import CscCfGroupConditionOfficeHours from 'components/call-forwarding/CscCfGroupConditionOfficeHours'
import CscCfGroupConditionSourceSetCreate from 'components/call-forwarding/CscCfGroupConditionSourceSetCreate'
import CscCfGroupConditionSourceSetSelect from 'components/call-forwarding/CscCfGroupConditionSourceSetSelect'
import CscCfGroupConditionWeekdays from 'components/call-forwarding/CscCfGroupConditionWeekdays'
export default {
    name: 'CscCfConditionPopupAll',
    components: {
        CscCfConditionPopup,
        CscCfGroupConditionOfficeHours,
        CscCfGroupConditionWeekdays,
        CscCfGroupConditionDateRange,
        CscCfGroupConditionDate,
        CscCfGroupConditionBNumberSetSelect,
        CscCfGroupConditionBNumberSetCreate,
        CscCfGroupConditionSourceSetSelect,
        CscCfGroupConditionSourceSetCreate,
        CscCfGroupConditionMenu
    },
    props: {
        step: {
            type: String,
            required: true
        },
        mapping: {
            type: Object,
            required: true
        },
        destinationSet: {
            type: Object,
            required: true
        },
        bNumberSet: {
            type: Object,
            default: undefined
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
            internalStep: this.step
        }
    },
    watch: {
        internalStep () {
            this.$refs.popup.reOpen()
        }
    },
    methods: {
        closePopup () {
            this.internalStep = 'menu'
            this.$refs.popup.close()
        }
    }
}
</script>
