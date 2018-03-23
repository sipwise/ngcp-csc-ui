<template>
    <csc-page :title="$t('pages.callForward.titles.companyHours')">
        <csc-timeset-submodule
            :timesetTimes="timesetTimes"
            :destinations="destinations"
            :timesetHasDuplicate="timesetHasDuplicate"
            :timesetIsCompatible="timesetIsCompatible"
            :timesetHasReverse="timesetHasReverse"
            :timesetExists="timesetExists"
            :showDefinedAlert="showDefinedAlert"
            timesetName="Company Hours"
            ref="timesetSubmodule"
        />
    </csc-page>
</template>

<script>
    import { mapState, mapGetters } from 'vuex'
    import { startLoading, stopLoading,
        showGlobalError, showToast } from '../../../helpers/ui'
    import CscPage from '../../CscPage'
    import CscTimesetSubmodule from './CscTimesetSubmodule'
    export default {
        data () {
            return {
            }
        },
        components: {
            CscPage,
            CscTimesetSubmodule
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
                'timesetHasDuplicate',
                'timesetIsCompatible',
                'timesetHasReverse',
                'timesetExists'
            ]),
            ...mapGetters('callForward', [
                'resetTimeError',
                'addTimeError',
                'showDefinedAlert'
            ]),
        },
        methods: {
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
                        this.$refs.timesetSubmodule.resetExistingTimes();
                        //this.$refs.times.resetTimes();
                    }
                    else {
                        this.$refs.timesetSubmodule.resetNewTimes();
                        //this.$refs.addTimeNew.resetTimes();
                    }
                    this.loadTimes();
                    this.$store.dispatch('callForward/loadCompanyHoursEverybodyDestinations');
                    showToast(this.$t('pages.callForward.times.addTimeSuccessMessage'));
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl'

</style>
