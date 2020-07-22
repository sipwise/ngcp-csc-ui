<template>
    <div
        v-if="enabled"
        class="csc-form"
    >
        <div
            class="csc-cf-daterange-popovers-container"
        >
            <q-datetime
                class="csc-cf-datetime"
                v-model="dayFrom"
                type="date"
                format="DD/MM/YYYY"
                ref="dayFrom"
                :min="today"
                @blur="openParent()"
            />
            <q-datetime
                class="csc-cf-datetime"
                v-model="dayTo"
                type="date"
                format="DD/MM/YYYY"
                ref="dayTo"
                :min="dayFrom"
                @blur="openParent()"
            />
            <q-datetime
                class="csc-cf-datetime"
                v-model="hourFrom"
                type="time"
                format="HH:MM"
                ref="hourFrom"
                @blur="openParent()"
            />
            <q-datetime
                class="csc-cf-datetime"
                v-model="hourTo"
                type="time"
                format="HH:MM"
                :min="hourFrom"
                ref="hourTo"
                @blur="openParent()"
            />
        </div>
        <div
            class="csc-cf-daterange-fields-cont csc-form-actions row justify-center csc-actions-cont"
        >
            <q-field
                dark
                label="Date range"
                :labelWidth="11"
                class="csc-cf-popover-daterange-title"
            />
        </div>
        <div
            class="csc-cf-daterange-fields-cont csc-form-actions row justify-center csc-actions-cont"
        >
            <q-input
                dark
                v-model="dayFromFormatted"
                @click="openDayFrom()"
                :placeholder="$t('pages.newCallForward.dateRangeStartDate')"
                :after="[
                    {
                      icon: 'today',
                      handler () {
                          openDayFrom();
                      }
                    }
                  ]"
            />
            <q-input
                dark
                v-model="dayToFormatted"
                @click="openDayTo()"
                :placeholder="$t('pages.newCallForward.dateRangeEndDate')"
                :after="[
                    {
                      icon: 'today',
                      handler () {
                          openDayTo();
                      }
                    }
                  ]"
            />
        </div>
        <div
            class="csc-form-actions row justify-center csc-actions-cont"
        >
            <q-input
                dark
                v-model="hourFromFormatted"
                @click="openHourFrom()"
                :placeholder="$t('pages.newCallForward.dateRangeStartTime')"
                :after="[
                    {
                      icon: 'access_time',
                      handler () {
                          openHourFrom();
                      }
                    }
                  ]"
            />
            <q-input
                dark
                v-model="hourToFormatted"
                @click="openHourTo()"
                :placeholder="$t('pages.newCallForward.dateRangeEndTime')"
                :after="[
                    {
                      icon: 'access_time',
                      handler () {
                          openHourTo();
                      }
                    }
                  ]"
            />
        </div>
        <div
            class="csc-cf-daterange-btn-cont"
        >
            <q-btn
                flat
                color="red"
                icon="delete"
                v-if="!noClear"
                @mousedown.native="showRemoveDateRangeDialog()"
            >
                {{ $t('buttons.remove') }}
                <csc-confirm-dialog
                    ref="confirmDeleteTimesetDialog"
                    title-icon="delete"
                    :title="$t('pages.newCallForward.cancelTimesetDialogTitle', {name: this.groupTimeRange})"
                    :message="$t('pages.newCallForward.cancelTimesetText', {name: this.groupTimeRange})"
                    @confirm="deleteTimeset"
                />
            </q-btn>
            <q-btn
                flat
                color="default"
                icon="clear"
                @click="cancelTimerange(); resetTimeRange()"
            >
                {{ $t('buttons.cancel') }}
            </q-btn>
            <q-btn
                flat
                color="primary"
                icon="done"
                @click="save();"
                :disable="!allFieldsFilled"
            >
                {{ $t('buttons.save') }}
            </q-btn>
        </div>
    </div>
</template>

<script>
    import CscConfirmDialog from "../../CscConfirmationDialog";
    import CscSpinner from '../../CscSpinner'
    import {
        QDatetime,
        QField,
        QInput,
        QBtn,
        date
    } from 'quasar-framework'

    export default {
        name: 'csc-new-call-forward-date-range',
        components: {
            CscConfirmDialog,
            CscSpinner,
            QDatetime,
            QField,
            QInput,
            QBtn
        },
        data () {
            return {
                enabled: false,
                timesetId: null,
                timesetName: null,
                dayFrom: null,
                dayTo: null,
                hourFrom: null,
                hourTo: null,
                today: new Date(),
                dayRegExp: /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/i,
                timeRegExp: /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
            }
        },
        props: [
            'groupName',
            'groupId',
            'groupTimeRange',
            'noClear',
            'id'
        ],
        mounted(){
            this.setDaysAndTimes()
        },
        computed: {
            dayFromFormatted(){
                let day = this.dayFrom ? this.dayFrom : '';
                if(day.toString().length > 0 && !day.match(this.dayRegExp)){
                    day = date.formatDate(day, 'DD/MM/YYYY');
                }
                return day;
            },
            dayToFormatted(){
                let day = this.dayTo ? this.dayTo : '';
                if(day.toString().length > 0 && !day.match(this.dayRegExp)){
                    day = date.formatDate(day, 'DD/MM/YYYY');
                }
                return day;
            },
            hourFromFormatted(){
                let time = this.hourFrom ? this.hourFrom : '';
                if(time.toString().length > 0 && !time.match(this.timeRegExp)){
                    time = date.formatDate(time, 'hh:mm');
                }
                return time;
            },
            hourToFormatted(){
                let time = this.hourTo ? this.hourTo : '';
                if(time.toString().length > 0 && !time.match(this.timeRegExp)){
                    time = date.formatDate(time, 'hh:mm');
                }
                return time;
            },
            allFieldsFilled(){
                return this.dayFrom !== null &&
                       this.dayTo !== null &&
                       this.hourFrom !== null &&
                       this.hourTo !== null;
            }
        },
        methods: {
            openParent(){
                this.$emit('open-daterange-popover');
            },
            openDayFrom(){
                this.$refs.dayFrom.open();
            },
            openDayTo(){
                this.$refs.dayTo.open();
            },
            openHourFrom(){
                this.$refs.hourFrom.open();
            },
            openHourTo(){
                this.$refs.hourTo.open();
            },
            cancel(){
                this.close();
            },
            close() {
                this.$parent.close();
                this.enabled = false;
            },
            add() {
                this.enabled = true;
            },
            showRemoveDialog(){
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
                this.$store.dispatch('newCallForward/addGroupLoader', this.groupId);
                const datesTimesInRange = this.formatRange(this.dayFrom, this.dayTo, this.hourFrom, this.hourTo);
                if(!this.timesetName){
                    this.timesetName = 'timeset-' + this.groupId;
                }
                const timeSetId = await this.$store.dispatch('newCallForward/createTimeSet', this.timesetName);

                this.$store.dispatch('newCallForward/addTimesetToGroup', {
                    name: this.groupName,
                    groupId: this.groupId,
                    timeSetId: timeSetId
                });
                const updatedTimeset = await this.$store.dispatch('newCallForward/addRangeToTimeset', {
                    id: timeSetId,
                    times: datesTimesInRange
                });
                this.$store.dispatch('newCallForward/setTimeset', updatedTimeset);
                this.$store.dispatch('newCallForward/removeGroupLoader', this.groupId);
                this.cancelTimerange();
            },
            async deleteTimeset(){
                try{
                    this.$store.dispatch('newCallForward/addGroupLoader', this.groupId);
                    await this.$store.dispatch('newCallForward/deleteTimeset', this.timesetId);
                    this.$store.dispatch('newCallForward/loadMappings');
                    this.$store.dispatch('newCallForward/removeGroupLoader', this.groupId);
                }
                catch(e){
                    console.log(e)
                }
            },
            resetTimeRange(){
                this.dayFrom = null;
                this.dayTo = null;
                this.hourFrom = null;
                this.hourTo = null;
            },
            cancelTimerange() {
                this.$parent.close()
                this.action = null;
                this.enabled = false;
            },
            setDaysAndTimes(){
                if(this.groupTimeRange){
                    this.dayFrom = this.groupTimeRange.dateFrom;
                    this.dayTo = this.groupTimeRange.dateTo;
                    this.hourFrom = this.groupTimeRange.dateFrom;
                    this.hourTo = this.groupTimeRange.dateTo;
                }
                else{
                    this.resetTimeRange();
                }
            },
            showRemoveDateRangeDialog(){
                this.$parent.close();
                this.$emit('confirm-delete');
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl'
    .csc-cf-popover-daterange-title
        text-align center
        width 100%
        margin-left 40px
        margin-top 50px
        margin-bottom -60px
        .q-field-label-inner
            color $white
            margin-top -25px
            margin-bottom 10px
            font-weight bold
            span
                width 100%
                text-align center
    .csc-actions-cont
        margin-bottom 15px
        .q-input
            margin-left 10px
            margin-right 20px
            max-width 160px
    .csc-cf-daterange-fields-cont
        margin-top 73px !important
    .csc-cf-daterange-popovers-container
        width   100%
        height  1px !important
        margin-top -70px !important
        margin-bottom -30px !important
        position relative
    .csc-cf-datetime
        position absolute
        top 0
        left 0
    .csc-cf-daterange-btn-cont
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


</style>
