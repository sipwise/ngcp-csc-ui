<template>
    <q-card class="dest-card">
        <csc-destinations :title="$t('pages.callForward.whenOnline')"
            :group="destinations.online"
            group-name="cfu"
            :timeset="timeset"
            icon="signal_wifi_4_bar">
        </csc-destinations>
        <csc-destinations :title="$t('pages.callForward.whenBusy')"
            :group="destinations.busy"
            group-name="cfb"
            :timeset="timeset"
            icon="record_voice_over">
        </csc-destinations>
        <csc-destinations :title="$t('pages.callForward.whenOffline')"
            :group="destinations.offline"
            group-name="cfna"
            :timeset="timeset"
            icon="signal_wifi_off">
        </csc-destinations>
    </q-card>
</template>

<script>
    import numberFormat from '../../../filters/number-format'
    import { mapState } from 'vuex'
    import { startLoading, stopLoading,
        showGlobalError, showToast } from '../../../helpers/ui'
    import CscDestinations from './CscDestinations'
    import { QCard } from 'quasar-framework'
    export default {
        name: 'csc-call-forward-destinations',
        props: [
            'timeset',
            'destinations'
        ],
        data () {
            return {
            }
        },
        components: {
            QCard,
            CscDestinations
        },
        computed: {
            ...mapState('callForward', {
                removeDestinationState: 'removeDestinationState',
                addDestinationState: 'addDestinationState',
                changeDestinationState: 'changeDestinationState',
                lastRemovedDestination: 'lastRemovedDestination',
                lastAddedDestination: 'lastAddedDestination',
                addDestinationError(state) {
                    return state.addDestinationError ||
                        this.$t('pages.callForward.addErrorMessage');
                }
            })
        },
        methods: {
            reload(timeset) {
                if (!timeset) {
                    this.$store.dispatch('callForward/loadAlwaysEverybodyDestinations');
                } else if (timeset === 'Company Hours') {
                    this.$store.dispatch('callForward/loadCompanyHoursEverybodyDestinations');
                } else if (timeset === 'After Hours') {
                    this.$store.dispatch('callForward/loadAfterHoursEverybodyDestinations');
                };
            }
        },
        watch: {
            removeDestinationState(state) {
                if (state === 'requesting') {
                    startLoading();
                } else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.removeDestinationError);
                } else if (state === 'succeeded') {
                    stopLoading();
                    showToast(this.$t('pages.callForward.removeSuccessMessage', {
                        destination: this.lastRemovedDestination
                    }));
                    this.reload(this.timeset);
                }
            },
            addDestinationState(state) {
                if (state === 'requesting') {
                    startLoading();
                } else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.addDestinationError);
                } else if (state === 'succeeded') {
                    stopLoading();
                    showToast(this.$t('pages.callForward.addDestinationSuccessMessage', {
                        destination: this.lastAddedDestination
                    }));
                    this.reload(this.timeset);
                }
            },
            changeDestinationState(state) {
                if (state === 'requesting') {
                    startLoading();
                } else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.changeDestinationError);
                } else if (state === 'succeeded') {
                    stopLoading();
                    this.reload(this.timeset);
                }
            }
        }
    }
</script>

<style lang="stylus">
</style>
