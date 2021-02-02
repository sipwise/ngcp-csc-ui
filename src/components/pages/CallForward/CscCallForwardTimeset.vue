<template>
    <div>
        <div v-if="showSections">
            <csc-call-forward-times
                ref="times"
                :times="timesetTimesTranslatedWeekday"
                :timesetName="timesetName"
                :active-time-form="activeTimeForm"
                :timeset-times-loaded="timesetTimesLoaded"
                @enable-add-form="enableTimesAddForm"
                @delete-time="deleteTimeDialog"
                @delete-last-time="deleteLastTimeDialog"
            />
            <csc-sourcesets
                v-if="destinationsLoaded"
                :sourcesets="sourcesets"
                :destinations="destinations"
                :timesetName="timesetName"
                ref="sourcesets"
            />
        </div>
        <q-card flat>
            <div v-if="timesetHasDuplicate">
                <q-alert
                    color="red"
                    v-model="showAlertDuplicate"
                    icon="date_range"
                    :actions="[{ label: labelReset, handler: resetTimeset }]"
                    appear
                >
                    {{ $t('pages.callForward.times.timesetDuplicate', { timeset: timesetName }) }}
                </q-alert>
            </div>
            <div v-else-if="!timesetIsCompatible">
                <q-alert
                    color="red"
                    v-model="showAlertCompatible"
                    icon="date_range"
                    :actions="[{ label: labelReset, handler: resetTimeset }]"
                    appear
                >
                    {{ $t('pages.callForward.times.timesetIncompatible', { timeset: timesetName }) }}
                </q-alert>
            </div>
            <div v-else-if="timesetHasReverse">
                <q-alert
                    color="red"
                    v-model="showAlertReverse"
                    icon="date_range"
                    :actions="[{ label: labelReset, handler: resetTimeset }]"
                    appear
                >
                    {{ $t('pages.callForward.times.timesetReverse', { timeset: timesetName }) }}
                </q-alert>
            </div>
            <div v-show="showDefinedAlert">
                <q-alert
                    color="warning"
                    v-model="showAlertDefined"
                    icon="date_range"
                    :actions="[{ label: labelAdd, handler: addTimeset }]"
                    appear
                >
                    {{ $t('pages.callForward.times.timesetNotDefined', { timeset: timesetName }) }}
                </q-alert>
            </div>
            <csc-add-time-form
                v-if="showTimesetForm"
                type="new"
                :timeset="timesetName"
                ref="addTimeNew"
            />
        </q-card>
        <csc-remove-dialog
            ref="removeTimeDialog"
            :title="$t('pages.callForward.times.removeDialogTitle')"
            titleIcon="delete"
            :message="deleteTimeMessage"
            @remove="deleteTime"
        />
        <csc-remove-dialog
            ref="removeLastTimeDialog"
            :title="$t('pages.callForward.times.removeDialogTitle')"
            titleIcon="delete_forever"
            :message="$t('pages.callForward.times.removeLastDialogText')"
            @remove="deleteLastTime"
        />
    </div>
</template>

<script>
    import {
        mapGetters
    } from 'vuex'
    import {
        startLoading,
        stopLoading,
        showGlobalError,
        showToast
    } from '../../../helpers/ui'
    import CscCallForwardDestinations from './CscCallForwardDestinations'
    import CscCallForwardTimes from './CscCallForwardTimes'
    import CscAddTimeForm from './CscAddTimeForm'
    import CscSourcesets from './CscSourcesets'
    import CscRemoveDialog from '../../CscRemoveDialog'
    import {
        QAlert,
        QCard
    } from 'quasar-framework'

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
                showAlertDefined: true,
                deleteTimeData: null
            }
        },
        components: {
            CscCallForwardDestinations,
            CscCallForwardTimes,
            CscAddTimeForm,
            CscSourcesets,
            QAlert,
            QCard,
            CscRemoveDialog
        },
        created() {
            this.loadAll();
        },
        computed: {
            ...mapGetters('callForward', [
                'destinations',
                'timesetTimesTranslatedWeekday',
                'resetTimeState',
                'addTimeState',
                'timesetHasDuplicate',
                'timesetIsCompatible',
                'timesetHasReverse',
                'timesetExists',
                'activeTimeForm',
                'sourcesets',
                'loadDestinationState',
                'addSourcesetState',
                'resetTimeError',
                'addTimeError',
                'showDefinedAlert',
                'destinationsLoaded',
                'showTimesAndDestinations',
                'loadDestinationError',
                'addSourcesetError',
                'timesetTimesLoaded'
            ]),
            labelReset() {
                return this.$t('pages.callForward.times.resetTimeset', {
                    timeset: this.timesetName
                });
            },
            labelAdd() {
                return this.$t('pages.callForward.times.addTimeset', {
                    timeset: this.timesetName
                });
            },
            showTimesetForm() {
                return this.activeTimeForm && !this.timesetExists && this.timesetTimesLoaded;
            },
            showSections() {
                return this.showTimesAndDestinations && this.timesetTimesLoaded;
            },
            deleteTimeMessage() {
                if(this.deleteTimeData !== null) {
                    return this.$t('pages.callForward.times.removeDialogText', {
                        day: this.deleteTimeData.removedDay
                    });
                }
                else {
                    return '';
                }
            }
        },
        methods: {
            resetTimeset() {
                this.$store.dispatch('callForward/resetTimesetByName', this.timesetName);
            },
            addTimeset() {
                this.$store.commit('callForward/setActiveTimeForm', true);
            },
            loadSourcesets() {
                this.$store.dispatch('callForward/loadSourcesets');
            },
            loadDestinations() {
                this.$store.dispatch('callForward/loadDestinations', {
                    timeset: this.timesetName
                });
            },
            loadTimes() {
                this.$store.dispatch('callForward/loadTimesetTimes', {
                    timeset: this.timesetName
                });
                this.resetAlerts();
            },
            loadAll() {
                this.$store.commit('callForward/resetTimesetState');
                this.loadTimes();
                this.loadDestinations();
                this.loadSourcesets();
            },
            resetAlerts() {
                this.showAlertDuplicate = true;
                this.showAlertCompatible = true;
                this.showAlertReverse = true;
                this.showAlertDefined = true;
            },
            enableTimesAddForm() {
                this.$store.commit('callForward/setActiveTimeForm', true);
            },
            deleteTimeDialog(data) {
                this.deleteTimeData = data;
                this.$refs.removeTimeDialog.open();
            },
            deleteTime() {
                this.$store.dispatch('callForward/deleteTimeFromTimeset', this.deleteTimeData);
                this.deleteTimeData = null;
            },
            deleteLastTimeDialog() {
                this.$refs.removeLastTimeDialog.open();
            },
            deleteLastTime() {
                this.$store.dispatch('callForward/deleteTimesetById');
            }
        },
        watch: {
            '$route': {
                handler: 'loadAll'
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
            },
            loadDestinationState(state) {
                if (state === 'requesting') {
                    startLoading();
                }
                else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.loadDestinationError);
                }
                else if (state === 'succeeded') {
                    stopLoading();
                }
            },
            addSourcesetState(state) {
                if (state === 'requesting') {
                    startLoading();
                }
                else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.addSourcesetError);
                }
                else if (state === 'succeeded') {
                    stopLoading();
                    this.$refs.sourcesets.resetForm();
                    showToast(this.$t('pages.callForward.sources.addSuccessMessage', {
                        sourceset: this.lastAddedSourceset
                    }));
                    this.loadDestinations();
                    this.loadSourcesets();
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
