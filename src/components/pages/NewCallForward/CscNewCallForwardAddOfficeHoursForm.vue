<template>
    <q-list
        class="csc-form"
    >
        <q-list>
            <q-item
                class="justify-center text-bold"
            >
                {{ $t('Office hours') }}
            </q-item>
            <q-item
                class="justify-center"
            >
                <q-checkbox
                    v-model="checkOfficeHoursForAllDays"
                    :value="sameOfficeHoursForAllDays"
                    :label="$t('Same time for all selected days')"
                    @input="toggleAllDaysSameOfficeHours"
                />
            </q-item>
            <q-item
                v-if="!checkOfficeHoursForAllDays"
                class="justify-center"
            >
                <q-tabs
                    v-model="selectedDay"
                    active-color="primary"
                    dense
                >
                    <q-tab
                        v-for="(dayLetter, index) in $t('M,T,W,T,F,S,S').split(',')"
                        :key="index"
                        :alert="hasOfficeHours(getDayNumber(index))"
                        :name="getDayNumber(index)"
                        class="q-pa-xs"
                    >
                        <q-btn
                            class="weekday-btn"
                            rounded
                            ripple
                        >
                            {{ dayLetter }}
                        </q-btn>
                    </q-tab>
                </q-tabs>
            </q-item>
            <q-item
                v-if="checkOfficeHoursForAllDays"
                class="justify-center"
            >
                <q-btn
                    v-for="(dayLetter, index) in $t('M,T,W,T,F,S,S').split(',')"
                    :key="index"
                    class="weekday-btn q-ma-sm"
                    :class="{ 'day-selected-btn': weekdays.includes(getDayNumber(index))}"
                    rounded
                    @click="toggleWeekday(getDayNumber(index))"
                >
                    {{ dayLetter }}
                </q-btn>
            </q-item>
            <div
                v-for="(time, index) in timeRanges"
                :key="time.wday + '-' + time.hour + '-' + time.minute"
                dense
            >
                <q-item
                    v-if="showTimeslot(time)"
                >
                    <csc-time-range
                        :ref="'officeHours-' + index"
                        :index="getTimeSlotIndex(time, index)"
                        :time="time"
                        mode="edit"
                        @delete-time-range="deleteTimeRange"
                        @add-time-range="editTimeRange"
                    />
                </q-item>
            </div>
            <q-item
                v-show="showNewTimeRangeFields"
                dense
            >
                <csc-time-range
                    mode="add"
                    @add-time-range="addTimeRange"
                />
            </q-item>
            <q-item
                class="justify-center"
            >
                <q-btn
                    flat
                    color="primary"
                    :disabled="checkOfficeHoursForAllDays && weekdays.length < 1"
                    @click="showStaticTimeRangeFields"
                >
                    <q-icon
                        name="add"
                        color="primary"
                        size="24px"
                    />
                    {{ $t('Add time range') }}
                </q-btn>
            </q-item>
        </q-list>
        <q-item
            class="justify-center csc-actions-cont"
        >
            <q-btn
                :disabled="!id"
                flat
                color="red"
                icon="delete"
                @click="showRemoveDialog()"
            >
                {{ $t('Remove') }}
            </q-btn>
            <csc-confirm-dialog
                ref="confirmDeleteTimesetDialog"
                title-icon="delete"
                class="csc-cf-delete-weekdays-btn"
                :title="$t('Delete {name} timeset', {name: 'office hours'})"
                :message="$t('You are about to delete  {name} timeset', {name: 'this'})"
                @confirm="deleteTimeset"
            />
            <q-btn
                flat
                color="default"
                icon="clear"
                @click="cancel()"
            >
                {{ $t('Cancel') }}
            </q-btn>
            <q-btn
                flat
                color="primary"
                icon="done"
                :disabled="timeRanges.length < 1"
                @click="save()"
            >
                {{ $t('Save') }}
            </q-btn>
        </q-item>
    </q-list>
</template>

<script>

import CscConfirmDialog from '../../CscConfirmationDialog'
import CscTimeRange from '../../CscTimeRange'

import _ from 'lodash'

export default {
    name: 'CscNewCallForwardAddOfficeHoursForm',
    components: {
        CscConfirmDialog,
        CscTimeRange
    },
    props: {
        groupName: {
            type: String,
            default: ''
        },
        groupId: {
            type: [String, Number],
            default: null
        },
        id: {
            type: [String, Number],
            default: null
        },
        times: {
            type: Array,
            default: null
        },
        sameOfficeHoursForAllDays: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            timesetId: null,
            timesetName: null,
            weekdays: [],
            timeRanges: [],
            checkOfficeHoursForAllDays: false,
            showNewTimeRangeFields: false,
            selectedDay: '2' // Monday default
        }
    },
    mounted () {
        this.timesetName = 'timeset-' + this.groupId
        this.timeSetId = this.id
        if (this.times) {
            this.weekdays = this.times.map(time => time.wday)
            this.timeRanges = this.times
            this.checkOfficeHoursForAllDays = this.sameOfficeHoursForAllDays
        }
    },
    methods: {
        async save () {
            const forwardGroupId = this.groupId
            this.$store.dispatch('newCallForward/addGroupLoader', forwardGroupId)
            try {
                if (this.checkOfficeHoursForAllDays && this.weekdays.length < 1) {
                    this.deleteTimeset()
                } else {
                    if (this.id) {
                        this.timeSetId = this.id
                    } else {
                        this.timeSetId = await this.$store.dispatch('newCallForward/createTimeSet', this.timesetName)
                    }
                    await this.$store.dispatch('newCallForward/addTimesetToGroup', {
                        name: this.groupName,
                        groupId: this.groupId,
                        timeSetId: this.timeSetId
                    })
                    const updatedTimeset = await this.$store.dispatch('newCallForward/addTimeToTimeset', {
                        id: this.timeSetId,
                        time: this.timeRanges
                    })
                    this.$store.dispatch('newCallForward/setTimeset', updatedTimeset)
                }
            } catch (err) {
                console.log(err)
            }
            this.close()
            this.$store.dispatch('newCallForward/removeGroupLoader', forwardGroupId)
        },
        cancel () {
            this.weekdays = []
            if (this.days) {
                for (const day of this.days) {
                    this.weekdays.push(day.wday)
                }
            }
            this.close()
        },
        close () {
            this.$emit('close')
        },
        showRemoveDialog () {
            this.$refs.confirmDeleteTimesetDialog.open()
        },
        toggleWeekday (weekday) {
            if (this.weekdays.includes(weekday)) {
                this.weekdays = this.weekdays.filter(item => item !== weekday)
                this.removeDayFromTimerange(weekday)
            } else {
                this.weekdays.push(weekday)
                this.addDayToTimerange(weekday)
            }
            this.weekdays.sort((a, b) => (parseInt(a) - parseInt(b)))
        },
        async deleteTimeset () {
            this.$store.dispatch('newCallForward/addGroupLoader', this.groupId)
            try {
                await this.$store.dispatch('newCallForward/deleteTimeset', this.timeSetId)
            } catch (error) {
                console.log(error)
            }
            this.$store.dispatch('newCallForward/loadMappings')
            this.$store.dispatch('newCallForward/removeGroupLoader', this.groupId)
        },
        toggleAllDaysSameOfficeHours () {
            this.weekdays = []
            this.timeRanges = []
            this.showNewTimeRangeFields = false
        },
        showStaticTimeRangeFields () {
            this.showNewTimeRangeFields = true
        },
        editTimeRange (data) {
            if (data.from && data.to) {
                const timeFrom = data.from.split(':')
                const timeTo = data.to.split(':')
                const editedTimes = []
                const timeRangesGroupByWeekday = _.groupBy(_.cloneDeep(this.timeRanges), 'wday')
                if (this.checkOfficeHoursForAllDays) {
                    for (const wday in timeRangesGroupByWeekday) {
                        const time = timeRangesGroupByWeekday[wday][data.index]
                        time.hour = timeFrom[0] + '-' + timeTo[0]
                        time.minute = timeFrom[1] + '-' + timeTo[1]
                        editedTimes.push(...timeRangesGroupByWeekday[wday])
                    }
                } else {
                    const time = timeRangesGroupByWeekday[this.selectedDay][data.index]
                    time.hour = timeFrom[0] + '-' + timeTo[0]
                    time.minute = timeFrom[1] + '-' + timeTo[1]
                    for (const wday in timeRangesGroupByWeekday) {
                        editedTimes.push(...timeRangesGroupByWeekday[wday])
                    }
                }
                this.timeRanges = editedTimes
            }
        },
        addTimeRange (data) {
            if (data.from && data.to) {
                const timeFrom = data.from.split(':')
                const timeTo = data.to.split(':')
                if (this.checkOfficeHoursForAllDays) {
                    for (const weekday of this.weekdays) {
                        this.timeRanges.push({
                            wday: weekday,
                            hour: timeFrom[0] + '-' + timeTo[0],
                            minute: timeFrom[1] + '-' + timeTo[1]
                        })
                    }
                } else {
                    this.timeRanges.push({
                        wday: this.selectedDay,
                        hour: timeFrom[0] + '-' + timeTo[0],
                        minute: timeFrom[1] + '-' + timeTo[1]
                    })
                }
                this.showNewTimeRangeFields = false
            }
        },
        addDayToTimerange (day) {
            if (this.timeRanges.length > 0) {
                const dayRanges = this.timeRanges.filter(time => time.wday === this.timeRanges[0].wday)
                for (const range of dayRanges) {
                    this.timeRanges.push({
                        wday: day,
                        hour: range.hour,
                        minute: range.minute
                    })
                }
            }
        },
        removeDayFromTimerange (day) {
            if (this.timeRanges.length > 1) {
                this.timeRanges = this.timeRanges.filter(time => time.wday !== day)
            }
        },
        findIndexInGroup (data, timeRange) {
            return timeRange.findIndex(time => {
                const [fromHours, fromMinutes] = data.from ? data.from.split(':') : []
                const [toHours, toMinutes] = data.from ? data.to.split(':') : []
                return time.hour === (data.hour ? data.hour : `${fromHours}-${toHours}`) &&
                    time.minute === (data.minute ? data.minute : `${fromMinutes}-${toMinutes}`)
            })
        },
        deleteTimeRange (data) {
            const editedTimes = []
            const timeToDelete = this.timeRanges[data.index]
            const timeRangesGroupByWeekday = _.groupBy(this.timeRanges, 'wday')
            if (this.checkOfficeHoursForAllDays) {
                const indexInGroup = this.findIndexInGroup(data, timeRangesGroupByWeekday[timeToDelete.wday])
                for (const wday in timeRangesGroupByWeekday) {
                    delete timeRangesGroupByWeekday[wday][indexInGroup]
                    editedTimes.push(...timeRangesGroupByWeekday[wday].filter(el => el !== undefined))
                }
            } else {
                delete timeRangesGroupByWeekday[this.selectedDay][data.index]
                for (const wday in timeRangesGroupByWeekday) {
                    editedTimes.push(...timeRangesGroupByWeekday[wday].filter(el => el !== undefined))
                }
            }
            this.timeRanges = editedTimes
        },
        showTimeslot (time) {
            // in case of same office hours for all days, shows the time slot once;
            // in case of different office hours for different days, shows the time slot
            // if belongs to the selected day
            switch (true) {
            case this.checkOfficeHoursForAllDays:
                return time.wday && time.wday === this.timeRanges[0].wday
            case !this.checkOfficeHoursForAllDays:
                return time.wday && time.wday === this.selectedDay
            default:
                return false
            }
        },
        hasOfficeHours (wday) {
            const timeRangesGroupByWeekday = _.groupBy(this.timeRanges, 'wday')
            return timeRangesGroupByWeekday[wday] && timeRangesGroupByWeekday[wday].length > 0 ? 'primary' : false
        },
        getTimeSlotIndex (time, index) {
            if (this.checkOfficeHoursForAllDays) {
                return index
            }
            const timeRangesGroupByWeekday = _.groupBy(this.timeRanges, 'wday')
            return this.findIndexInGroup(time, timeRangesGroupByWeekday[time.wday])
        },
        getDayNumber (index) {
            return index === 7 ? '1' : String(index + 2)
        }
    }
}
</script>
<style lang="stylus" rel="stylesheet/stylus">
  .weekday-btn
      background $main-menu-item-hover-background
      width 35px
    .day-selected-btn
            background $primary
</style>
