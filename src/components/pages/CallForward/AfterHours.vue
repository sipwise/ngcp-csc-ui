<template>
    <csc-page :title="$t('pages.callForward.titles.afterHours')">
        <!--TODO: Implement custom component as wrapper for timeset specific destinations and times-->
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

<style lang="stylus" rel="stylesheet/stylus">
</style>
