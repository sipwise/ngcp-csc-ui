<template>
    <csc-cf-group-condition
        :title="$t('office hours are ...')"
        icon="access_time"
        :loading="$wait.is('csc-cf-time-set-create')"
        v-bind="$attrs"
        @back="back"
        @close="$emit('close')"
    >
        <template
            v-if="invalidTimeset"
        >
            <q-banner
                rounded
                dense
                class="bg-red-8 text-white q-pt-md q-ma-md half-screen-width"
            >
                <template v-slot:avatar>
                    <q-icon name="date_range" />
                </template>
                {{ $t('The "{timeset}" timeset contains incompatible values. You can resolve this by deleting it and recreating from the scratch.', { timeset: timeSet.name }) }}
            </q-banner>
        </template>
        <template
            v-else
        >
            <div
                class="row justify-center q-pt-md"
            >
                <q-checkbox
                    v-model="sameTimes"
                    :label="$t('Same time for selected days')"
                    data-cy="csc-office-hours-sametime"
                    :disable="$v.$invalid"
                />
            </div>
            <div
                class="row q-ma-md"
            >
                <q-item-section>
                    <csc-cf-selection-weekdays
                        v-model="weekdays"
                        :tabs="!sameTimes"
                        :disable="$v.$invalid"
                    />
                </q-item-section>
            </div>
            <q-list
                dense
                class="scroll time-range-list-height"
            >
                <q-item
                    v-for="(v, index) in $v.currentDayTimeRanges.$each.$iter"
                    :key="index"
                >
                    <q-item-section>
                        <csc-input
                            v-model="v.from.$model"
                            dense
                            :label="$t('Start time')"
                            data-cy="csc-office-hours-starttime"
                            mask="##:##"
                            fill-mask
                            :disable="disabled"
                            :error="v.from.$invalid"
                            :error-message="timeValidationErrMsg(v.from)"
                        >
                            <template
                                v-slot:append
                            >
                                <q-btn
                                    icon="access_time"
                                    dense
                                    flat
                                    color="primary"
                                >
                                    <q-popup-proxy
                                        ref="startTimePopup"
                                    >
                                        <q-time
                                            v-model="v.from.$model"
                                            flat
                                            now-btn
                                            square
                                            format24h
                                            text-color="dark"
                                            color="primary"
                                            @input="$refs.startTimePopup[index].hide()"
                                        />
                                    </q-popup-proxy>
                                </q-btn>
                            </template>
                        </csc-input>
                    </q-item-section>
                    <q-item-section>
                        <csc-input
                            v-model="v.to.$model"
                            dense
                            :label="$t('End time')"
                            data-cy="csc-office-hours-endtime"
                            mask="##:##"
                            fill-mask
                            :disable="disabled"
                            :error="v.to.$invalid"
                            :error-message="timeValidationErrMsg(v.to)"
                        >
                            <template
                                v-slot:append
                            >
                                <q-btn
                                    icon="access_time"
                                    dense
                                    flat
                                    color="primary"
                                >
                                    <q-popup-proxy
                                        ref="endTimePopup"
                                    >
                                        <q-time
                                            v-model="v.to.$model"
                                            flat
                                            now-btn
                                            square
                                            format24h
                                            text-color="dark"
                                            color="primary"
                                            @input="$refs.endTimePopup[index].hide()"
                                        />
                                    </q-popup-proxy>
                                </q-btn>
                            </template>
                        </csc-input>
                    </q-item-section>
                    <q-item-section
                        side
                    >
                        <q-btn
                            flat
                            dense
                            color="negative"
                            icon="delete"
                            data-cy="csc-office-hours-delete-timerange"
                            :disable="currentDayTimeRanges.length < 2 || disabled"
                            @click="removeTimeRangeDialog(index)"
                        />
                    </q-item-section>
                </q-item>
            </q-list>
            <div class="row justify-center">
                <q-btn
                    color="primary"
                    icon="add"
                    flat
                    :label="$t('Add time range')"
                    data-cy="csc-office-hours-add-timerange"
                    :disable="disabled"
                    @click="addTimeRange"
                />
            </div>
        </template>
        <template
            v-slot:actions
        >
            <q-btn
                v-if="deleteButton"
                :label="$t('Delete')"
                data-cy="csc-office-hours-delete"
                flat
                color="negative"
                icon="delete"
                :disable="disabled"
                @click="deleteTimeSetEvent"
            />
            <q-btn
                v-if="!invalidTimeset"
                :label="$t('Save')"
                data-cy="csc-office-hours-save"
                flat
                color="primary"
                icon="check"
                :disable="disabled || $v.$invalid"
                @click="createTimeSetOfficeHoursEvent"
            />
        </template>
    </csc-cf-group-condition>
</template>

<script>
import _ from 'lodash'
import CscCfGroupCondition from 'components/call-forwarding/CscCfGroupCondition'
import CscInput from 'components/form/CscInput'
import CscCfSelectionWeekdays from 'components/call-forwarding/CscCfSelectionWeekdays'
import { DEFAULT_WEEKDAYS } from 'src/filters/time-set'
import { mapActions } from 'vuex'
import {
    humanTimesetToKamailio, isTimeStrValid,
    kamailioTimesetToHuman, timeStrToMinutes
} from 'src/helpers/kamailio-timesets-converter'
import { showGlobalError, showGlobalWarning } from 'src/helpers/ui'
import { or } from 'vuelidate/lib/validators'

function isTimeStrEmpty (val) {
    return val === '' || val === '__:__'
}

export default {
    name: 'CscCfGroupConditionOfficeHours',
    components: {
        CscCfSelectionWeekdays,
        CscInput,
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
            invalidTimeset: false,
            sameTimes: true,
            weekdays: DEFAULT_WEEKDAYS,
            timeRangesByDay: this.getInitialTimeRanges(),
            timeRangesForAll: [this.getEmptyTimeRange()]
        }
    },
    validations: {
        currentDayTimeRanges: {
            $each: {
                from: {
                    validTime: or(isTimeStrEmpty, isTimeStrValid),
                    bothFilled: (val, vm) => (isTimeStrEmpty(val) && isTimeStrEmpty(vm.to)) || (!isTimeStrEmpty(val) && !isTimeStrEmpty(vm.to))
                },
                to: {
                    validTime: or(isTimeStrEmpty, isTimeStrValid),
                    notInversed: (val, vm) => isTimeStrEmpty(vm.from) || !isTimeStrValid(vm.from) || isTimeStrEmpty(vm.to) || (isTimeStrValid(vm.to) && timeStrToMinutes(vm.from) <= timeStrToMinutes(vm.to))
                }
            }
        }
    },
    computed: {
        disabled () {
            return this.weekdays.length === 0
        },
        currentDayTimeRanges () {
            if (this.sameTimes) {
                return this.timeRangesForAll
            } else {
                const currentDay = this.weekdays[0]
                return this.timeRangesByDay[currentDay]
            }
        }
    },
    watch: {
        timeSet () {
            this.transformTimeSet()
        },
        sameTimes () {
            if (this.weekdays.length === 0) {
                this.weekdays = DEFAULT_WEEKDAYS
            }
        }
    },
    mounted () {
        this.transformTimeSet()
    },
    methods: {
        ...mapActions('callForwarding', [
            'createOfficeHours',
            'updateOfficeHours',
            'deleteTimeSet'
        ]),
        back () {
            this.$emit('back')
        },
        getEmptyTimeRange () {
            return { from: '', to: '' }
        },
        getInitialTimeRanges () {
            const result = {}
            for (let day = 1; day <= 7; day++) {
                result[day] = [
                    this.getEmptyTimeRange()
                ]
            }
            return result
        },
        reset () {
            this.sameTimes = true
            this.weekdays = DEFAULT_WEEKDAYS
            this.timeRangesByDay = this.getInitialTimeRanges()
            this.timeRangesForAll = [this.getEmptyTimeRange()]
        },
        transformTimeSet () {
            let humanTimeRanges = []
            try {
                humanTimeRanges = kamailioTimesetToHuman(this.timeSet?.times)
            } catch (e) {
                this.reset()
                this.invalidTimeset = true
                console.info(e)
                return
            }

            if (humanTimeRanges.length === 0) {
                this.reset()
            } else {
                this.timeRangesByDay = humanTimeRanges.reduce(
                    (acc, hTimeRangeItem) => {
                        let dayTimeRanges = acc[hTimeRangeItem.weekday]
                        if (dayTimeRanges === undefined) {
                            dayTimeRanges = []
                            acc[hTimeRangeItem.weekday] = dayTimeRanges
                        } else if (dayTimeRanges[0]?.from === '' && dayTimeRanges[0]?.to === '') {
                            dayTimeRanges.shift()
                        }
                        dayTimeRanges.push({
                            from: hTimeRangeItem.from.padStart(5, '0'),
                            to: hTimeRangeItem.to.padStart(5, '0')
                        })
                        return acc
                    },
                    this.getInitialTimeRanges()
                )

                // trying to detect equal set of time ranges for different weekdays.
                const timeRangesMap = {}
                humanTimeRanges.forEach(({ weekday, from, to }) => {
                    const rangeStr = `${from} - ${to}`
                    let mapItem = timeRangesMap[rangeStr]
                    if (!mapItem) {
                        mapItem = new Set()
                        timeRangesMap[rangeStr] = mapItem
                    }
                    mapItem.add(weekday)
                })
                const weekdaysListWithTheSameTimeRanges = [...Object.values(timeRangesMap).reduce(
                    (acc, weekdaysSet) => {
                        const weekdaysStr = [...weekdaysSet.keys()].sort().join()
                        acc.add(weekdaysStr)
                        return acc
                    },
                    new Set()
                )]

                // So, if we have only one weekdays list it means we can set mark "sameTimes" to True
                if (weekdaysListWithTheSameTimeRanges.length === 1) {
                    this.sameTimes = true
                    this.weekdays = weekdaysListWithTheSameTimeRanges[0].split(',').map(day => Number(day))
                    this.timeRangesForAll = _.cloneDeep(this.timeRangesByDay[this.weekdays[0]])
                } else {
                    this.sameTimes = false
                    this.weekdays = humanTimeRanges[0] ? [humanTimeRanges[0].weekday] : DEFAULT_WEEKDAYS
                }
            }
        },
        addTimeRange () {
            this.currentDayTimeRanges.push(this.getEmptyTimeRange())
        },
        removeTimeRangeDialog (index) {
            const timeRange = this.currentDayTimeRanges[index]
            if (isTimeStrEmpty(timeRange.from) && isTimeStrEmpty(timeRange.to)) {
                this.removeTimeRange(index)
            } else {
                this.$q.dialog({
                    title: this.$t('Remove time range'),
                    message: this.$t('You are about to delete time range "{from} - {to}"', timeRange),
                    color: 'negative',
                    cancel: true,
                    persistent: true
                }).onOk(data => {
                    this.removeTimeRange(index)
                })
            }
        },
        removeTimeRange (index) {
            this.currentDayTimeRanges.splice(index, 1)
        },
        timeValidationErrMsg (field) {
            if (!field.validTime) {
                return this.$t('Time is invalid')
            }
            if (field.bothFilled === false) {
                return this.$t('Start and End time should be set')
            }
            if (field.notInversed === false) {
                return this.$t('Start time should be less than End time')
            }
        },
        getDataAsHumanReadableTimeSets () {
            function isTimeRangeFilled ({ from, to }) {
                return typeof from === 'string' && typeof to === 'string' &&
                    isTimeStrValid(from) && isTimeStrValid(to)
            }

            function processTimeRanges (timeRanges, dayNum) {
                return timeRanges
                    .filter(isTimeRangeFilled)
                    .map(timeRange => {
                        return {
                            weekday: dayNum,
                            from: timeRange.from,
                            to: timeRange.to
                        }
                    })
            }

            let hTimeSets = []
            if (this.sameTimes) {
                // duplicating time ranges for each selected day
                hTimeSets = this.weekdays.flatMap(dayNum => {
                    return processTimeRanges(this.timeRangesForAll, dayNum)
                })
            } else {
                hTimeSets = Object.entries(this.timeRangesByDay).flatMap(([day, timeRanges]) => {
                    const dayNum = Number(day)
                    return processTimeRanges(timeRanges, dayNum)
                })
            }
            return hTimeSets
        },
        async createTimeSetOfficeHoursEvent () {
            try {
                const payload = {
                    mapping: this.mapping,
                    subscriberId: this.subscriberId
                }
                if (this.timeSet) {
                    payload.id = this.timeSet.id
                }
                payload.times = humanTimesetToKamailio(this.getDataAsHumanReadableTimeSets())
                if (payload.times.length > 0) {
                    if (this.timeSet) {
                        await this.updateOfficeHours(payload)
                    } else {
                        await this.createOfficeHours(payload)
                    }

                    this.$emit('close')
                } else {
                    showGlobalWarning(this.$t('No data to save. Please provide at least one time range.'))
                }
            } catch (e) {
                showGlobalError(e)
            }
        },
        async deleteTimeSetEvent () {
            try {
                await this.deleteTimeSet({
                    mapping: this.mapping,
                    id: this.timeSet.id,
                    subscriberId: this.subscriberId
                })
            } catch (e) {
                showGlobalError(e)
            }
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>

    .time-range-list-height
        // NOTE: 65vh is a default max-height for q-dialog. Other magic numbers are sum of another elements heights, like headers, buttons etc
        max-height calc(65vh - 250px)

</style>
