<template>
    <csc-page :title="$t('pages.callForward.titles.always')">
        <csc-call-forward timeset="null" :destinations="destinations">
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
            this.$store.dispatch('callForward/loadAlwaysEverybodyDestinations');
        },
        computed: {
            ...mapState('callForward', {
                destinations: 'alwaysEverybodyDestinations'
            })
        }
    }
</script>

<style>
</style>
