<template>
	<div>
		<div
			class="row justify-center full-width q-gutter-x-sm"
		>
			<div
				class="col-xs-12 col-md-2"
			>
				<q-select
					v-model="filterType"
					emit-value
					map-options
					dense
					:options="filterTypeOptions"
					:label="$t('pbxConfig.seatsFiltersFilterByLabel')"
				/>
			</div>
			<div
				class="col-xs-12 col-md-2"
			>
				<q-input
					v-model="typedFilter"
					type="text"
					dense
					:disable="filterType === null"
					:label="$t('pbxConfig.seatsFilterInputLabel')"
					@keypress.enter="triggerFilter"
				>
					<template
						v-slot:append
					>
						<q-btn
							icon="search"
							color="primary"
							dense
							flat
							@click="triggerFilter"
						/>
					</template>
				</q-input>
			</div>
		</div>
		<div
			class="row justify-center full-width q-gutter-x-sm"
		>
			<div
				class="col-xs-12 col-md-4"
			>
				<q-chip
					v-for="(filterItem, index) in filters"
					:key="index"
					:label="$t('pbxConfig.seatsFiltersTypes.' + filterItem.name) + ': ' + filterItem.value"
					:disable="false"
					icon="filter_alt"
					removable
					dense
					color="primary"
					text-color="dark"
					@remove="removeFilter(filterItem.name)"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import _ from 'lodash'
export default {
	name: 'CscPbxSeatFilters',
	data () {
		return {
			filterType: null,
			typedFilter: '',
			filters: []
		}
	},
	computed: {
		filterTypeOptions () {
			return [
				{
					label: this.$t('pbxConfig.seatsFiltersTypes.display_name'),
					value: 'display_name'
				},
				{
					label: this.$t('pbxConfig.seatsFiltersTypes.pbx_extension'),
					value: 'pbx_extension'
				},
				{
					label: this.$t('pbxConfig.seatsFiltersTypes.primary_number'),
					value: 'primary_number'
				},
				{
					label: this.$t('pbxConfig.seatsFiltersTypes.alias_number'),
					value: 'alias_number'
				}
			]
		}
	},
	methods: {
		triggerFilter () {
			this.addFilter(this.filterType, this.typedFilter)
		},
		removeFilter (name) {
			this.filters = this.filters.filter(item => item.name !== name)
			this.filter()
		},
		removeFilters () {
			if (this.filters.length > 0) {
				this.filters = []
				this.filter()
			}
		},
		addFilter (name, value) {
			const valueTrimmed = _.trim(value)
			if (valueTrimmed) {
				this.typedFilter = ''
				this.filters = this.filters.filter(item => item.name !== name)
				const filter = {
					name: name,
					value: valueTrimmed
				}
				this.filters.push(filter)
				this.filter()
			}
		},
		filter () {
			const params = {}
			this.filters.forEach(filter => {
				params[filter.name] = filter.value
			})
			this.$emit('filter', params)
		}
	}
}
</script>
