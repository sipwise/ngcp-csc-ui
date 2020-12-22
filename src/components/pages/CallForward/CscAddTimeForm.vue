<template>
	<div>
		<div
			class="row q-col-gutter-md q-mb-sm"
		>
			<div
				class="col-12 col-md"
			>
				<q-select
					v-model="selectedWeekday"
					options-dense
					emit-value
					map-options
					dense
					:options="selectOptions"
				/>
			</div>
			<div
				class="col-12 col-md"
			>
				<csc-input-time
					v-model="timeFrom"
					dense
				/>
			</div>
			<div
				class="col-12 col-md"
			>
				<csc-input-time
					v-model="timeTo"
					dense
					class="col-2"
				/>
			</div>
		</div>
		<div
			class="row q-col-gutter-md"
		>
			<div
				class="col-auto"
			>
				<q-btn
					flat
					icon="clear"
					color="default"
					@click="disableForm()"
				>
					{{ $t('Cancel') }}
				</q-btn>
			</div>
			<div
				class="col-auto"
			>
				<q-btn
					flat
					icon="check"
					color="primary"
					@click="addTime()"
				>
					{{ $t('Save') }}
				</q-btn>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { showGlobalError } from 'src/helpers/ui'
import CscInputTime from 'components/form/CscInputTime'

export default {
	name: 'CscAddTimeForm',
	components: { CscInputTime },
	props: {
		type: {
			type: String,
			default: ''
		},
		timeset: {
			type: String,
			default: null
		}
	},
	data () {
		return {
			selectOptions: [
				{ label: this.$t('Sunday'), value: 1 },
				{ label: this.$t('Monday'), value: 2 },
				{ label: this.$t('Tuesday'), value: 3 },
				{ label: this.$t('Wednesday'), value: 4 },
				{ label: this.$t('Thursday'), value: 5 },
				{ label: this.$t('Friday'), value: 6 },
				{ label: this.$t('Saturday'), value: 7 }
			],
			selectedWeekday: 1,
			timeTo: '0:00',
			timeFrom: '0:00'
		}
	},
	computed: {
		...mapState('callForward', [
			'addTimeState'
		]),
		typeIsNew () {
			return this.type === 'new'
		},
		timeHasError () {
			const timeToHour = parseInt(this.timeTo.split(':')[0])
			const timeFromHour = parseInt(this.timeFrom.split(':')[0])
			const timeToMinute = parseInt(this.timeTo.split(':')[1])
			const timeFromMinute = parseInt(this.timeFrom.split(':')[1])
			const hoursReverse = timeToHour < timeFromHour || (timeToMinute < timeFromMinute && timeToHour === timeFromHour)
			const sameTime = this.timeTo === this.timeFrom
			return hoursReverse || sameTime
		}
	},
	methods: {
		resetTimes () {
			this.timeTo = '0:00'
			this.timeFrom = '0:00'
			this.selectedWeekday = 1
		},
		disableForm () {
			this.resetTimes()
			this.$store.commit('callForward/setActiveTimeForm', false)
		},
		addTime () {
			if (this.type === 'new' && !this.timeHasError) {
				this.$store.dispatch('callForward/createTimesetWithTime', {
					time: [{ from: this.timeFrom, to: this.timeTo }],
					weekday: this.selectedWeekday,
					name: this.timeset
				})
			} else if (this.type === 'existing' && !this.timeHasError) {
				this.$store.dispatch('callForward/appendTimeToTimeset', {
					time: [{ from: this.timeFrom, to: this.timeTo }],
					weekday: this.selectedWeekday,
					name: this.timeset
				})
			} else {
				showGlobalError(this.$t('Select valid time'))
			}
		}
	}
}
</script>
