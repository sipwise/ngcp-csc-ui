<template>
    <csc-page :title="$t('pages.callForward.titles.afterHours')">
        <csc-call-forward-destinations timeset="After Hours" :destinations="destinations">
        </csc-call-forward-destinations>
    </csc-page>
</template>

<script>
    import { mapState } from 'vuex'
    import CscPage from '../../CscPage'
    import CscCallForwardDestinations from './CscCallForwardDestinations'
    export default {
        data () {
            return {}
        },
        components: {
            CscPage,
            CscCallForwardDestinations
        },
        created() {
            this.$store.dispatch('callForward/loadAfterHoursEverybodyDestinations');
        },
        computed: {
            ...mapState('callForward', [
                'destinations'
            ])
        }
    }
</script>

<style>
</style>
