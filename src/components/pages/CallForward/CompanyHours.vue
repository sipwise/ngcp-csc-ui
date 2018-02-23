<template>
    <csc-page :title="$t('pages.callForward.titles.companyHours')">
        <div v-if="timesetIsCompatible && !timesetHasReverse && !timesetHasDuplicate && timesetExists">
            <csc-call-forward-times :times="timesetTimes"></csc-call-forward-times>
            <csc-call-forward-destinations timeset="Company Hours" :destinations="destinations">
            </csc-call-forward-destinations>
        </div>
        <q-card class="times-card">
            <div v-if="timesetHasDuplicate">
                <q-alert color="red"
                    v-model="showAlertDuplicate"
                    icon="date_range"
                    :actions="[{ label: $t('pages.callForward.times.resetCompanyHours'), handler: resetCompanyHours }]"
                    appear>
                        {{ $t('pages.callForward.times.companyHoursDuplicate') }}
                </q-alert>
            </div>
            <div v-if="!timesetIsCompatible">
                <q-alert color="red"
                    v-model="showAlertCompatible"
                    icon="date_range"
                    :actions="[{ label: $t('pages.callForward.times.resetCompanyHours'), handler: resetCompanyHours }]"
                    appear>
                        {{ $t('pages.callForward.times.companyHoursIncompatible') }}
                </q-alert>
            </div>
            <div v-if="timesetHasReverse">
                <q-alert color="red"
                    v-model="showAlertReverse"
                    icon="date_range"
                    :actions="[{ label: $t('pages.callForward.times.resetCompanyHours'), handler: resetCompanyHours }]"
                    appear>
                        {{ $t('pages.callForward.times.companyHoursReverse') }}
                </q-alert>
            </div>
            <div v-if="!timesetExists">
                <q-alert color="warning"
                    v-model="showAlertDefined"
                    icon="date_range"
                    :actions="[{ label: $t('pages.callForward.times.addCompanyHours'), handler: addCompanyHours }]"
                    class="timeset-alert"
                    appear>
                        {{ $t('pages.callForward.times.companyHoursNotDefined') }}
                </q-alert>
            </div>
            <div v-if="addNewTimesetMode" class="times-card">
                <q-card-title class="times-title">
                    Add Company Hours
                </q-card-title>
                <q-card-main>
                    <q-field class="time-field">
                        <div class="row no-wrap">
                            <q-select class="col-8"
                                v-model="selectedWeekday"
                                :options="selectOptions" />
                            <q-datetime
                                class="col-2"
                                color="primary"
                                v-model="timeFromConverted"
                                align="right"
                                type="time"
                                format24h />
                            <q-datetime
                                class="col-2"
                                color="primary"
                                v-model="timeToConverted"
                                align="right"
                                type="time"
                                format24h />
                        </div>
                    </q-field>
                    <q-btn flat dark @click="disableForm()">{{ $t('buttons.cancel') }}</q-btn>
                    <q-btn flat color="primary" icon-right="fa-save" @click="createTimesetWithTime()">{{ $t('buttons.save') }}</q-btn>
                </q-card-main>
            </div>
        </q-card>
    </csc-page>
</template>

<script>
    // TODO: Must be able to add company hours with initial time by choosing exactly the weekday, start time and end time
    // TODO: Must be able to add company hours to existing valid timeset by choosing exactly the weekday, start time and end time
    import { mapState } from 'vuex'
    import { QAlert, QBtn, QCard, QCardTitle, QCardMain, QDatetime,
        QSelect, QField, QInput, date } from 'quasar-framework'
    import CscPage from '../../CscPage'
    import { startLoading, stopLoading,
        showGlobalError, showToast } from '../../../helpers/ui'
    import CscCallForwardDestinations from './CscCallForwardDestinations'
    import CscCallForwardTimes from './CscCallForwardTimes'
    export default {
        data () {
            return {
                addHoursActive: false,
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
                timeFrom: '0:00',
                timeTo: '0:00',
                addNewTimesetMode: false,
                showAlertDuplicate: true,
                showAlertCompatible: true,
                showAlertReverse: true,
                showAlertDefined: true
            }
        },
        components: {
            CscPage,
            CscCallForwardDestinations,
            CscCallForwardTimes,
            QAlert,
            QBtn,
            QCard,
            QCardTitle,
            QCardMain,
            QDatetime,
            QSelect,
            QField,
            QInput,
            date
        },
        created() {
            this.$store.dispatch('callForward/loadCompanyHoursEverybodyDestinations');
            this.$store.dispatch('callForward/loadTimesetTimes', {
                timeset: 'Company Hours'
            });
        },
        computed: {
            ...mapState('callForward', {
                destinations: 'destinations',
                timesetTimes: 'timesetTimes',
                timesetIsCompatible: 'timesetIsCompatible',
                timesetHasReverse: 'timesetHasReverse',
                timesetHasDuplicate: 'timesetHasDuplicate',
                timesetExists: 'timesetExists',
                resetTimeState: 'resetTimeState',
                resetTimeError(state) {
                    return state.resetTimeError ||
                        this.$t('pages.callForward.times.resetErrorMessage');
                },
                addTimesetState: 'addTimesetState',
                addTimesetError(state) {
                    return state.addTimesetError ||
                        this.$t('pages.callForward.times.addTimesetErrorMessage');
                }
            }),
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
            }
        },
        methods: {
            resetCompanyHours() {
                this.$store.dispatch('callForward/resetTimesetByName', 'Company Hours');
            },
            addCompanyHours() {
                this.addNewTimesetMode = true;
                //this.$store.commit('callForward/addHoursStateActive');
            },
            disableForm() {
                // TODO: Improve, or remove cancel button
                this.$store.dispatch('callForward/loadTimesetTimes', {
                    timeset: 'Company Hours'
                });
            },
            createTimesetWithTime() {
                this.$store.dispatch('callForward/createTimesetWithTime', {
                    time: [{ from: this.timeFrom, to: this.timeTo}],
                    weekday: this.selectedWeekday,
                    name: 'Company Hours'
                });
            }
        },
        watch: {
            resetTimeState(state) {
                if (state === 'requesting') {
                    startLoading();
                } else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.resetTimeError);
                } else if (state === 'succeeded') {
                    stopLoading();
                    showToast(this.$t('pages.callForward.times.resetSuccessMessage'));
                    this.$store.dispatch('callForward/loadTimesetTimes', {
                        timeset: 'Company Hours'
                    });
                }
            },
            addTimesetState(state) {
                if (state === 'requesting') {
                    startLoading();
                } else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.addTimesetError);
                } else if (state === 'succeeded') {
                    stopLoading();
                    showToast(this.$t('pages.callForward.times.addTimesetSuccessMessage'));
                    this.$store.dispatch('callForward/loadTimesetTimes', {
                        timeset: 'Company Hours'
                    });
                }
            }
        }
    }
</script>

<style lang="stylus">
@import '~variables'
    .times-card
        padding 0 15px
        .q-alert-container
            padding 15px 0
    .q-field
        margin 5px 0
    .q-card-actions
        padding-top 0
        padding-left 10px
    .q-card-main
        padding-bottom 8px
    .add-time
        margin-left 14px
    .row
        p
            font-size 0.9 rem
            color $secondary
            margin-bottom 0
        .hour-label
            text-align center
</style>
