<template>
    <csc-page title="Always">
        <q-card class="dest-card">
            <csc-destinations title="When I am online ..."
                :grouping="destinations.online"
                icon="signal_wifi_4_bar">
            </csc-destinations>
            <csc-destinations title="When I am busy ..."
                :grouping="destinations.busy"
                icon="record_voice_over">
            </csc-destinations>
            <csc-destinations title="When I am offline ..."
                :grouping="destinations.offline"
                icon="signal_wifi_off">
            </csc-destinations>
        </q-card>
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    import CscDestinations from './CscDestinations'
    import { QCard } from 'quasar-framework'
    export default {
        mounted() {
            this.$store.dispatch('callForward/loadAlwaysEverybodyDestinations');
        },
        data () {
            return {
            }
        },
        components: {
            QCard,
            CscPage,
            CscDestinations
        },
        methods: {
        },
        computed: {
            destinations() {
                return this.$store.state.callForward.alwaysEverybodyDestinations;
            }
        }
    }
</script>

<style lang="stylus">
</style>
