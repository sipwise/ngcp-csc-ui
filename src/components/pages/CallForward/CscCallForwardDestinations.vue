<template>
    <div class="dest-card">
        <csc-destinations :title="$t('pages.callForward.whenOnline')"
            class="csc-destinations"
            :group="destinations.online"
            group-name="cfu"
            :timeset="timeset"
            icon="smartphone" />
        <csc-destinations :title="$t('pages.callForward.whenBusy')"
            class="csc-destinations"
            :group="destinations.busy"
            group-name="cfb"
            :timeset="timeset"
            icon="phonelink_ring" />
        <csc-destinations :title="$t('pages.callForward.whenOffline')"
            class="csc-destinations"
            :group="destinations.offline"
            group-name="cfna"
            :timeset="timeset"
            icon="phonelink_erase" />
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex'
    import { startLoading, stopLoading,
        showGlobalError, showToast } from '../../../helpers/ui'
    import CscDestinations from './CscDestinations'
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
                },
                removeTimeState: 'removeTimeState',
                lastRemovedDay: 'lastRemovedDay',
                removeTimeError(state) {
                    return state.removeTimeError ||
                        this.$t('pages.callForward.times.removeErrorMessage');
                }
            }),
            ...mapGetters('callForward', {
                timesLength: 'getTimesetTimesLength'
            })
        },
        methods: {
            reloadDestinations(timeset) {
                this.$store.dispatch('callForward/loadEverybodyDestinations', {
                    timeset: timeset
                });
            },
            reloadTimes() {
                this.$store.dispatch('callForward/loadTimesetTimes', {
                    timeset: this.timeset
                });
            }
        },
        watch: {
            removeDestinationState(state) {
                if (state === 'requesting') {
                    startLoading();
                }
                else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.removeDestinationError);
                }
                else if (state === 'succeeded') {
                    stopLoading();
                    showToast(this.$t('pages.callForward.removeSuccessMessage', {
                        destination: this.lastRemovedDestination
                    }));
                    this.reloadDestinations(this.timeset);
                }
            },
            addDestinationState(state) {
                if (state === 'requesting') {
                    startLoading();
                }
                else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.addDestinationError);
                }
                else if (state === 'succeeded') {
                    stopLoading();
                    showToast(this.$t('pages.callForward.addDestinationSuccessMessage', {
                        destination: this.lastAddedDestination
                    }));
                    this.reloadDestinations(this.timeset);
                }
            },
            changeDestinationState(state) {
                if (state === 'requesting') {
                    startLoading();
                }
                else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.changeDestinationError);
                }
                else if (state === 'succeeded') {
                    stopLoading();
                    this.reloadDestinations(this.timeset);
                }
            },
            removeTimeState(state) {
                if (state === 'requesting') {
                    startLoading();
                }
                else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.removeTimeError);
                }
                else if (state === 'succeeded') {
                    stopLoading();
                    if (this.timesLength <= 1) {
                        showToast(this.$t('pages.callForward.times.removeTimesetSuccessMessage'));
                    }
                    else {
                        showToast(this.$t('pages.callForward.times.removeSuccessMessage', {
                            day: this.lastRemovedDay
                        }));
                    }
                    this.reloadTimes(this.timeset);
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">

    .dest-card
        max-width 100%
        margin auto
        .csc-destinations
            .dest-icon
                font-size 18px
                margin-bottom 5px 

</style>
