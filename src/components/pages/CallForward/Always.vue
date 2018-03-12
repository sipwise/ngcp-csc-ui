<template>
    <csc-page :title="$t('pages.callForward.titles.always')">
        <csc-sourcesets v-if="destinationsLoaded" :sourcesets="sourcesets" :destinations="destinations" :timesetName="timesetName" />
    </csc-page>
</template>

<script>
    import { mapState } from 'vuex'
    import CscPage from '../../CscPage'
    import CscSourcesets from './CscSourcesets'
    export default {
        data () {
            return {
				timesetName: null // In API layer the actual value used is null
            }
        },
        components: {
            CscPage,
            CscSourcesets
        },
        created() {
            this.$store.dispatch('callForward/loadDestinations', {
                timeset: null
            });
            this.$store.dispatch('callForward/loadSourcesets');
        },
        computed: {
            ...mapState('callForward', [
                'destinations',
                'sourcesets'
            ]),
            destinationsLoaded() {
                return this.destinations.length > 0;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
