<template>
    <csc-cf-group-condition
        :title="$t('weekdays are ...')"
        icon="calendar_today"
        :loading="$wait.is('csc-cf-time-set-create')"
        v-bind="$attrs"
        v-on="$listeners"
    >
        <csc-cf-selection-weekdays
            v-model="selectedWeekdays"
            class="q-pl-md q-pr-md q-pt-sm q-pb-sm"
        />
        <template
            v-slot:actions
        >
            <q-btn
                v-if="deleteButton"
                :label="$t('Delete')"
                data-cy="csc-weekdays-delete"
                flat
                color="negative"
                icon="delete"
                @click="deleteTimeSetEvent"
            />
            <q-btn
                :label="$t('Save')"
                data-cy="csc-weekdays-save"
                flat
                color="primary"
                icon="check"
                :disable="selectedWeekdays && selectedWeekdays.length === 0"
                @click="createTimeSetEvent"
            />
        </template>
    </csc-cf-group-condition>
</template>
<script>
import CscCfGroupCondition from 'components/call-forwarding/CscCfGroupCondition'
import { mapActions } from 'vuex'
import CscCfSelectionWeekdays from 'components/call-forwarding/CscCfSelectionWeekdays'
export default {
    name: 'CscCfGroupConditionWeekdays',
    components: {
        CscCfSelectionWeekdays,
        CscCfGroupCondition
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
        deleteButton: {
            type: Boolean,
            default: false
        },
        subscriberId: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            selectedWeekdays: this.weekdays
        }
    },
    computed: {
        weekdays () {
            const weekdays = []
            if (this.timeSet) {
                this.timeSet.times.forEach((weekday) => {
                    weekdays.push(parseInt(weekday.wday))
                })
            }
            return weekdays
        }
    },
    mounted () {
        this.selectedWeekdays = this.weekdays
    },
    methods: {
        ...mapActions('callForwarding', [
            'createTimeSetWeekdays',
            'updateTimeSetWeekdays',
            'deleteTimeSet'
        ]),
        async createTimeSetEvent () {
            const payload = {
                mapping: this.mapping,
                weekdays: this.selectedWeekdays,
                subscriberId: this.subscriberId
            }
            if (this.timeSet) {
                payload.id = this.timeSet.id
                await this.updateTimeSetWeekdays(payload)
            } else {
                await this.createTimeSetWeekdays(payload)
            }
            this.$emit('close')
        },
        async deleteTimeSetEvent () {
            await this.deleteTimeSet({
                mapping: this.mapping,
                id: this.timeSet.id,
                subscriberId: this.subscriberId
            })
        }
    }
}
</script>
