<template>
    <csc-cf-group-condition
        :title="$t('date is ...')"
        icon="today"
        :loading="$wait.is('csc-cf-time-set-create')"
        v-bind="$attrs"
        @close="$emit('close')"
    >
        <q-date
            v-model="selectedDate"
            class="no-margin no-padding"
            flat
            square
            minimal
        />
        <template
            #actions
        >
            <q-btn
                v-if="deleteButton"
                :label="$t('Delete')"
                data-cy="csc-group-date-delete"
                flat
                color="negative"
                icon="delete"
                @click="deleteTimeSetEvent"
            />
            <q-btn
                :label="$t('Save')"
                data-cy="csc-group-date-save"
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
import { mapActions, mapGetters } from 'vuex'
import { timeSetDateExact } from 'src/filters/time-set'
import { showGlobalError } from 'src/helpers/ui'
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
        },
        subscriberId: {
            type: String,
            default: ''
        }
    },
    emits: ['close'],
    data () {
        return {
            selectedDate: null
        }
    },
    computed: {
        ...mapGetters([
            'getCurrentFormattedDateWithSlash'
        ]),
        formattedDate () {
            if (this.timeSet) {
                return timeSetDateExact(this.timeSet.times)
            } else {
                return this.getCurrentFormattedDateWithSlash
            }
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
            try {
                if (this.timeSet) {
                    await this.updateTimeSetDate({
                        mapping: this.mapping,
                        id: this.timeSet.id,
                        subscriberId: this.subscriberId,
                        date: {
                            date: dateParts[2],
                            month: dateParts[1],
                            year: dateParts[0]
                        }
                    })
                } else {
                    await this.createTimeSetDate({
                        mapping: this.mapping,
                        subscriberId: this.subscriberId,
                        date: {
                            date: dateParts[2],
                            month: dateParts[1],
                            year: dateParts[0]
                        }
                    })
                }
            } catch (err) {
                showGlobalError(err?.message || this.$t('Unknown error'))
            }
            this.$emit('close')
        },
        async deleteTimeSetEvent () {
            await this.deleteTimeSet({
                mapping: this.mapping,
                id: this.timeSet.id,
                subscriberId: this.subscriberId
            })

            this.$emit('close')
        }
    }
}
</script>
