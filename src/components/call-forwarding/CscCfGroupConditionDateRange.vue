<template>
	<csc-cf-group-condition
		:title="$t('date range is ...')"
		icon="book_online"
		:loading="$wait.is('csc-cf-time-set-create')"
		v-bind="$attrs"
		v-on="$listeners"
	>
		<q-date
			v-model="selectedDate"
			class="no-margin no-padding"
			flat
			square
			minimal
			range
		/>
		<template
			v-slot:actions
		>
			<q-btn
				v-if="deleteButton"
				:label="$t('Delete')"
				flat
				color="negative"
				icon="delete"
				@click="deleteSourceSetEvent"
			/>
			<q-btn
				:label="$t('Save')"
				flat
				color="primary"
				icon="check"
				:disable="!selectedDate"
				@click="createTimeSetEvent"
			/>
		</template>
	</csc-cf-group-condition>
</template>
<script>
import CscCfGroupCondition from 'components/call-forwarding/CscCfGroupCondition'
import { mapActions } from 'vuex'
import { timeSetDateRange } from 'src/filters/time-set'
export default {
	name: 'CscCfGroupConditionDateRange',
	components: {
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
			selectedDate: this.transformedDate
		}
	},
	computed: {
		formattedDate () {
			if (this.timeSet) {
				return timeSetDateRange(this.timeSet.times)
			}
			return null
		},
		transformedDate () {
			if (this.timeSet) {
				const dateRangeParts = timeSetDateRange(this.timeSet.times).split('-')
				return {
					from: dateRangeParts[0],
					to: dateRangeParts[1]
				}
			} else {
				return null
			}
		}
	},
	mounted () {
		this.selectedDate = this.transformedDate
	},
	methods: {
		...mapActions('callForwarding', [
			'createTimeSetDateRange',
			'updateTimeSetDateRange',
			'deleteTimeSet'
		]),
		async createTimeSetEvent () {
			const datePartsFrom = this.selectedDate.from.split('/')
			const datePartsTo = this.selectedDate.to.split('/')
			const payload = {
				mapping: this.mapping,
				date: {
					from: {
						date: datePartsFrom[2],
						month: datePartsFrom[1],
						year: datePartsFrom[0]
					},
					to: {
						date: datePartsTo[2],
						month: datePartsTo[1],
						year: datePartsTo[0]
					}
				}
			}
			if (this.timeSet) {
				payload.id = this.timeSet.id
				await this.updateTimeSetDateRange(payload)
			} else {
				await this.createTimeSetDateRange(payload)
			}
			this.$emit('close')
		},
		async deleteSourceSetEvent () {
			await this.deleteTimeSet({
				mapping: this.mapping,
				id: this.timeSet.id
			})
		}
	}
}
</script>
