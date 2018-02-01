<template>
    <csc-page :title="$t('pages.callForward.titles.companyHours')">
        <csc-call-forward timeset="Company Hours" :destinations="destinations">
        </csc-call-forward>
    </csc-page>
</template>

<script>
    import { mapState } from 'vuex'
    import CscPage from '../../CscPage'
    import CscCallForward from './CscCallForward'
    export default {
        data () {
            return {}
        },
        components: {
            CscPage,
            CscCallForward
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
