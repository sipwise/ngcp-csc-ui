<template>
    <csc-page :title="$t('pages.callForward.titles.companyHours')">
        <csc-call-forward-times timeset="Company Hours"></csc-call-forward-times>
        <csc-call-forward-destinations timeset="Company Hours" :destinations="destinations">
        </csc-call-forward-destinations>
    </csc-page>
</template>

<script>
    import { mapState } from 'vuex'
    import CscPage from '../../CscPage'
    import CscCallForwardDestinations from './CscCallForwardDestinations'
    import CscCallForwardTimes from './CscCallForwardTimes'
    export default {
        data () {
            return {}
        },
        components: {
            CscPage,
            CscCallForwardDestinations,
            CscCallForwardTimes
        },
        created() {
            this.$store.dispatch('callForward/loadCompanyHoursEverybodyDestinations');
        },
        computed: {
            ...mapState('callForward', {
                destinations: 'companyHoursEverybodyDestinations'
            })
        }
    }
</script>

<style>
</style>
