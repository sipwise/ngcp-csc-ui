<template>
	<div
		class="csc-pbx-device-filters"
	>
		<div
			class="csc-pbx-device-filter-inputs row justify-center sm-gutter items-end"
		>
			<csc-search-input
				:label="$t('pbxConfig.deviceStationName')"
				:phrase="stationNameFilter"
				:searching="loading"
				@search="filterStationName"
				@reset="resetStationName"
			/>
			<csc-search-input
				:label="$t('pbxConfig.deviceIdentifier')"
				:phrase="identifierFilter"
				:searching="loading"
				@search="filterIdentifier"
				@reset="resetIdentifier"
			/>
			<csc-pbx-model-select
				:profile="profileFilter"
				:profiles="profiles"
				:profile-map="profileMap"
				:model-image-map="modelImageMap"
				:has-reset-button="true"
				@opened="$emit('model-select-opened')"
				@selected="filterProfile"
				@reset="resetProfile"
			/>
		</div>
		<div
			class="row justify-center"
		>
			<q-btn
				flat
				icon="clear"
				color="default"
				:disable="loading"
				:label="$t('pbxConfig.closeFilters')"
				@click="$emit('close-filters')"
			/>
			<q-btn
				flat
				icon="filter_alt"
				color="negative"
				:disable="loading"
				:label="$t('pbxConfig.resetFilters')"
				@click="$emit('reset-filters')"
			/>
		</div>
	</div>
</template>

<script>
import CscPbxModelSelect from '../PbxConfiguration/CscPbxModelSelect'
import CscSearchInput from '../../CscSearchInput'

export default {
	name: 'CscPbxDeviceFilters',
	components: {
		CscSearchInput,
		CscPbxModelSelect
	},
	props: {
		stationNameFilter: {
			type: String,
			default: ''
		},
		identifierFilter: {
			type: String,
			default: ''
		},
		profileFilter: {
			type: String,
			default: ''
		},
		profiles: {
			type: Array,
			default () {
				return []
			}
		},
		profileMap: {
			type: Object,
			default: null
		},
		modelImageMap: {
			type: Object,
			default: null
		},
		loading: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
		}
	},
	methods: {
		filterStationName (input) {
			if (input !== '') {
				this.$emit('filter-station-name', input)
			}
		},
		resetStationName () {
			this.$emit('reset-station-name')
		},
		filterIdentifier (input) {
			if (input !== '') {
				this.$emit('filter-identifier', input)
			}
		},
		resetIdentifier () {
			this.$emit('reset-identifier')
		},
		filterProfile (profile) {
			this.$emit('filter-profile', profile)
		},
		resetProfile () {
			this.$emit('reset-profile')
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-pbx-device-filters
        margin-bottom $flex-gutter-sm
    .csc-pbx-device-filter-inputs
        margin-bottom $flex-gutter-sm
</style>
