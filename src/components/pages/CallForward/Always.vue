<template>
    <csc-page :title="$t('pages.callForward.titles.always')">
        <csc-call-forward-destinations :timeset="alwaysTimeset" :destinations="destinations">
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
            this.$store.dispatch('callForward/loadAlwaysEverybodyDestinations');
        },
        computed: {
            ...mapState('callForward', [
                'destinations'
            ]),
            alwaysTimeset() {
                return null;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
