<template>
    <csc-page :title="$t('pages.callForward.titles.companyHours')">
        <div v-if="timesetCompatible && hasTimeset">
            <csc-call-forward-times :times="timesetTimes"></csc-call-forward-times>
            <csc-call-forward-destinations timeset="Company Hours" :destinations="destinations">
            </csc-call-forward-destinations>
        </div>
		<!--TODO: Refine to also have separate check and message if timeset is not defined-->
        <div v-else-if="!timesetCompatible && hasTimeset">
			<q-alert color="red"
				icon="date_range"
				enter="bounceInLeft"
				leave="bounceOutRight"
				appear>
			  		{{ $t('pages.callForward.times.companyHoursIncompatible') }}
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
                'timesetCompatible',
				'hasTimeset'
            ])
        }
    }
</script>

<style>
</style>
