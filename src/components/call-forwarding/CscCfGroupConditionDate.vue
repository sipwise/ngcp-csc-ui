<template>
    <csc-cf-group-condition
        :title="$t('date is ...')"
        icon="today"
        :loading="$wait.is('csc-cf-time-set-create')"
        v-bind="$attrs"
        v-on="$listeners"
    >
        <q-date
            v-model="selectedDate"
            class="no-margin no-padding"
            flat
            square
            minimal
        />
        <template
            v-slot:actions
        >
            <q-btn
                v-if="deleteButton"
                :label="$t('Delete')"
                flat
                color="negative"
                icon="delete"
                @click="deleteSourceSetEvent"
            />
            <q-btn
                :label="$t('Save')"
                flat
                color="primary"
                icon="check"
                :disable="!selectedDate"
                @click="createTimeSetEvent"
            />
        </template>
    </csc-cf-group-condition>
</template>
<script>
import CscCfGroupCondition from 'components/call-forwarding/CscCfGroupCondition'
import { mapActions } from 'vuex'
import { timeSetDateExact } from 'src/filters/time-set'
export default {
    name: 'CscCfGroupConditionDate',
    components: {
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
        }
    },
    data () {
        return {
            selectedDate: this.formattedDate
        }
    },
    computed: {
        formattedDate () {
            if (this.timeSet) {
                return timeSetDateExact(this.timeSet.times)
            }
            return null
        }
    },
    mounted () {
        this.selectedDate = this.formattedDate
    },
    methods: {
        ...mapActions('callForwarding', [
            'createTimeSetDate',
            'updateTimeSetDate',
            'deleteTimeSet'
        ]),
        async createTimeSetEvent () {
            const dateParts = this.selectedDate.split('/')
            if (this.timeSet) {
                await this.updateTimeSetDate({
                    mapping: this.mapping,
                    id: this.timeSet.id,
                    date: {
                        date: dateParts[2],
                        month: dateParts[1],
                        year: dateParts[0]
                    }
                })
            } else {
                await this.createTimeSetDate({
                    mapping: this.mapping,
                    date: {
                        date: dateParts[2],
                        month: dateParts[1],
                        year: dateParts[0]
                    }
                })
            }
            this.$emit('close')
        },
        async deleteSourceSetEvent () {
            await this.deleteTimeSet({
                mapping: this.mapping,
                id: this.timeSet.id
            })
        }
    }
}
</script>
