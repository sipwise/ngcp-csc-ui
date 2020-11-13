<template>
	<csc-cf-group-condition
		:title="$t('office hours are ...')"
		icon="access_time"
		:loading="$wait.is('csc-cf-time-set-create')"
		v-bind="$attrs"
		@back="back"
		@close="$emit('close')"
	>
		<div
			class="row justify-center q-pt-md"
		>
			<q-checkbox
				v-model="sameTimes"
				:label="$t('Same time for selected days')"
			/>
		</div>
		<q-list
			dense
		>
			<q-item
				class="q-mb-md q-mt-md"
			>
				<q-item-section>
					<csc-cf-selection-weekdays
						v-model="weekdays"
						:tabs="!sameTimes"
					/>
				</q-item-section>
			</q-item>
			<q-item
				v-for="(time, index) in times"
				:key="index"
			>
				<q-item-section>
					<csc-input
						v-model="times[index].from"
						dense
						:label="$t('Start time')"
						mask="##:##"
						fill-mask
						:disable="disabled"
					>
						<template
							v-slot:append
						>
							<q-btn
								icon="access_time"
								dense
								flat
								color="primary"
							>
								<q-popup-proxy
									ref="startTimePopup"
								>
									<q-time
										v-model="times[index].from"
										flat
										now-btn
										square
										format24h
										text-color="dark"
										color="primary"
										@input="$refs.startTimePopup[index].hide()"
									/>
								</q-popup-proxy>
							</q-btn>
						</template>
					</csc-input>
				</q-item-section>
				<q-item-section>
					<csc-input
						v-model="times[index].to"
						dense
						:label="$t('End time')"
						mask="##:##"
						fill-mask
						:disable="disabled"
					>
						<template
							v-slot:append
						>
							<q-btn
								icon="access_time"
								dense
								flat
								color="primary"
							>
								<q-popup-proxy
									ref="endTimePopup"
								>
									<q-time
										v-model="times[index].to"
										flat
										now-btn
										square
										format24h
										text-color="dark"
										color="primary"
										@input="$refs.endTimePopup[index].hide()"
									/>
								</q-popup-proxy>
							</q-btn>
						</template>
					</csc-input>
				</q-item-section>
				<q-item-section
					side
				>
					<q-btn
						flat
						dense
						color="negative"
						icon="delete"
						:disable="index === 0 || disabled"
						@click="removeTime(index)"
					/>
				</q-item-section>
			</q-item>
			<q-item>
				<q-item-section>
					<q-btn
						color="primary"
						icon="add"
						flat
						:label="$t('Add time')"
						:disable="disabled"
						@click="addTime"
					/>
				</q-item-section>
			</q-item>
		</q-list>
		<template
			v-slot:actions
		>
			<q-btn
				v-if="deleteButton"
				:label="$t('Delete')"
				flat
				color="negative"
				icon="delete"
				:disable="disabled"
				@click="deleteTimeSetEvent"
			/>
			<q-btn
				:label="$t('Save')"
				flat
				color="primary"
				icon="check"
				:disable="disabled"
				@click="createTimeSetOfficeHoursEvent"
			/>
		</template>
	</csc-cf-group-condition>
</template>

<script>
import CscCfGroupCondition from 'components/call-forwarding/CscCfGroupCondition'
import CscInput from 'components/form/CscInput'
import CscCfSelectionWeekdays from 'components/call-forwarding/CscCfSelectionWeekdays'
import { DAY_MAP, DEFAULT_WEEKDAYS } from 'src/filters/time-set'
import { mapActions } from 'vuex'
export default {
	name: 'CscCfGroupConditionOfficeHours',
	components: {
		CscCfSelectionWeekdays,
		CscInput,
		CscCfGroupCondition
	},
	props: {
		mapping: {
			type: Object,
			required: true
		},
		destinationSet: {
			type: Object,
			required: true
		},
		sourceSet: {
			type: Object,
			default: undefined
		},
		timeSet: {
			type: Object,
			default: undefined
		},
		deleteButton: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			sameTimes: this.isSameTimes(),
			weekdays: DEFAULT_WEEKDAYS,
			timesAll: [{
				from: '',
				to: ''
			}],
			timesDay1: [{
				from: '',
				to: ''
			}],
			timesDay2: [{
				from: '',
				to: ''
			}],
			timesDay3: [{
				from: '',
				to: ''
			}],
			timesDay4: [{
				from: '',
				to: ''
			}],
			timesDay5: [{
				from: '',
				to: ''
			}],
			timesDay6: [{
				from: '',
				to: ''
			}],
			timesDay7: [{
				from: '',
				to: ''
			}]
		}
	},
	computed: {
		disabled () {
			return this.sameTimes && this.weekdays.length === 0
		},
		times () {
			if (this.sameTimes) {
				return this.timesAll
			} else {
				return this['timesDay' + this.weekdays[0]]
			}
		}
	},
	watch: {
		timeSet () {
			this.transformTimeSet()
		},
		sameTimes (sameTimes) {
			this.transformTimeSet()
		}
	},
	mounted () {
		this.transformTimeSet()
	},
	methods: {
		...mapActions('callForwarding', [
			'createOfficeHoursSameTimes',
			'updateOfficeHoursSameTimes',
			'createOfficeHours',
			'updateOfficeHours',
			'deleteTimeSet'
		]),
		back () {
			this.$emit('back')
		},
		isSameTimes () {
			if (this.timeSet) {
				return this.timeSet.name.startsWith('csc-office-hours-same-times')
			}
			return true
		},
		transformTimeSet () {
			if (this.timeSet && this.timeSet.name.startsWith('csc-office-hours-same-times')) {
				const weekdays = new Set()
				const times = new Set()
				this.timeSet.times.forEach((time) => {
					if (time.wday !== null && time.hour !== null && time.minute !== null) {
						weekdays.add(parseInt(time.wday))
						times.add(time.hour + ':' + time.minute)
					}
				})
				this.weekdays = Array.from(weekdays)
				const timesAll = []
				Array.from(times).forEach((time) => {
					const timeParts = time.split(':')
					const hourParts = timeParts[0].split('-')
					const minuteParts = timeParts[1].split('-')
					timesAll.push({
						from: hourParts[0] + ':' + minuteParts[0],
						to: hourParts[1] + ':' + minuteParts[1]
					})
				})
				this.timesAll = timesAll
			} else if (this.timeSet && this.timeSet.name.startsWith('csc-office-hours')) {
				DAY_MAP.forEach((day) => {
					this['timesDay' + day] = []
				})
				this.timeSet.times.forEach((time) => {
					if (time.wday !== null && time.hour !== null && time.minute !== null) {
						const hourParts = time.hour.split('-')
						const minuteParts = time.minute.split('-')
						this['timesDay' + time.wday].push({
							from: hourParts[0] + ':' + minuteParts[0],
							to: hourParts[1] + ':' + minuteParts[1]
						})
					}
				})
				DAY_MAP.forEach((day) => {
					if (this['timesDay' + day].length === 0) {
						this['timesDay' + day] = [{
							from: '',
							to: ''
						}]
					}
				})
			}
		},
		addTime () {
			if (!this.sameTimes) {
				this['timesDay' + this.weekdays[0]].push({
					from: '',
					to: ''
				})
			} else {
				this.timesAll.push({
					from: '',
					to: ''
				})
			}
		},
		removeTime (index) {
			if (!this.sameTimes) {
				this['timesDay' + this.weekdays[0]] = this['timesDay' + this.weekdays[0]].filter((time, timeIndex) => timeIndex !== index)
			} else {
				this.timesAll = this.timesAll.filter((time, timeIndex) => timeIndex !== index)
			}
		},
		resetTimesPerDay () {
			DAY_MAP.forEach((day) => {
				this['timesDay' + day] = [{
					from: '',
					to: ''
				}]
			})
		},
		async createTimeSetOfficeHoursEvent () {
			const payload = {
				mapping: this.mapping
			}
			if (this.timeSet) {
				payload.id = this.timeSet.id
			}
			if (!this.sameTimes) {
				payload.times = [
					this.timesDay1,
					this.timesDay2,
					this.timesDay3,
					this.timesDay4,
					this.timesDay5,
					this.timesDay6,
					this.timesDay7
				]
			} else {
				payload.times = this.timesAll
				payload.weekdays = this.weekdays
			}
			if (this.timeSet && this.timeSet.name.startsWith('csc-office-hours-same-times') && this.sameTimes) {
				await this.updateOfficeHoursSameTimes(payload)
			} else if (this.timeSet && this.timeSet.name.startsWith('csc-office-hours-same-times') && !this.sameTimes) {
				await this.createOfficeHours(payload)
			} else if (this.timeSet && this.timeSet.name.startsWith('csc-office-hours') && this.sameTimes) {
				await this.createOfficeHoursSameTimes(payload)
			} else if (this.timeSet && this.timeSet.name.startsWith('csc-office-hours') && !this.sameTimes) {
				await this.updateOfficeHours(payload)
			} else if (!this.timeSet && this.sameTimes) {
				await this.createOfficeHoursSameTimes(payload)
			} else {
				await this.createOfficeHours(payload)
			}
			this.$emit('close')
		},
		async deleteTimeSetEvent () {
			await this.deleteTimeSet({
				mapping: this.mapping,
				id: this.timeSet.id
			})
		}
	}
}
</script>
