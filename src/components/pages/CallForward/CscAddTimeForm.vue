<template>
    <q-item class="csc-add-time-form">
        <q-item-main>
            <q-item-tile class="row no-wrap">
                <q-select
                    class="col"
                    v-model="selectedWeekday"
                    :options="selectOptions" />
                <q-datetime
                    class="col"
                    color="primary"
                    v-model="timeFromConverted"
                    align="right"
                    type="time"
                    format24h />
                <q-datetime
                    class="col"
                    color="primary"
                    v-model="timeToConverted"
                    align="right"
                    type="time"
                    format24h />
            </q-item-tile>
            <q-item-tile>
                <q-btn flat dark @click="disableForm()">
                    {{ $t('buttons.cancel') }}
                </q-btn>
                <q-btn flat color="primary" icon-right="fa-save" @click="addTime()">
                    {{ $t('buttons.save') }}
                </q-btn>
            </q-item-tile>
        </q-item-main>
    </q-item>
</template>

<script>
    import { mapState } from 'vuex'
    import { QField, QSelect, QDatetime, QList, QItem, QItemMain, QItemTile,
        QBtn, date } from 'quasar-framework'
    import { showGlobalError } from '../../../helpers/ui'
    export default {
        name: 'csc-add-time-form',
        props: [
            'type',
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
            QList,
            QItem,
            QItemMain,
            QItemTile,
            QBtn,
            date
        },
        computed: {
            ...mapState('callForward', [
                'addTimeState'
            ]),
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

    .csc-add-time-form
        padding 0
        width calc(100% - 56px)

    @media only screen and (min-width: 320px) {
        .csc-add-time-form {
            width calc(100% - 43px)
        }
    }

    @media only screen and (min-width: 360px) {
        .csc-add-time-form {
            width calc(100% - 50.09px)
        }
    }

    @media only screen and (min-width: 411px) {
        .csc-add-time-form {
            width calc(100% - 56px)
        }
    }

    .add-times
        width 100%
  
</style>
