<template>
	<csc-cf-group-condition
		:title="$t('date range is ...')"
		icon="book_online"
		:loading="$wait.is('csc-cf-time-set-create')"
		v-bind="$attrs"
		v-on="$listeners"
	>
		<template
			v-if="invalidDateset"
		>
			<q-banner
				rounded
				dense
				class="bg-red-8 text-white q-pt-md q-ma-md half-screen-width"
			>
				<template v-slot:avatar>
					<q-icon name="date_range" />
				</template>
				{{ $t('The "{timeset}" timeset contains incompatible values. You can resolve this by deleting it and recreating from the scratch.', { timeset: timeSet.name }) }}
			</q-banner>
		</template>
		<template
			v-else
		>
			<q-date
				v-model="selectedDate"
				class="no-margin no-padding"
				flat
				square
				minimal
				range
			/>
		</template>
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
				v-if="!invalidDateset"
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
import { humanDatesetToKamailio, kamailioDatesetToHuman } from 'src/helpers/kamailio-timesets-converter'
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
			invalidDateset: false,
			selectedDate: null
		}
	},
	mounted () {
		this.transformDateset()
	},
	methods: {
		...mapActions('callForwarding', [
			'createTimeSetDateRange',
			'updateTimeSetDateRange',
			'deleteTimeSet'
		]),
		transformDateset () {
			if (this.timeSet) {
				let hDateset
				try {
					hDateset = kamailioDatesetToHuman(this.timeSet.times)
				} catch (e) {
					this.invalidDateset = true
					console.info(e)
					return
				}
				if (hDateset.length === 0) {
					this.selectedDate = null
				} else {
					this.selectedDate = (hDateset[0].from === hDateset[0].to) ? hDateset[0].from : hDateset[0]
				}
			} else {
				this.selectedDate = null
			}
		},
		async createTimeSetEvent () {
			const dateFrom = this.selectedDate.from ? this.selectedDate.from : this.selectedDate
			const dateTo = this.selectedDate.to ? this.selectedDate.to : this.selectedDate
			const kamilioTimesets = humanDatesetToKamailio([{ from: dateFrom, to: dateTo }])
			const payload = {
				mapping: this.mapping,
				date: kamilioTimesets
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
