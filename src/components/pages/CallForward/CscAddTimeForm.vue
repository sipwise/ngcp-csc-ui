<template>
    <div v-if="activeTimeForm" class="add-times">
        <div class="title" v-if="typeIsNew">
            {{ title }}
        </div>
        <div class="row no-wrap">
            <q-field class="col-8">
                <q-select v-model="selectedWeekday"
                    :options="selectOptions" />
            </q-field>
            <q-field class="col-2">
                    <q-datetime
                        color="primary"
                        v-model="timeFromConverted"
                        align="right"
                        type="time"
                        format24h />
            </q-field>
            <q-field class="col-2"
                :error="timeHasError"
                :error-label="$t('pages.callForward.times.selectValidTime')">
                    <q-datetime
                        color="primary"
                        v-model="timeToConverted"
                        align="right"
                        type="time"
                        format24h />
            </q-field>
        </div>
        <q-btn flat dark @click="disableForm()">
            {{ $t('buttons.cancel') }}
        </q-btn>
        <q-btn flat color="primary" icon-right="fa-save" @click="addTime()">
            {{ $t('buttons.save') }}
        </q-btn>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    import { QField, QSelect, QDatetime, QCardTitle,
        QBtn, date } from 'quasar-framework'
    import { showGlobalError } from '../../../helpers/ui'
    export default {
        name: 'csc-add-time-form',
        props: [
            'type',
            'title',
            'timeset'
        ],
        data () {
            return {
                selectOptions: [
                    { label: this.$t('pages.callForward.times.sunday'), value: 1 },
                    { label: this.$t('pages.callForward.times.monday'), value: 2 },
                    { label: this.$t('pages.callForward.times.tuesday'), value: 3 },
                    { label: this.$t('pages.callForward.times.wednesday'), value: 4 },
                    { label: this.$t('pages.callForward.times.thursday'), value: 5 },
                    { label: this.$t('pages.callForward.times.friday'), value: 6 },
                    { label: this.$t('pages.callForward.times.saturday'), value: 7 }
                ],
                selectedWeekday: 1,
                timeTo: '0:00',
                timeFrom: '0:00'
            }
        },
        components: {
            QField,
            QSelect,
            QDatetime,
            QCardTitle,
            QBtn,
            date
        },
        computed: {
            ...mapState('callForward', {
                activeTimeForm: 'activeTimeForm',
                addTimeState: 'addTimeState'
            }),
            typeIsNew() {
                return this.type === 'new';
            },
            timeFromConverted: {
                get() {
                    return date.buildDate({
                        hours: this.timeFrom.split(':')[0],
                        minutes: this.timeFrom.split(':')[1]
                    });
                },
                set(value) {
                    this.timeFrom = date.formatDate(value, 'HH:mm');
                }
            },
            timeToConverted: {
                get() {
                    return date.buildDate({
                        hours: this.timeTo.split(':')[0],
                        minutes: this.timeTo.split(':')[1]
                    });
                },
                set(value) {
                    this.timeTo = date.formatDate(value, 'HH:mm');
                }
            },
            timeHasError() {
                let timeToHour = parseInt(this.timeTo.split(':')[0]);
                let timeFromHour = parseInt(this.timeFrom.split(':')[0]);
                let timeToMinute = parseInt(this.timeTo.split(':')[1]);
                let timeFromMinute = parseInt(this.timeFrom.split(':')[1]);
                let hoursReverse = timeToHour < timeFromHour || (timeToMinute < timeFromMinute && timeToHour === timeFromHour);
                let sameTime = this.timeTo === this.timeFrom;
                return hoursReverse || sameTime;
            }
        },
        methods: {
            resetTimes() {
                this.timeTo = '0:00';
                this.timeFrom = '0:00';
                this.selectedWeekday = 1;
            },
            disableForm() {
                this.resetTimes();
                this.$store.commit('callForward/resetAlerts');
                this.$store.commit('callForward/setActiveTimeForm', false);
            },
            addTime() {
                if (this.type === "new" && !this.timeHasError) {
                    this.$store.dispatch('callForward/createTimesetWithTime', {
                        time: [{ from: this.timeFrom, to: this.timeTo}],
                        weekday: this.selectedWeekday,
                        name: this.timeset
                    });
                }
                else if (this.type === "existing" && !this.timeHasError) {
                    this.$store.dispatch('callForward/appendTimeToTimeset', {
                        time: [{ from: this.timeFrom, to: this.timeTo}],
                        weekday: this.selectedWeekday,
                        name: this.timeset
                    })
                }
                else {
                    showGlobalError(this.$t('pages.callForward.times.selectValidTime'));
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl'

    .add-times
        margin-right 30px
        .title
            color $primary
            line-height $csc-subtitle-line-height
            font-size $csc-subtitle-font-size
            font-weight $csc-subtitle-font-weight
</style>
