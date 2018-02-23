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
                q-alert color="warning"
                    v-model="showAlertDefined"
                    icon="date_range"
                    :actions="[{ label: $t('pages.callForward.times.addCompanyHours'), handler: addCompanyHours }]"
                    class="timeset-alert"
                    appear>
                        {{ $t('pages.callForward.times.companyHoursNotDefined') }}
                </q-alert>
            </div>
            <csc-add-time-form type="new" :title="$t('pages.callForward.times.addCompanyHours')" timeset="Company Hours"></csc-add-time-form>
        </q-card>
    </csc-page>
</template>

<script>
    import { mapState } from 'vuex'
    import { QAlert, QCard, QSelect,
        QField, QInput, date } from 'quasar-framework'
    import CscPage from '../../CscPage'
    import { startLoading, stopLoading,
        showGlobalError, showToast } from '../../../helpers/ui'
    import CscCallForwardDestinations from './CscCallForwardDestinations'
    import CscCallForwardTimes from './CscCallForwardTimes'
    import CscAddTimeForm from './CscAddTimeForm'
    export default {
        data () {
            return {
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
            CscAddTimeForm,
            QAlert,
            QCard
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
                },
                activeTimeForm: 'activeTimeForm'
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
            },
            timeHasError() {
                let timeToHour = parseInt(this.timeTo.split(':')[0]);
                let timeFromHour = parseInt(this.timeFrom.split(':')[0]);
                let timeToMinute = parseInt(this.timeTo.split(':')[1]);
                let timeFromMinute = parseInt(this.timeFrom.split(':')[1]);
                let hoursReverse = timeToHour < timeFromHour || timeToMinute < timeFromMinute;
                let sameTime = this.timeTo === this.timeFrom;
                return hoursReverse || sameTime;
            }
        },
        methods: {
            resetCompanyHours() {
                this.$store.dispatch('callForward/resetTimesetByName', 'Company Hours');
            },
            addCompanyHours() {
                this.$store.dispatch('callForward/setActiveTimeForm', true);
            },
            disableForm() {
                this.$store.dispatch('callForward/setActiveTimeForm', false);
                this.showAlertDefined= true;
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
                    this.timeTo = '0:00';
                    this.timeFrom = '0:00';
                    this.$store.dispatch('callForward/setActiveTimeForm', false);
                    this.showAlertDefined= true;
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
</style>
