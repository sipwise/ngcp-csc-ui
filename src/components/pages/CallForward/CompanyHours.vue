<template>
    <csc-page :title="$t('pages.callForward.titles.companyHours')">
        <div v-if="timesetIsCompatible && !timesetHasReverse && !timesetHasDuplicate && timesetExists">
            <csc-call-forward-times :times="timesetTimes" ref="times"></csc-call-forward-times>
            <csc-call-forward-destinations timeset="Company Hours" :destinations="destinations" />
        </div>
        <q-card flat>
            <div v-if="timesetHasDuplicate">
                has duple
                <q-alert color="red"
                    v-model="showAlertDuplicate"
                    icon="date_range"
                    :actions="[{ label: $t('pages.callForward.times.resetCompanyHours'), handler: resetCompanyHours }]"
                    appear>
                        {{ $t('pages.callForward.times.companyHoursDuplicate') }}
                </q-alert>
            </div>
            <div v-else-if="!timesetIsCompatible">
                is not comp
                <q-alert color="red"
                    v-model="showAlertCompatible"
                    icon="date_range"
                    :actions="[{ label: $t('pages.callForward.times.resetCompanyHours'), handler: resetCompanyHours }]"
                    appear>
                        {{ $t('pages.callForward.times.companyHoursIncompatible') }}
                </q-alert>
            </div>
            <div v-else-if="timesetHasReverse">
                is reversej
                <q-alert color="red"
                    v-model="showAlertReverse"
                    icon="date_range"
                    :actions="[{ label: $t('pages.callForward.times.resetCompanyHours'), handler: resetCompanyHours }]"
                    appear>
                        {{ $t('pages.callForward.times.companyHoursReverse') }}
                </q-alert>
            </div>
            <div v-else-if="!timesetExists">
                timeset does not exist
                <q-alert color="warning"
                    v-model="showAlertDefined"
                    icon="date_range"
                    :actions="[{ label: $t('pages.callForward.times.addCompanyHours'), handler: addCompanyHours }]"
                    class="timeset-alert"
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
                // These vm values are needed to be able to toggle back
                // q-alert visibility after dismiss/actions. Can not be
                // instantiated with false, and not shared across several
                // q-alerts, so need v-if wrapper to ultimately control
                // visibilty for our use case
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
            ...mapState('callForward', [
                'destinations',
                'timesetTimes',
                'timesetIsCompatible',
                'timesetHasReverse',
                'timesetHasDuplicate',
                'timesetExists',
                'resetTimeState',
                'addTimeState',
                'resetAlerts'
            ]),
            ...mapGetters('callForward', [
                'resetTimeError',
                'addTimeError'
            ])
        },
        methods: {
            resetTimesetAlerts() {
                this.showAlertDuplicate = true;
                this.showAlertCompatible = true;
                this.showAlertReverse = true;
                this.showAlertDefined = true;
            },
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
            }
        },
        watch: {
            resetAlerts() {
                this.resetTimesetAlerts();
            },
            resetTimeState(state) {
                this.resetTimesetAlerts();
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
                this.$store.commit('callForward/setActiveTimeForm', true);
                this.resetTimesetAlerts();
                if (state === 'requesting') {
                    startLoading();
                }
                else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.addTimeError);
                }
                else if (state === 'succeeded') {
                    stopLoading();
                    if (this.$refs.times) {
                        this.$refs.times.resetTimes();
                    }
                    else {
                        this.$refs.addTimeNew.resetTimes();
                    }
					this.$store.commit('callForward/setActiveTimeForm', false);
                    this.loadTimes();
                    showToast(this.$t('pages.callForward.times.addTimeSuccessMessage'));
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
@import '~variables'
    .times-card
        padding 0 15px
        .q-alert-container
            padding 15px 0
</style>
