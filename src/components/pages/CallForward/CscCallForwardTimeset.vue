<template>
	<csc-sourcesets
		v-if="destinationsLoaded"
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
			addTimeState === 'requesting' ||
			resetTimeState === 'requesting' ||
			removeTimeState === 'requesting' ||
			addSourceState === 'requesting' ||
			removeSourceState === 'requesting'"
	>
		<div
			v-if="showSections"
			class="row justify-center q-pa-md q-pt-xl"
		>
			<csc-call-forward-times
				ref="times"
				class="col col-xs-12 col-md-8"
				:times="timesetTimes"
				:timeset-name="timesetName"
				:active-time-form="activeTimeForm"
				:timeset-times-loaded="timesetTimesLoaded"
				@enable-add-form="enableTimesAddForm"
				@delete-time="deleteTimeDialog"
				@delete-last-time="deleteLastTimeDialog"
			/>
		</div>
		<div
			v-if="showTimesetForm"
			class="row justify-center q-pa-md q-pt-xl"
		>
			<csc-add-time-form
				ref="addTimeNew"
				type="new"
				class="col col-xs-12 col-md-8"
				:timeset="timesetName"
			/>
		</div>
		<div
			v-if="timesetHasDuplicate ||
				!timesetIsCompatible ||
				timesetHasReverse ||
				showDefinedAlert"
			class="row justify-center q-pa-md q-pt-xl"
		>
			<div
				class="col col-xs-12 col-md-8"
			>
				<template
					v-if="timesetHasDuplicate"
				>
					<csc-inline-alert-alert>
						{{ $t('pages.callForward.times.timesetDuplicate', { timeset: timesetName }) }}
						<template
							v-slot:action
						>
							<q-btn
								color="dark"
								unelevated
								:label="labelReset"
								@click="resetTimeset"
							/>
						</template>
					</csc-inline-alert-alert>
				</template>
				<template
					v-else-if="!timesetIsCompatible"
				>
					<csc-inline-alert-alert>
						{{ $t('pages.callForward.times.timesetIncompatible', { timeset: timesetName }) }}
						<template
							v-slot:action
						>
							<q-btn
								color="dark"
								unelevated
								:label="labelReset"
								@click="resetTimeset"
							/>
						</template>
					</csc-inline-alert-alert>
				</template>
				<template
					v-else-if="timesetHasReverse"
				>
					<csc-inline-alert-alert>
						{{ $t('pages.callForward.times.timesetReverse', { timeset: timesetName }) }}
						<template
							v-slot:action
						>
							<q-btn
								color="dark"
								unelevated
								:label="labelReset"
								@click="resetTimeset"
							/>
						</template>
					</csc-inline-alert-alert>
				</template>
				<template
					v-show="showDefinedAlert"
				>
					<csc-inline-alert-warning>
						{{ $t('pages.callForward.times.timesetNotDefined', { timeset: timesetName }) }}
						<template
							v-slot:action
						>
							<q-btn
								color="dark"
								unelevated
								:label="labelAdd"
								@click="addTimeset"
							/>
						</template>
					</csc-inline-alert-warning>
				</template>
			</div>
		</div>
	</csc-sourcesets>
</template>

<script>
import {
	mapGetters,
	mapState
} from 'vuex'
import {
	showGlobalError,
	showToast
} from 'src/helpers/ui'
import CscCallForwardTimes from './CscCallForwardTimes'
import CscAddTimeForm from './CscAddTimeForm'
import CscSourcesets from './CscSourcesets'
import CscInlineAlertWarning from 'components/CscInlineAlertWarning'
import CscInlineAlertAlert from 'components/CscInlineAlertAlert'
export default {
	name: 'CscCallForwardTimeset',
	components: {
		CscInlineAlertAlert,
		CscInlineAlertWarning,
		CscCallForwardTimes,
		CscAddTimeForm,
		CscSourcesets
	},
	props: {
		timesetName: {
			type: String,
			default: undefined
		}
	},
	data () {
		return {
			showAlertDuplicate: true,
			showAlertCompatible: true,
			showAlertReverse: true,
			showAlertDefined: true,
			deleteTimeData: null
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
			'removeTimeState',
			'addSourceState',
			'removeSourceState'
		]),
		...mapGetters('callForward', [
			'destinations',
			'timesetTimes',
			'resetTimeState',
			'addTimeState',
			'timesetHasDuplicate',
			'timesetIsCompatible',
			'timesetHasReverse',
			'timesetExists',
			'activeTimeForm',
			'sourcesets',
			'loadDestinationState',
			'addSourcesetState',
			'resetTimeError',
			'addTimeError',
			'showDefinedAlert',
			'destinationsLoaded',
			'showTimesAndDestinations',
			'loadDestinationError',
			'addSourcesetError',
			'timesetTimesLoaded'
		]),
		labelReset () {
			return this.$t('pages.callForward.times.resetTimeset', {
				timeset: this.timesetName
			})
		},
		labelAdd () {
			return this.$t('pages.callForward.times.addTimeset', {
				timeset: this.timesetName
			})
		},
		showTimesetForm () {
			return this.activeTimeForm && !this.timesetExists && this.timesetTimesLoaded
		},
		showSections () {
			return this.showTimesAndDestinations && this.timesetTimesLoaded
		},
		deleteTimeMessage () {
			if (this.deleteTimeData !== null) {
				return this.$t('pages.callForward.times.removeDialogText', {
					day: this.deleteTimeData.removedDay
				})
			} else {
				return ''
			}
		}
	},
	watch: {
		$route: {
			handler: 'loadAll'
		},
		resetTimeState (state) {
			if (state === 'requesting') {
			} else if (state === 'failed') {
				showGlobalError(this.resetTimeError)
			} else if (state === 'succeeded') {
				showToast(this.$t('pages.callForward.times.resetSuccessMessage'))
				this.loadTimes()
			}
		},
		addTimeState (state) {
			if (state === 'requesting') {
				this.$store.commit('callForward/setActiveTimeForm', true)
			} else if (state === 'failed') {
				showGlobalError(this.addTimeError)
			} else if (state === 'succeeded') {
				this.$store.commit('callForward/setActiveTimeForm', false)
				if (this.$refs.times) {
					this.$refs.times.resetTimes()
				} else {
					this.$refs.addTimeNew.resetTimes()
				}
				this.loadTimes()
				this.loadDestinations()
				showToast(this.$t('pages.callForward.times.addTimeSuccessMessage'))
			}
		},
		activeTimeForm (state) {
			if (!state) {
				this.resetAlerts()
			}
		},
		loadDestinationState (state) {
			if (state === 'requesting') {
			} else if (state === 'failed') {
				showGlobalError(this.loadDestinationError)
			} else if (state === 'succeeded') {
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
				this.loadDestinations()
				this.loadSourcesets()
			}
		}
	},
	created () {
		this.loadAll()
	},
	methods: {
		resetTimeset () {
			this.$store.dispatch('callForward/resetTimesetByName', this.timesetName)
		},
		addTimeset () {
			this.$store.commit('callForward/setActiveTimeForm', true)
		},
		loadSourcesets () {
			this.$store.dispatch('callForward/loadSourcesets')
		},
		loadDestinations () {
			this.$store.dispatch('callForward/loadDestinations', {
				timeset: this.timesetName
			})
		},
		loadTimes () {
			this.$store.dispatch('callForward/loadTimesetTimes', {
				timeset: this.timesetName
			})
			this.resetAlerts()
		},
		loadAll () {
			this.$store.commit('callForward/resetTimesetState')
			this.loadTimes()
			this.loadDestinations()
			this.loadSourcesets()
		},
		resetAlerts () {
			this.showAlertDuplicate = true
			this.showAlertCompatible = true
			this.showAlertReverse = true
			this.showAlertDefined = true
		},
		enableTimesAddForm () {
			this.$store.commit('callForward/setActiveTimeForm', true)
		},
		deleteTimeDialog (data) {
			this.deleteTimeData = data
			this.$q.dialog({
				title: this.$t('pages.callForward.times.removeDialogTitle'),
				message: this.deleteTimeMessage,
				color: 'negative',
				cancel: true,
				persistent: true
			}).onOk(data => {
				this.deleteTime()
			})
		},
		deleteTime () {
			this.$store.dispatch('callForward/deleteTimeFromTimeset', this.deleteTimeData)
			this.deleteTimeData = null
		},
		deleteLastTimeDialog () {
			this.$q.dialog({
				title: this.$t('pages.callForward.times.removeDialogTitle'),
				message: this.$t('pages.callForward.times.removeLastDialogText'),
				color: 'negative',
				cancel: true,
				persistent: true
			}).onOk(data => {
				this.deleteLastTime()
			})
		},
		deleteLastTime () {
			this.$store.dispatch('callForward/deleteTimesetById')
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .times-card
        .q-alert-container
            padding 15px 0
</style>
