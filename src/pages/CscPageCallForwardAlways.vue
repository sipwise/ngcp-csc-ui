<template>
	<csc-sourcesets
		id="csc-page-call-forward-always"
		ref="sourcesets"
		:sourcesets="sourcesets"
		:destinations="destinations"
		:timeset-name="timesetName"
		:loading="loadDestinationState === 'requesting' ||
			addSourcesetState === 'requesting' ||
			updateOwnPhoneToggleState === 'requesting' ||
			addDestinationState === 'requesting' ||
			removeDestinationState === 'requesting' ||
			changeDestinationState === 'requesting' ||
			addSourceState === 'requesting' ||
			removeSourceState === 'requesting'"
	/>
</template>

<script>
import {
	mapState,
	mapGetters
} from 'vuex'
import {
	showToast,
	showGlobalError
} from 'src/helpers/ui'
import CscSourcesets from 'components/pages/CallForward/CscSourcesets'
export default {
	components: {
		CscSourcesets
	},
	data () {
		return {
			timesetName: null // In API layer the actual value used is null
		}
	},
	computed: {
		...mapState('callForward', [
			'mappings',
			'destinations',
			'sourcesets',
			'loadDestinationState',
			'loadDestinationError',
			'addSourcesetState',
			'lastAddedSourceset',
			'removeDestinationState',
			'changeDestinationState',
			'addDestinationState',
			'updateOwnPhoneToggleState',
			'addSourceState',
			'removeSourceState'
		]),
		...mapGetters('callForward', [
			'addSourcesetError',
			'destinationsLoaded'
		]),
		destinationsLoaded () {
			return this.destinations.length > 0
		}
	},
	watch: {
		loadDestinationState (state) {
			if (state === 'requesting') {
				// startLoading()
			} else if (state === 'failed') {
				// stopLoading()
				showGlobalError(this.loadDestinationError)
			} else if (state === 'succeeded') {
				// stopLoading()
			}
		},
		addSourcesetState (state) {
			if (state === 'requesting') {
			} else if (state === 'failed') {
				showGlobalError(this.addSourcesetError)
			} else if (state === 'succeeded') {
				this.$refs.sourcesets.resetForm()
				showToast(this.$t('pages.callForward.sources.addSuccessMessage', {
					sourceset: this.lastAddedSourceset
				}))
				this.$store.dispatch('callForward/loadDestinations', {
					timeset: null
				})
				this.$store.dispatch('callForward/loadSourcesets')
			}
		}
	},
	mounted () {
		this.$store.dispatch('callForward/loadDestinations', {
			timeset: null
		})
		this.$store.dispatch('callForward/loadSourcesets')
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
