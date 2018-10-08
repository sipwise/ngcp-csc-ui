<template>
    <div class="dest-card">
        <csc-destinations :title="$t('pages.callForward.whenOnline')"
            ref="online"
            class="csc-destinations"
            :group="destinations.online"
            group-name="cfu"
            :timeset="timeset"
            :sourceset="sourceset"
            :show-own-phone="true"
            :own-phone-timeout="ownPhoneTimeout"
            :loading="isUpdating"
            icon="smartphone"
        />
        <csc-destinations :title="$t('pages.callForward.whenBusy')"
            class="csc-destinations"
            :group="destinations.busy"
            group-name="cfb"
            :timeset="timeset"
            :sourceset="sourceset"
            icon="phonelink_ring"
        />
        <csc-destinations :title="$t('pages.callForward.whenOffline')"
            class="csc-destinations"
            :group="destinations.offline"
            group-name="cfna"
            :timeset="timeset"
            :sourceset="sourceset"
            icon="phonelink_erase"
        />
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
            'sourceset',
            'destinations'
        ],
        components: {
            CscDestinations
        },
        created() {
            this.$store.dispatch('callForward/loadOwnPhoneTimeout');
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
                timesLength: 'getTimesetTimesLength',
                isUpdating: 'isUpdating',
                updateOwnPhoneToggleState: 'updateOwnPhoneToggleState',
                updateOwnPhoneToggleError: 'updateOwnPhoneToggleError',
                ownPhoneTimeout: 'ownPhoneTimeout',
                lastOwnPhoneToggle: 'lastOwnPhoneToggle',
                updateOwnPhoneTimeoutState: 'updateOwnPhoneTimeoutState',
                updateOwnPhoneTimeoutError: 'updateOwnPhoneTimeoutError',
                lastOwnPhoneTimeout: 'lastOwnPhoneTimeout'
            })
        },
        methods: {
            reloadDestinations(timeset) {
                this.$store.dispatch('callForward/loadDestinations', {
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
                if (state === 'failed') {
                    showGlobalError(this.changeDestinationError);
                }
                else if (state === 'succeeded') {
                    this.reloadTimes(this.timeset);
                }
            },
            updateOwnPhoneToggleState(state) {
                if (state === 'failed') {
                    showGlobalError(this.updateOwnPhoneToggleError);
                }
                else if (state === 'succeeded') {
                    this.reloadDestinations(this.timeset);
                    showToast(this.$t('pages.callForward.updateOwnPhoneToggleSuccessMessage', {
                        toggle: this.lastOwnPhoneToggle
                    }));
                }
            },
            updateOwnPhoneTimeoutState(state) {
                if (state === 'failed') {
                    showGlobalError(this.updateOwnPhoneToggleError);
                }
                else if (state === 'succeeded') {
                    this.$refs.online.hideModal();
                    this.reloadDestinations(this.timeset);
                    showToast(this.$t('pages.callForward.updateOwnPhoneTimeoutSuccessMessage', {
                        timeout: this.lastOwnPhoneTimeout
                    }));
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
