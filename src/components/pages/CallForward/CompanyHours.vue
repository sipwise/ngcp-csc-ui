<template>
    <csc-page :title="$t('pages.callForward.titles.companyHours')">
        <div v-if="timesetIsCompatible && !timesetHasReverse && !timesetHasDuplicate && timesetExists">
            <csc-call-forward-times :times="timesetTimes"></csc-call-forward-times>
            <csc-call-forward-destinations timeset="Company Hours" :destinations="destinations">
            </csc-call-forward-destinations>
        </div>
        <q-card class="times-card">
                <q-alert color="red"
                    v-model="showAlertOne"
                    icon="date_range"
                    :actions="[{ label: $t('pages.callForward.times.resetCompanyHours'), handler: resetCompanyHours }]"
                    appear>
                        Test with showAlertOne bound
                </q-alert>
                <q-alert color="red"
                    v-model="showAlertTwo"
                    icon="date_range"
                    :actions="[{ label: $t('pages.callForward.times.resetCompanyHours'), handler: resetCompanyHours }]"
                    appear>
                        Test with showAlertTwo bound
                </q-alert>
                <q-alert color="red"
                    v-model="showAlertThree"
                    icon="date_range"
                    :actions="[{ label: $t('pages.callForward.times.resetCompanyHours'), handler: resetCompanyHours }]"
                    appear>
                        Test with showAlertThree bound
                </q-alert>
                <q-btn @click="alertOnOne">ALERT ONE ON</q-btn>
                <q-btn @click="alertOnTwo">ALERT TWO ON</q-btn>
                <q-btn @click="alertOnThree">ALERT THREE ON</q-btn>
                <q-btn @click="alertOffOne">ALERT ONE OFF</q-btn>
                <q-btn @click="alertOffTwo">ALERT TWO OFF</q-btn>
                <q-btn @click="alertOffThree">ALERT THREE OFF</q-btn>
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
                itjtjtj
                <q-alert color="warning"
                    v-model="showAlertDefined"
                    icon="date_range"
                    :actions="[{ label: $t('pages.callForward.times.addCompanyHours'), handler: addCompanyHours }]"
                    class="timeset-alert"
                    appear>
                        {{ $t('pages.callForward.times.companyHoursNotDefined') }}
                </q-alert>
            </div>
            <csc-add-time-form type="new" :title="$t('pages.callForward.times.addCompanyHours')" timeset="Company Hours"></csc-add-time-form>
            <q-btn @click="logDefinedState()">LOG DEFINED STATE</q-btn>
        </q-card>
    </csc-page>
</template>

<script>
    import { mapState } from 'vuex'
    import { QAlert, QCard, QBtn } from 'quasar-framework'
    import CscPage from '../../CscPage'
    import { startLoading, stopLoading,
        showGlobalError, showToast } from '../../../helpers/ui'
    import CscCallForwardDestinations from './CscCallForwardDestinations'
    import CscCallForwardTimes from './CscCallForwardTimes'
    import CscAddTimeForm from './CscAddTimeForm'
    export default {
        data () {
            return {
                showAlertOne: true,
                showAlertTwo: true,
                showAlertThree: true
            }
        },
        components: {
            CscPage,
            CscCallForwardDestinations,
            CscCallForwardTimes,
            CscAddTimeForm,
            QAlert,
            QCard,
            QBtn
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
                addTimeState: 'addTimeState',
                addTimeError(state) {
                    return state.addTimeError ||
                        this.$t('pages.callForward.times.addTimeErrorMessage');
                },
                // TODO: Convert these to computed with get/set, and try again
                showAlertDuplicate: 'showAlertDuplicate',
                showAlertCompatible: 'showAlertCompatible',
                showAlertReverse: 'showAlertReverse'
            }),
            // TODO: Replace dispatch with commit where applicable
            showAlertDefined: {
                get() {
                    return this.$store.state.callForward.showAlertDefined;
                },
                set(value) {
                    this.$store.dispatch('callForward/setShowAlertDefined', value);
                }
            }
        },
        methods: {
            alertOnOne() {
                this.showAlertOne = true;
            },
            alertOnTwo() {
                this.showAlertTwo = true;
            },
            alertOnThree() {
                this.showAlertThree = true;
            },
            alertOffOne() {
                this.showAlertOne = false;
            },
            alertOffTwo() {
                this.showAlertTwo = false;
            },
            alertOffThree() {
                this.showAlertThree = false;
            },
            logDefinedState() {
                console.log('showAlertDefined', this.showAlertDefined);
            },
            resetCompanyHours() {
                this.$store.dispatch('callForward/resetTimesetByName', 'Company Hours');
            },
            addCompanyHours() {
                this.$store.dispatch('callForward/setActiveTimeForm', true);
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
                    //this.$store.dispatch('callForward/setShowAlertDefined', true);
                    showToast(this.$t('pages.callForward.times.resetSuccessMessage'));
                    this.$store.dispatch('callForward/loadTimesetTimes', {
                        timeset: 'Company Hours'
                    });
                }
            },
            addTimeState(state) {
                if (state === 'requesting') {
                    startLoading();
                } else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.addTimeError);
                } else if (state === 'succeeded') {
                    stopLoading();
                    // TODO: Also dispatch in other states?
                    this.$store.dispatch('callForward/setActiveTimeForm', false);
                    showToast(this.$t('pages.callForward.times.addTimeSuccessMessage'));
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
