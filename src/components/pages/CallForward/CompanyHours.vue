<template>
    <csc-page :title="$t('pages.callForward.titles.companyHours')">
        <div v-if="timesetIsCompatible && !timesetHasReverse && !timesetHasDuplicate && timesetExists">
            <csc-call-forward-times :times="timesetTimes" ref="times"></csc-call-forward-times>
            <csc-call-forward-destinations timeset="Company Hours" :destinations="destinations" />
        </div>
        <q-card flat>
            <div v-if="timesetHasDuplicate">
                <q-alert color="red"
                    v-model="showAlertDuplicate"
                    icon="date_range"
                    :actions="[{ label: $t('pages.callForward.times.resetCompanyHours'), handler: resetCompanyHours }]"
                    appear>
                        {{ $t('pages.callForward.times.companyHoursDuplicate') }}
                </q-alert>
            </div>
            <div v-else-if="!timesetIsCompatible">
                <q-alert color="red"
                    v-model="showAlertCompatible"
                    icon="date_range"
                    :actions="[{ label: $t('pages.callForward.times.resetCompanyHours'), handler: resetCompanyHours }]"
                    appear>
                        {{ $t('pages.callForward.times.companyHoursIncompatible') }}
                </q-alert>
            </div>
            <div v-else-if="timesetHasReverse">
                <q-alert color="red"
                    v-model="showAlertReverse"
                    icon="date_range"
                    :actions="[{ label: $t('pages.callForward.times.resetCompanyHours'), handler: resetCompanyHours }]"
                    appear>
                        {{ $t('pages.callForward.times.companyHoursReverse') }}
                </q-alert>
            </div>
            <div v-show="showDefinedAlert">
                <q-alert color="warning"
                    v-model="showAlertDefined"
                    icon="date_range"
                    :actions="[{ label: $t('pages.callForward.times.addCompanyHours'), handler: addCompanyHours }]"
                    appear>
                        {{ $t('pages.callForward.times.companyHoursNotDefined') }}
                </q-alert>
            </div>
            <csc-add-time-form type="new" :title="$t('pages.callForward.times.addCompanyHours')" timeset="Company Hours" ref="addTimeNew"></csc-add-time-form>
        </q-card>
    </csc-page>
</template>

<script>
    import { mapState, mapGetters } from 'vuex'
    import { QAlert, QCard } from 'quasar-framework'
    import CscPage from '../../CscPage'
    import { startLoading, stopLoading,
        showGlobalError, showToast } from '../../../helpers/ui'
    import CscCallForwardDestinations from './CscCallForwardDestinations'
    import CscCallForwardTimes from './CscCallForwardTimes'
    import CscAddTimeForm from './CscAddTimeForm'
    export default {
        data () {
            return {
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
            ...mapState('callForward', [
                'destinations',
                'timesetTimes',
                'resetTimeState',
                'addTimeState',
                'timesetIsCompatible',
                'timesetHasReverse',
                'timesetHasDuplicate',
                'timesetExists'
            ]),
            ...mapGetters('callForward', [
                'resetTimeError',
                'addTimeError',
                'showDefinedAlert'
            ]),

            showAlertDuplicate: {
                get() {
                    return this.$store.state.callForward.showAlerts.duplicate;
                },
                set(value) {
                    return this.$store.commit('callForward/setShowAlertDuplicate', value);
                }
            },
            showAlertCompatible: {
                get() {
                    return this.$store.state.callForward.showAlerts.compatible;
                },
                set(value) {
                    return this.$store.commit('callForward/setShowAlertCompatible', value);
                }
            },
            showAlertReverse: {
                get() {
                    return this.$store.state.callForward.showAlerts.reverse;
                },
                set(value) {
                    return this.$store.commit('callForward/setShowAlertReverse', value);
                }
            },
            showAlertDefined: {
                get() {
                    return this.$store.state.callForward.showAlerts.defined;
                },
                set(value) {
                    return this.$store.commit('callForward/setShowAlertDefined', value);
                }
            }
        },
        methods: {
            resetCompanyHours() {
                this.$store.dispatch('callForward/resetTimesetByName', 'Company Hours');
            },
            addCompanyHours() {
                this.$store.commit('callForward/setActiveTimeForm', true);
            },
            loadTimes() {
                this.$store.dispatch('callForward/loadTimesetTimes', {
                    timeset: 'Company Hours'
                });
                this.$store.commit('callForward/resetAlerts');
            }
        },
        watch: {
            resetTimeState(state) {
                if (state === 'requesting') {
                    startLoading();
                }
                else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.resetTimeError);
                }
                else if (state === 'succeeded') {
                    stopLoading();
                    showToast(this.$t('pages.callForward.times.resetSuccessMessage'));
                    this.loadTimes();
                }
            },
            addTimeState(state) {
                if (state === 'requesting') {
                    this.$store.commit('callForward/setActiveTimeForm', true);
                    startLoading();
                }
                else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.addTimeError);
                }
                else if (state === 'succeeded') {
                    this.$store.commit('callForward/setActiveTimeForm', false);
                    stopLoading();
                    if (this.$refs.times) {
                        this.$refs.times.resetTimes();
                    }
                    else {
                        this.$refs.addTimeNew.resetTimes();
                    }
                    this.loadTimes();
                    showToast(this.$t('pages.callForward.times.addTimeSuccessMessage'));
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl'
    .times-card
        .q-alert-container
            padding 15px 0
</style>
