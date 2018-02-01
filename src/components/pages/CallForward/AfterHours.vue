<template>
    <csc-page :title="$t('pages.callForward.titles.afterHours')">
        <csc-call-forward timeset="After Hours" :destinations="destinations">
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
            this.$store.dispatch('callForward/loadAfterHoursEverybodyDestinations');
        },
        computed: {
            ...mapState('callForward', {
                destinations: 'afterHoursEverybodyDestinations'
            })
        }
    }
</script>

<style>
</style>
