<template>
	<csc-sourcesets
		v-if="destinationsLoaded"
		ref="sourcesets"
		:sourcesets="sourcesets"
		:destinations="destinations"
		:timeset-name="timesetName"
		:loading="timesetLoading"
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
			v-if="!timesetLoading && (timesetHasDuplicate ||
				!timesetIsCompatible ||
				timesetHasReverse ||
				showDefinedAlert)"
			class="row justify-center q-pa-md q-pt-xl"
		>
			<div
				class="col col-xs-12 col-md-8"
			>
				<template
					v-if="timesetHasDuplicate"
				>
					<csc-inline-alert-alert>
						{{ $t('More than one {timeset} timeset exists. You can resolve this by resetting the {timeset} timesets.', { timeset: timesetName }) }}
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
						{{ $t('The {timeset} timeset contains incompatible values. You can resolve this by resetting the {timeset} timeset.', { timeset: timesetName }) }}
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
						{{ $t('The {timeset} timeset contain reverse order of values. You can resolve this by resetting the {timeset} timeset.', { timeset: timesetName }) }}
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
						{{ $t('The {timeset} timeset is not defined. You need to create one to be able to define call forward destinations.', { timeset: timesetName }) }}
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
		timesetLoading () {
			return this.loadDestinationState === 'requesting' ||
				this.addSourcesetState === 'requesting' ||
				this.updateOwnPhoneToggleState === 'requesting' ||
				this.addDestinationState === 'requesting' ||
				this.removeDestinationState === 'requesting' ||
				this.changeDestinationState === 'requesting' ||
				this.addTimeState === 'requesting' ||
				this.resetTimeState === 'requesting' ||
				this.removeTimeState === 'requesting' ||
				this.addSourceState === 'requesting' ||
				this.removeSourceState === 'requesting'
		},
		labelReset () {
			return this.$t('Reset {timeset}', {
				timeset: this.timesetName
			})
		},
		labelAdd () {
			return this.$t('Add {timeset}', {
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
				return this.$t('You are about to remove the time entry for {day}', {
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
				showToast(this.$t('Reset of timesets completed'))
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
				showToast(this.$t('Created new timeset'))
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
				showToast(this.$t('Created sourceset {sourceset}', {
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
		deleteTimeDialog (index) {
			this.$q.dialog({
				title: this.$t('Remove call forward time'),
				message: this.deleteTimeMessage,
				color: 'negative',
				cancel: true,
				persistent: true
			}).onOk(data => {
				this.deleteTime(index)
			})
		},
		deleteTime (index) {
			this.$store.dispatch('callForward/deleteTimeFromTimeset', {
				index: index
			})
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .times-card
        .q-alert-container
            padding 15px 0
</style>
