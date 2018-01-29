<template>
    <csc-page :title="$t('pages.callForward.titles.always')">
        <q-card class="dest-card">
            <csc-destinations :title="$t('pages.callForward.whenOnline')"
                :group="destinations.online"
                group-name="cfu"
                timeset="null"
                icon="signal_wifi_4_bar">
            </csc-destinations>
            <csc-destinations :title="$t('pages.callForward.whenBusy')"
                :group="destinations.busy"
                group-name="cfb"
                timeset="null"
                icon="record_voice_over">
            </csc-destinations>
            <csc-destinations :title="$t('pages.callForward.whenOffline')"
                :group="destinations.offline"
                group-name="cfna"
                timeset="null"
                icon="signal_wifi_off">
            </csc-destinations>
        </q-card>
    </csc-page>
</template>

<script>
    import numberFormat from '../../../filters/number-format'
    import { mapState } from 'vuex'
    import { startLoading, stopLoading,
        showGlobalError, showToast } from '../../../helpers/ui'
    import CscPage from '../../CscPage'
    import CscDestinations from './CscDestinations'
    import { QCard } from 'quasar-framework'
    export default {
        created() {
            this.$store.dispatch('callForward/loadAlwaysEverybodyDestinations');
        },
        data () {
            return {
            }
        },
        components: {
            QCard,
            CscPage,
            CscDestinations
        },
        computed: {
            ...mapState('callForward', {
                removeDestinationState: 'removeDestinationState',
                addDestinationState: 'addDestinationState',
                changeDestinationState: 'changeDestinationState',
                destinations: 'alwaysEverybodyDestinations',
                lastRemovedDestination: 'lastRemovedDestination',
                lastAddedDestination: 'lastAddedDestination'
            })
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
                    this.$store.dispatch('callForward/loadAlwaysEverybodyDestinations');
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
                    this.$store.dispatch('callForward/loadAlwaysEverybodyDestinations');
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
                    this.$store.dispatch('callForward/loadAlwaysEverybodyDestinations');
                }
            }
        }
    }
</script>

<style lang="stylus">
</style>
