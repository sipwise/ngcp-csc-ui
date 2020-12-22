<template>
	<div class="dest-card">
		<csc-destinations
			ref="online"
			:title="$t('When I am online ...')"
			:group="destinations.online"
			group-name="cfu"
			:timeset="timeset"
			:sourceset="sourceset"
			:show-own-phone="true"
			:own-phone-timeout="ownPhoneTimeout"
			:loading="isUpdating"
			icon="smartphone"
			class="q-mb-lg"
		/>
		<csc-destinations
			:title="$t('When I am busy ...')"
			:group="destinations.busy"
			group-name="cfb"
			:timeset="timeset"
			:sourceset="sourceset"
			icon="phonelink_ring"
			class="q-mb-lg"
		/>
		<csc-destinations
			:title="$t('When I am offline ...')"
			:group="destinations.offline"
			group-name="cfna"
			:timeset="timeset"
			:sourceset="sourceset"
			icon="phonelink_erase"
		/>
	</div>
</template>

<script>
import {
	mapState,
	mapGetters
} from 'vuex'
import {
	showGlobalError,
	showToast
} from 'src/helpers/ui'
import CscDestinations from './CscDestinations'
export default {
	name: 'CscCallForwardDestinations',
	components: {
		CscDestinations
	},
	props: {
		timeset: {
			type: String,
			default: undefined
		},
		sourceset: {
			type: Number,
			default: null
		},
		destinations: {
			type: Object,
			default: undefined
		}
	},
	computed: {
		...mapState('callForward', [
			'removeDestinationState',
			'addDestinationState',
			'changeDestinationState',
			'lastRemovedDestination',
			'lastAddedDestination',
			'removeTimeState',
			'lastRemovedDay'
		]),
		...mapGetters('callForward', [
			'addDestinationError',
			'isUpdating',
			'updateOwnPhoneToggleState',
			'updateOwnPhoneToggleError',
			'ownPhoneTimeout',
			'lastOwnPhoneToggle',
			'updateOwnPhoneTimeoutState',
			'lastOwnPhoneTimeout',
			'removeTimeError'
		])
	},
	watch: {
		removeDestinationState (state) {
			if (state === 'requesting') {
				// startLoading()
			} else if (state === 'failed') {
				// stopLoading()
				showGlobalError(this.removeDestinationError)
			} else if (state === 'succeeded') {
				// stopLoading()
				showToast(this.$t('Removed destination {destination}', {
					destination: this.lastRemovedDestination
				}))
				this.reloadDestinations(this.timeset)
			}
		},
		addDestinationState (state) {
			if (state === 'requesting') {
				// startLoading()
			} else if (state === 'failed') {
				// stopLoading()
				showGlobalError(this.addDestinationError)
			} else if (state === 'succeeded') {
				// stopLoading()
				showToast(this.$t('Added destination {destination}', {
					destination: this.lastAddedDestination
				}))
				this.reloadDestinations(this.timeset)
			}
		},
		changeDestinationState (state) {
			if (state === 'requesting') {
				// startLoading()
			} else if (state === 'failed') {
				// stopLoading()
				showGlobalError(this.changeDestinationError)
			} else if (state === 'succeeded') {
				// stopLoading()
				this.reloadDestinations(this.timeset)
			}
		},
		removeTimeState (state) {
			if (state === 'failed') {
				showGlobalError(this.changeDestinationError)
			} else if (state === 'succeeded') {
				this.reloadTimes(this.timeset)
			}
		},
		updateOwnPhoneToggleState (state) {
			if (state === 'failed') {
				showGlobalError(this.updateOwnPhoneToggleError)
			} else if (state === 'succeeded') {
				this.reloadDestinations(this.timeset)
				showToast(this.$t('Own phone is {toggle}', {
					toggle: this.lastOwnPhoneToggle
				}))
			}
		},
		updateOwnPhoneTimeoutState (state) {
			if (state === 'failed') {
				showGlobalError(this.updateOwnPhoneToggleError)
			} else if (state === 'succeeded') {
				this.$refs.online.hideModal()
				this.reloadDestinations(this.timeset)
				showToast(this.$t('Own phone timeout set to {timeout}', {
					timeout: this.lastOwnPhoneTimeout
				}))
			}
		}
	},
	created () {
		this.$store.dispatch('callForward/loadOwnPhoneTimeout')
	},
	methods: {
		reloadDestinations (timeset) {
			this.$store.dispatch('callForward/loadDestinations', {
				timeset: timeset
			})
		},
		reloadTimes () {
			this.$store.dispatch('callForward/loadTimesetTimes', {
				timeset: this.timeset
			})
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">

    .dest-card
        max-width 100%
        margin auto
        .csc-destinations
            .dest-icon
                font-size 18px
                margin-bottom 5px

</style>
