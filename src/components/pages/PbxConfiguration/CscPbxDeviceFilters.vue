<template>
	<div>
		<div
			class="row justify-center full-width q-gutter-x-sm"
		>
			<div
				class="col-xs-12 col-md-2"
			>
				<q-select
					v-model="filterTypeModel"
					dense
					:options="filterTypeOptions"
					:label="$t('pbxConfig.seatsFiltersFilterByLabel')"
					:disable="loading"
				/>
			</div>
			<div
				class="col-xs-12 col-md-2"
			>
				<q-input
					v-if="filterType !== 'profile_id'"
					v-model="typedFilter"
					type="text"
					dense
					:disable="loading || filterType === null"
					:label="(filterType === null) ? $t('pbxConfig.seatsFilterInputLabel') : filterTypeModel.label"
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
							:disable="loading"
							@click="triggerFilter"
						/>
					</template>
				</q-input>
				<csc-pbx-model-select
					v-if="filterType === 'profile_id'"
					v-model="typedFilter"
					:profiles="deviceProfileList"
					:profile-map="deviceProfileMap"
					:disable="loading || filterType === null"
					dense
					@opened="$emit('model-select-opened')"
					@input="triggerFilter"
				/>
			</div>
		</div>
		<div
			class="row justify-center full-width q-gutter-x-sm"
		>
			<div
				class="col-xs-12 col-md-4"
			>
				<q-chip
					v-for="({ filterInfo, id }) in filtersList"
					:key="id"
					:label="filterInfo"
					:disable="false"
					icon="filter_alt"
					removable
					dense
					color="primary"
					text-color="dark"
					@remove="removeFilter(id)"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import _ from 'lodash'
import CscPbxModelSelect from '../PbxConfiguration/CscPbxModelSelect'
import { mapState } from 'vuex'

export default {
	name: 'CscPbxDeviceFilters',
	components: {
		CscPbxModelSelect
	},
	props: {
		loading: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			filterTypeModel: null,
			typedFilter: null,
			filters: []
		}
	},
	computed: {
		...mapState('pbx', [
			'deviceProfileMap',
			'deviceProfileList'
		]),
		filterType () {
			return this.filterTypeModel && this.filterTypeModel.value
		},
		filterTypeOptions () {
			return [
				{
					label: this.$t('pbxConfig.deviceStationName'),
					value: 'station_name'
				},
				{
					label: this.$t('pbxConfig.deviceIdentifier'),
					value: 'identifier'
				},
				{
					label: this.$t('pbxConfig.deviceModel'),
					value: 'profile_id'
				},
				{
					label: this.$t('pbxConfig.extension'),
					value: 'pbx_extension'
				},
				{
					label: this.$t('pbxConfig.queueExtensionName'),
					value: 'display_name'
				}
			]
		},
		filtersList () {
			return this.filters.map((filterItem) => {
				let filterDisplayValue = filterItem.value
				if (filterItem.name === 'profile_id') {
					filterDisplayValue = this.deviceProfileMap[filterItem.value].name
				}
				return {
					id: filterItem.name,
					filterInfo: this.filterTypeOptions.find(option => option.value === filterItem.name).label + ': ' + filterDisplayValue
				}
			})
		}
	},
	watch: {
		filterTypeModel () {
			this.typedFilter = null
		}
	},
	methods: {
		triggerFilter (data) {
			this.addFilter(this.filterTypeModel?.value, this.typedFilter)
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
				this.typedFilter = null
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

			// a special fix because of q-select behaviour. it stores 0 for empty selection
			if (!params.profile_id) {
				delete params.profile_id
			}

			this.$emit('filter', params)
		}
	}
}
</script>
