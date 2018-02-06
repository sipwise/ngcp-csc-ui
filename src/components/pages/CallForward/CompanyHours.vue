<template>
    <csc-page :title="$t('pages.callForward.titles.companyHours')">
        <div v-if="timesetIsCompatible && !timesetHasReverse && !timesetHasDuplicate && timesetExists">
            <csc-call-forward-times :times="timesetTimes"></csc-call-forward-times>
            <csc-call-forward-destinations timeset="Company Hours" :destinations="destinations">
            </csc-call-forward-destinations>
        </div>
        <div v-else-if="timesetHasDuplicate && timesetExists">
            <q-alert color="red"
                icon="date_range"
                enter="bounceInLeft"
                leave="bounceOutRight"
                appear>
                    {{ $t('pages.callForward.times.companyHoursDuplicate') }}
            </q-alert>
        </div>
        <div v-else-if="!timesetIsCompatible && timesetExists">
            <q-alert color="red"
                icon="date_range"
                enter="bounceInLeft"
                leave="bounceOutRight"
                appear>
                    {{ $t('pages.callForward.times.companyHoursIncompatible') }}
            </q-alert>
        </div>
        <div v-else-if="timesetHasReverse && timesetExists">
            <q-alert color="red"
                icon="date_range"
                enter="bounceInLeft"
                leave="bounceOutRight"
                appear>
                    {{ $t('pages.callForward.times.companyHoursReverse') }}
            </q-alert>
        </div>
        <div v-else>
            <q-alert color="warning"
                icon="date_range"
                enter="bounceInLeft"
                leave="bounceOutRight"
                appear>
                    {{ $t('pages.callForward.times.companyHoursNotDefined') }}
            </q-alert>
        </div>
    </csc-page>
</template>

<script>
    import { mapState } from 'vuex'
    import { QAlert } from 'quasar-framework'
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
            CscCallForwardTimes,
            QAlert
        },
        created() {
            this.$store.dispatch('callForward/loadCompanyHoursEverybodyDestinations');
            this.$store.dispatch('callForward/loadTimesetTimes', {
                timeset: 'Company Hours'
            });
        },
        computed: {
            ...mapState('callForward', [
                'destinations',
                'timesetTimes',
                'timesetIsCompatible',
                'timesetHasReverse',
                'timesetHasDuplicate',
                'timesetExists'
            ])
        }
    }
</script>

<style>
</style>
