<template>
    <div>
        <div v-if="showTimesAndDestinations">
            <csc-call-forward-times :times="timesetTimes" :timesetName="timesetName" ref="times"></csc-call-forward-times>
            <csc-call-forward-destinations :timeset="timesetName" :destinations="destinations" />
        </div>
        <q-card flat>
            <div v-if="timesetHasDuplicate">
                <q-alert color="red"
                    v-model="showAlertDuplicate"
                    icon="date_range"
                    :actions="[{ label: labelReset, handler: resetTimeset }]"
                    appear>
                        {{ $t('pages.callForward.times.timesetDuplicate', { timeset: timesetName }) }}
                </q-alert>
            </div>
            <div v-else-if="!timesetIsCompatible">
                <q-alert color="red"
                    v-model="showAlertCompatible"
                    icon="date_range"
                    :actions="[{ label: labelReset, handler: resetTimeset }]"
                    appear>
                        {{ $t('pages.callForward.times.timesetIncompatible', { timeset: timesetName }) }}
                </q-alert>
            </div>
            <div v-else-if="timesetHasReverse">
                <q-alert color="red"
                    v-model="showAlertReverse"
                    icon="date_range"
                    :actions="[{ label: labelReset, handler: resetTimeset }]"
                    appear>
                        {{ $t('pages.callForward.times.timesetReverse', { timeset: timesetName }) }}
                </q-alert>
            </div>
            <div v-show="showDefinedAlert">
                <q-alert color="warning"
                    v-model="showAlertDefined"
                    icon="date_range"
                    :actions="[{ label: labelAdd, handler: addTimeset }]"
                    appear>
                        {{ $t('pages.callForward.times.timesetNotDefined', { timeset: timesetName }) }}
                </q-alert>
            </div>
            <csc-add-time-form v-if="activeTimeForm" type="new" :title="getAddLabel" :timeset="timesetName" ref="addTimeNew"></csc-add-time-form>
        </q-card>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex'
    import { startLoading, stopLoading,
        showGlobalError, showToast } from '../../../helpers/ui'
    import { QAlert, QCard } from 'quasar-framework'
    import CscCallForwardDestinations from './CscCallForwardDestinations'
    import CscCallForwardTimes from './CscCallForwardTimes'
    import CscAddTimeForm from './CscAddTimeForm'
    export default {
        name: 'csc-call-forward-timeset',
        props: [
            'timesetName'
        ],
        data () {
            return {
                showAlertDuplicate: true,
                showAlertCompatible: true,
                showAlertReverse: true,
                showAlertDefined: true
            }
        },
        components: {
            CscCallForwardDestinations,
            CscCallForwardTimes,
            CscAddTimeForm,
            QAlert,
            QCard
        },
        computed: {
            ...mapState('callForward', [
                'destinations',
                'timesetTimes',
                'resetTimeState',
                'addTimeState',
                'timesetHasDuplicate',
                'timesetIsCompatible',
                'timesetHasReverse',
                'timesetExists',
                'activeTimeForm'
            ]),
            ...mapGetters('callForward', [
                'resetTimeError',
                'addTimeError',
                'showDefinedAlert'
            ]),
            labelReset() {
                if (this.timesetName === 'Company Hours') {
                    return this.$t('pages.callForward.times.resetCompanyHours');
                }
                else if (this.timesetName === 'After Hours') {
                    return this.$t('pages.callForward.times.resetAfterHours');
                }
            },
            labelAdd() {
                if (this.timesetName === 'Company Hours') {
                    return this.$t('pages.callForward.times.addCompanyHours')
                }
                else if (this.timesetName === 'After Hours') {
                    return this.$t('pages.callForward.times.addAfterHours')
                }
            },
            showTimesAndDestinations() {
                return this.timesetIsCompatible &&
                    !this.timesetHasReverse &&
                    !this.timesetHasDuplicate &&
                    this.timesetExists;
            }
        },
        methods: {
            resetTimeset() {
                this.$store.dispatch('callForward/resetTimesetByName', this.timesetName);
            },
            addTimeset() {
                this.$store.commit('callForward/setActiveTimeForm', true);
            },
            loadDestinations() {
                if (this.timesetName === 'Company Hours') {
                    this.$store.dispatch('callForward/loadCompanyHoursEverybodyDestinations');
                }
                else if (this.timesetName === 'After Hours') {
                    this.$store.dispatch('callForward/loadAfterHoursEverybodyDestinations');
                }
            },
            loadTimes() {
                if (this.timesetName === 'Company Hours') {
                    this.$store.dispatch('callForward/loadTimesetTimes', {
                        timeset: 'Company Hours'
                    });
                }
                else if (this.timesetName === 'After Hours') {
                    this.$store.dispatch('callForward/loadTimesetTimes', {
                        timeset: 'After Hours'
                    });
                }
                this.resetAlerts();
            },
            loadAll() {
                this.$store.commit('callForward/resetTimesetState');
                this.loadTimes();
                this.loadDestinations();
            },
            resetAlerts() {
                this.showAlertDuplicate = true;
                this.showAlertCompatible = true;
                this.showAlertReverse = true;
                this.showAlertDefined = true;
            }
        },
        watch: {
            '$route': {
                handler: 'loadAll',
                immediate: true
            },
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
                    this.loadDestinations();
                    showToast(this.$t('pages.callForward.times.addTimeSuccessMessage'));
                }
            },
            activeTimeForm(state) {
                if (!state) {
                    this.resetAlerts();
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
