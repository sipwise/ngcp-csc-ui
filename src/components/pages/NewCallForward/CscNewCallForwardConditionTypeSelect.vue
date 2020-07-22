<template>
    <div
        v-if="enabled"
    >
        <div
            class="csc-cf-dest-type"
            v-if="disableSourcesetMenu"
            @click="addFromCondition()"
        >
            {{ $t('pages.newCallForward.fromLabel') }}
        </div>
        <div
            class="csc-cf-dest-type"
            v-if="disableTimesetMenu"
            @click="addDateIsCondition()"
        >
            {{ $t('pages.newCallForward.dateIsLabel') }}
            <q-popover
                ref="day"
                @open="showQDate()"
                class="csc-cf-calendar-day"
            >
                <q-datetime
                    ref="dayWidget"
                    no-clear
                    v-model="dayModel"
                    :min="today"
                    />
            </q-popover>
        </div>
        <div
            class="csc-cf-dest-type"
            ref="daterangeItem"
            v-if="disableDateRangeMenu"
            @click="addDateRangeCondition()"
        >
            {{ $t('pages.newCallForward.dateRangeLabel') }}
            <q-popover
                ref="daterange"
                class="csc-cf-calendar-day"
            >
                <q-field
                    label="Date range"
                    :labelWidth="11"
                    class="csc-cf-popover-daterange-title"
                />
                <q-field
                  dark
                  :helper="$t('pages.newCallForward.dateRangeDateHelper')"
                >
                    <q-datetime-range
                        ref="dayRangeWidget"
                        type="date"
                        no-clear
                        v-model="rangeDateModel"
                        :min="today"
                        @change="rangeDateChanged()"
                        format="DD/MM/YYYY"
                        :after="[
                            {
                              icon: 'today'
                            }
                          ]"
                        />
                </q-field>
                <q-field
                  dark
                  :helper="$t('pages.newCallForward.dateRangeTimeHelper')"
                >
                    <q-datetime-range
                        ref="dayRangeWidget"
                        type="time"
                        no-clear
                        v-model="rangeTimeModel"
                        @change="rangeTimeChanged()"
                        :after="[
                            {
                              icon: 'access_time'
                            }
                          ]"
                        />
                </q-field>
                <div
                    class="csc-cf-daterange-btn-cont"
                >
                    <q-btn
                        flat
                        color="default"
                        icon="clear"
                        @mousedown.native="reset(); cancel()"
                    >
                        {{ $t('buttons.cancel') }}
                    </q-btn>
                    <q-btn
                        flat
                        color="primary"
                        icon="done"
                        @click="save(); close()"
                        :disable="!allFieldsFilled"
                    >
                        {{ $t('buttons.save') }}
                    </q-btn>
                </div>
            </q-popover>
        </div>
    </div>
</template>

<script>
    import {
        mapGetters,
    } from 'vuex'
    import CscSpinner from '../../CscSpinner'
    import {
        QDatetime,
        QDatetimeRange,
        QPopover,
        QField,
        QBtn,
        date
    } from 'quasar-framework'

    export default {
        name: 'csc-new-call-forward-condition-type-select',
        props: [
            'groupId',
            'groupName',
            'disableSourcesetMenu',
            'disableTimesetMenu',
            'disableDateRangeMenu'
        ],
        components: {
            CscSpinner,
            QDatetimeRange,
            QDatetime,
            QPopover,
            QField,
            QBtn
        },
        data () {
            return {
                enabled: true,
                action: null,
                timesetName: null,
                day: null,
                rangeDateModel: {
                    from: null,
                    to: null
                },
                rangeTimeModel: {
                    from: null,
                    to: null
                },
                today: new Date()
            }
        },
        mounted(){
            this.timesetName = 'timeset-'+this.groupId;
        },
        computed: {
            ...mapGetters('newCallForward', []),
            allFieldsFilled(){
                return this.rangeDateModel.from !== null &&
                       this.rangeDateModel.to !== null &&
                       this.rangeTimeModel.from !== null &&
                       this.rangeTimeModel.to !== null;
            },
            dayModel: {
                get() {
                    return this.day;
                },
                async set(value) {
                    try{
                        this.$store.dispatch('newCallForward/addGroupLoader', this.groupId);
                        const timeSetId = await this.$store.dispatch('newCallForward/createTimeSet', this.timesetName);
                        this.day = {
                            "year": date.formatDate(value, 'YYYY'),
                            "month": date.formatDate(value, 'M'),
                            "mday": date.formatDate(value, 'D')
                        }
                        this.$store.dispatch('newCallForward/addTimesetToGroup', {
                            name: this.groupName,
                            groupId: this.groupId,
                            timeSetId: timeSetId
                        });
                        await this.$store.dispatch('newCallForward/addTimeToTimeset', {
                            id: timeSetId,
                            time: this.day
                        });
                        await this.$store.dispatch('newCallForward/loadTimesets');
                        this.$store.dispatch('newCallForward/removeGroupLoader', this.groupId);

                    }
                    catch(err){
                        console.log(err)
                    }

                }
            }
        },
        methods: {
            addFromCondition(){
                this.action = "addFromCondition";
                this.$parent.close()
            },
            addDateIsCondition(){
                this.action = "addDateIsCondition";
                this.$parent.close()
            },
            addDateRangeCondition(){
                this.action = "addDateRangeCondition";
                this.$parent.close()
            },
            cancel() {
                this.action = null;
                this.enabled = false;
            },
            add() {
                this.enabled = true;
            },
            close() {
                this.action = null;
                this.enabled = false;
            },
            showQDate(){
                this.$refs.dayWidget.open()
            },
            rangeDateChanged(){
                this.$parent.open(); // workaround to keep popver position
                this.$refs.daterangeItem.click();
            },
            rangeTimeChanged(){
                this.$parent.open(); // workaround to keep popver position
                this.$refs.daterangeItem.click();
            },
            reset(){
                this.rangeDateModel = {
                    from: null,
                    to: null
                };
                this.rangeTimeModel = {
                    from: null,
                    to: null
                };
            },
            formatRange(startDate, endDate, startTime, endTime){
                const startDateOnly = startDate.toString().split('T')[0];
                const endDateOnly = endDate.toString().split('T')[0];
                const startTimeOnly = startTime.toString().split('T')[1];
                const endTimeOnly = endTime.toString().split('T')[1];
                const getDateObj = date => (([year, month, day ]) => ({ day, year, month }))(date.split('-'));
                const getTimeObj = time => (([hour, minute, second]) => ({ hour, minute, second }))(time.split(':'));
                const startDateObj = getDateObj(startDateOnly);
                const endDateObj = getDateObj(endDateOnly);
                const startTimeObj = getTimeObj(startTimeOnly);
                const endTimeObj = getTimeObj(endTimeOnly);
                return [
                            {
                                year: startDateObj.year +'-'+endDateObj.year,
                                month: startDateObj.month +'-'+endDateObj.month,
                                mday: startDateObj.day +'-'+endDateObj.day,
                                hour: startTimeObj.hour +'-'+endTimeObj.hour,
                                minute:  startTimeObj.minute +'-'+endTimeObj.minute
                            }
                        ]
            },
            async save(){
                const days = this.rangeDateModel;
                const time = this.rangeTimeModel;
                const datesTimesInRange = this.formatRange(days.from, days.to, time.from, time.to);
                const timeSetId = await this.$store.dispatch('newCallForward/createTimeSet', this.timesetName);
                this.$store.dispatch('newCallForward/addGroupLoader', this.groupId);
                this.$store.dispatch('newCallForward/addTimesetToGroup', {
                    name: this.groupName,
                    groupId: this.groupId,
                    timeSetId: timeSetId
                });
                const updatedTimeset = await this.$store.dispatch('newCallForward/addRangeToTimeset', {
                    id: timeSetId,
                    times: datesTimesInRange
                });
                this.reset();
                this.$store.dispatch('newCallForward/setTimeset', updatedTimeset);
                this.$store.dispatch('newCallForward/removeGroupLoader', this.groupId);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl'
    .csc-cf-dest-type
        min-width 100px
        padding 10px
        cursor pointer
    .csc-cf-dest-type:hover
        background $main-menu-item-hover-background
    .csc-cf-calendar-day
        margin-top -100px !important
        padding 20px
        min-width 400px
    .csc-cf-popover-daterange-title
        text-align center
        margin-left 40px
        .q-field-label-inner
            color $white
            margin-top -25px
            margin-bottom 10px
            font-weight bold
            span
                width 100%
                text-align center
    .q-datetime-weekdays
        color $tertiary
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
    .csc-cf-daterange-btn-cont
        width 100%
        text-align right
</style>
