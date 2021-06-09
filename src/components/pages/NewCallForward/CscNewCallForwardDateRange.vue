<template>
    <div
        class="csc-form"
    >
        <div
            class="csc-cf-daterange-popovers-container"
        >
            <q-popup-proxy
                ref="dayFromProxy"
                class="csc-cf-datetime"
            >
                <q-date
                    ref="dayFrom"
                    v-model="dayFrom"
                    mask="YYYY/MM/DD"
                    :options="minDateFrom"
                    :no-unset="true"
                >
                    <div class="row items-center justify-end q-gutter-sm">
                        <q-btn
                            v-close-popup
                            flat
                            color="primary"
                            icon="done"
                        >
                            {{ $t('Confirm') }}
                        </q-btn>
                    </div>
                </q-date>
            </q-popup-proxy>
            <q-popup-proxy
                ref="dayToProxy"
                class="csc-cf-datetime"
            >
                <q-date
                    ref="dayTo"
                    v-model="dayTo"
                    mask="YYYY/MM/DD"
                    :options="minDateTo"
                    :no-unset="true"
                >
                    <div class="row items-center justify-end q-gutter-sm">
                        <q-btn
                            v-close-popup
                            flat
                            color="primary"
                            icon="done"
                        >
                            {{ $t('Confirm') }}
                        </q-btn>
                    </div>
                </q-date>
            </q-popup-proxy>
            <q-popup-proxy
                ref="hourFromProxy"
                class="csc-cf-datetime"
            >
                <q-time
                    ref="hourFrom"
                    v-model="hourFrom"
                    format24h
                    :no-unset="true"
                >
                    <div class="row items-center justify-end q-gutter-sm">
                        <q-btn
                            v-close-popup
                            flat
                            color="primary"
                            icon="done"
                        >
                            {{ $t('Confirm') }}
                        </q-btn>
                    </div>
                </q-time>
            </q-popup-proxy>
            <q-popup-proxy
                ref="hourToProxy"
                class="csc-cf-datetime"
            >
                <q-time
                    ref="hourTo"
                    v-model="hourTo"
                    format24h
                    :no-unset="true"
                >
                    <div class="row items-center justify-end q-gutter-sm">
                        <q-btn
                            v-close-popup
                            flat
                            color="primary"
                            icon="done"
                        >
                            {{ $t('Confirm') }}
                        </q-btn>
                    </div>
                </q-time>
            </q-popup-proxy>
        </div>
        <div
            class="csc-actions-cont row justify-center"
        >
            <q-input
                v-model="dayFromFormatted"
                :placeholder="$t('Start date')"
                @click="openDayFrom()"
            >
                <template v-slot:append>
                    <q-icon
                        name="today"
                        @click="openDayFrom()"
                    />
                </template>
            </q-input>
            <q-input
                v-model="dayToFormatted"
                :disable="!dayFrom"
                :placeholder="$t('End date')"
                @click="openDayTo()"
            >
                <template v-slot:append>
                    <q-icon
                        name="today"
                        @click="openDayTo()"
                    />
                </template>
            </q-input>
        </div>
        <div
            class="csc-actions-cont row justify-center"
        >
            <q-input
                v-model="hourFromFormatted"
                :disable="!dayFrom"
                :placeholder="$t('Start time')"
                @click="openHourFrom()"
            >
                <template v-slot:append>
                    <q-icon
                        name="access_time"
                        @click="openHourFrom()"
                    />
                </template>
            </q-input>
            <q-input
                v-model="hourToFormatted"
                :placeholder="$t('End time')"
                :disable="!dayTo"
                @click="openHourTo()"
            >
                <template v-slot:append>
                    <q-icon
                        name="access_time"
                        @click="openHourTo()"
                    />
                </template>
            </q-input>
        </div>
        <div
            class="csc-cf-daterange-btn-cont"
        >
            <q-btn
                v-if="!noClear"
                flat
                color="red"
                icon="delete"
                @mousedown.native="showRemoveDateRangeDialog()"
            >
                {{ $t('Remove') }}
                <csc-confirm-dialog
                    ref="confirmDeleteTimesetDialog"
                    title-icon="delete"
                    :title="$t('Delete {name} timeset', {name: groupTimeRange})"
                    :message="$t('You are about to delete  {name} timeset', {name: groupTimeRange})"
                    @confirm="deleteTimeset"
                />
            </q-btn>
            <q-btn
                flat
                color="default"
                icon="clear"
                @click="resetTimeRange(); close()"
            >
                {{ $t('Cancel') }}
            </q-btn>
            <q-btn
                flat
                color="primary"
                icon="done"
                :disable="!isDateReadyForSubmit"
                @click="save();"
            >
                {{ $t('Save') }}
            </q-btn>
        </div>
    </div>
</template>

<script>
import CscConfirmDialog from '../../CscConfirmationDialog'
import {
    date
} from 'quasar'
export default {
    name: 'CscNewCallForwardDateRange',
    components: {
        CscConfirmDialog
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
        groupTimeRange: {
            type: Object,
            default: null
        },
        noClear: {
            type: Boolean,
            default: false
        },
        id: {
            type: String,
            default: null
        }
    },
    data () {
        return {
            timesetId: null,
            timesetName: null,
            today: new Date(),
            dayFrom: '',
            dayTo: '',
            hourFrom: '',
            hourTo: '',
            dayRegExp: /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/i,
            timeRegExp: /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/
        }
    },
    computed: {
        dayFromFormatted () {
            let day = this.dayFrom ? this.dayFrom : ''
            if (day.toString().length > 0 && !day.match(this.dayRegExp)) {
                day = date.formatDate(day, 'DD/MM/YYYY')
            }
            return day
        },
        dayToFormatted () {
            let day = this.dayTo ? this.dayTo : ''
            if (day.toString().length > 0 && !day.match(this.dayRegExp)) {
                day = date.formatDate(day, 'DD/MM/YYYY')
            }
            return day
        },
        hourFromFormatted () {
            let time = this.hourFrom ? this.hourFrom : ''
            if (!time.toString().includes(':')) {
                return ''
            }
            if (time.toString().length > 0 && !time.match(this.timeRegExp)) {
                time = date.formatDate(time, 'hh:mm')
            }
            return time
        },
        hourToFormatted () {
            let time = this.hourTo ? this.hourTo : ''
            if (!time.toString().includes(':')) {
                return ''
            }
            if (time.toString().length > 0 && !time.match(this.timeRegExp)) {
                time = date.formatDate(time, 'hh:mm')
            }
            return time
        },
        isDateReadyForSubmit () {
            if (this.dayFrom !== '' && this.dayTo !== '') {
                const ret = (this.hourFrom !== '' && this.hourTo !== '') || (this.hourFrom === '' && this.hourTo === '')
                return ret
            }
            return false
        }
    },
    mounted () {
        this.setDaysAndTimes()
    },
    methods: {
        openDayFrom () {
            const splitDate = this.dayFromFormatted.split('/')
            this.dayFrom = [splitDate[2], splitDate[1], splitDate[0]].join('/')
            this.$refs.dayFromProxy.show()
        },
        openDayTo () {
            const splitDate = this.dayToFormatted.split('/')
            this.dayTo = [splitDate[2], splitDate[1], splitDate[0]].join('/')
            this.$refs.dayToProxy.show()
        },
        openHourFrom () {
            this.hourFrom = this.hourFromFormatted
            this.$refs.hourFromProxy.show()
        },
        openHourTo () {
            this.hourTo = this.hourToFormatted
            this.$refs.hourToProxy.show()
        },
        formatRange (startDate, endDate, startTime, endTime) {
            startTime = startTime.includes('T') ? date.formatDate(startTime, 'hh:mm') : startTime
            endTime = endTime.includes('T') ? date.formatDate(endTime, 'hh:mm') : endTime
            const getDateObj = date => (([year, month, day]) => ({ day, year, month }))(date.includes('T') ? date.split('T')[0].split('-') : date.includes('/') ? date.split('/') : date.split('-'))
            const getTimeObj = time => (([hour, minute, second]) => ({ hour, minute, second }))(time.split(':'))
            const startDateObj = getDateObj(startDate)
            const endDateObj = getDateObj(endDate)
            const startTimeObj = getTimeObj(startTime)
            const endTimeObj = getTimeObj(endTime)
            return [
                {
                    year: startDateObj.year + '-' + endDateObj.year,
                    month: startDateObj.month + '-' + endDateObj.month,
                    mday: startDateObj.day + '-' + endDateObj.day,
                    hour: startTimeObj.hour && endTimeObj.hour ? startTimeObj.hour + '-' + endTimeObj.hour : null,
                    minute: startTimeObj.minute && endTimeObj.minute ? startTimeObj.minute + '-' + endTimeObj.minute : null
                }
            ]
        },
        async save () {
            this.$store.dispatch('newCallForward/addGroupLoader', this.groupId)
            const datesTimesInRange = this.formatRange(this.dayFrom, this.dayTo, this.hourFrom, this.hourTo)
            if (!this.timesetName) {
                this.timesetName = 'timeset-' + this.groupId
            }
            const timeSetId = await this.$store.dispatch('newCallForward/createTimeSet', this.timesetName)

            await this.$store.dispatch('newCallForward/addTimesetToGroup', {
                name: this.groupName,
                groupId: this.groupId,
                timeSetId: timeSetId
            })
            const updatedTimeset = await this.$store.dispatch('newCallForward/addRangeToTimeset', {
                id: timeSetId,
                times: datesTimesInRange
            })
            this.$store.dispatch('newCallForward/setTimeset', updatedTimeset)
            this.$store.dispatch('newCallForward/removeGroupLoader', this.groupId)
            this.close()
        },
        async deleteTimeset () {
            try {
                this.$store.dispatch('newCallForward/addGroupLoader', this.groupId)
                await this.$store.dispatch('newCallForward/deleteTimeset', this.timesetId)
                this.$store.dispatch('newCallForward/loadMappings')
                this.$store.dispatch('newCallForward/removeGroupLoader', this.groupId)
            } catch (e) {
                console.log(e)
            }
        },
        resetTimeRange () {
            this.dayFrom = ''
            this.dayTo = ''
            this.hourFrom = ''
            this.hourTo = ''
        },
        setDaysAndTimes () {
            if (this.groupTimeRange) {
                this.dayFrom = this.groupTimeRange.dateFrom
                this.dayTo = this.groupTimeRange.dateTo
                this.hourFrom = this.groupTimeRange.dateFrom.includes('T') ? this.groupTimeRange.dateFrom : ''
                this.hourTo = this.groupTimeRange.dateTo.includes('T') ? this.groupTimeRange.dateTo : ''
            } else {
                this.resetTimeRange()
            }
        },
        showRemoveDateRangeDialog () {
            this.$emit('confirm-delete')
        },
        minDateFrom (day) {
            return day >= date.formatDate(new Date(), 'YYYY/MM/DD')
        },
        minDateTo (day) {
            return date.getDateDiff(day, this.dayFrom) > 0
        },
        close () {
            this.$emit('close')
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
        .csc-cf-daterange-btn-cont
            margin-top 10px
            width 100%
            text-align center
        .q-datetime-days div:not(.q-datetime-day-active),
        .q-datetime-dark,
        .q-datetime-range .q-datetime-input .q-input-target,
        .q-datetime-range .q-icon,
        .q-datetime-range .q-if:before,
        .q-item-icon
            color $white !important
        .q-datetime-range.row .q-datetime-range-right,
        .q-datetime-range.row .q-datetime-range-left
            padding-left 20px
        .csc-actions-cont
            .q-input
                margin-left 10px
                margin-right 20px
                max-width 160px

</style>
