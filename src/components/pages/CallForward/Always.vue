<template>
    <csc-page :title="$t('pages.callForward.titles.always')">
        <q-card class="dest-card">
            <csc-destinations :title="$t('pages.callForward.whenOnline')"
                :group="destinations.online"
                icon="signal_wifi_4_bar">
            </csc-destinations>
            <csc-destinations :title="$t('pages.callForward.whenBusy')"
                :group="destinations.busy"
                icon="record_voice_over">
            </csc-destinations>
            <csc-destinations :title="$t('pages.callForward.whenOffline')"
                :group="destinations.offline"
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
        created() {
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
