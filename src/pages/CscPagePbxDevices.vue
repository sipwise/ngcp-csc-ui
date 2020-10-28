<template>
	<csc-page
		class="q-pa-lg"
	>
		<csc-list-actions
			class="row justify-center q-mb-xs"
		>
			<csc-list-action-button
				v-if="isDeviceAddFormDisabled"
				slot="slot1"
				icon="add"
				color="primary"
				:label="$t('pbxConfig.addDevice')"
				:disable="isDeviceListRequesting || isDeviceRemoving || isDeviceUpdating"
				@click="enableAddForm"
			/>
			<csc-list-action-button
				v-if="!filtersEnabled"
				slot="slot2"
				icon="filter_alt"
				color="primary"
				:label="$t('pbxConfig.filterDevices')"
				:disable="isDeviceListRequesting || isDeviceCreating || isDeviceRemoving || isDeviceUpdating"
				@click="enableFilters"
			/>
			<csc-list-action-button
				v-if="filtersEnabled"
				slot="slot2"
				icon="clear"
				color="negative"
				:label="$t('pbxConfig.closeFilters')"
				:disable="isDeviceListRequesting || isDeviceCreating || isDeviceRemoving || isDeviceUpdating"
				@click="closeFilters"
			/>
		</csc-list-actions>
		<q-separator class="q-mb-xs" />
		<q-slide-transition>
			<div
				v-if="!isDeviceAddFormDisabled"
				class="row justify-center q-mb-lg"
			>
				<csc-pbx-device-add-form
					class="csc-list-form col-xs-12 col-md-6"
					:loading="isDeviceCreating"
					:profiles="deviceProfileList"
					:profile-map="deviceProfileMap"
					:model-image-map="deviceModelImageMap"
					@cancel="disableDeviceAddForm"
					@submit="createDevice"
					@model-select-opened="loadDeviceModels('front_thumb')"
				/>
			</div>
		</q-slide-transition>
		<q-slide-transition>
			<csc-pbx-device-filters
				v-if="hasFilters || filtersEnabled"
				:loading="isDeviceListRequesting"
				class="q-pb-md"
				@filter="applyFilter"
				@model-select-opened="loadDeviceModels('front_thumb')"
			/>
		</q-slide-transition>
		<div
			v-if="isDeviceListPaginationActive"
			class="row justify-center"
		>
			<q-pagination
				:value="deviceListCurrentPage"
				:max="deviceListLastPage"
				@input="loadDeviceListItemsFiltered"
			/>
		</div>
		<csc-list-spinner
			v-if="isDeviceListRequesting && !(isDeviceCreating || isDeviceRemoving || isDeviceUpdating)"
		/>
		<csc-list
			v-if="!isDeviceListEmpty && deviceListVisibility === 'visible'"
		>
			<csc-fade
				v-for="(device, index) in deviceListItems"
				:key="'csc-fade-' + device.id"
			>
				<csc-pbx-device
					:key="device.id"
					:odd="(index % 2) === 0"
					:expanded="isDeviceExpanded(device.id)"
					:loading="isDeviceLoading(device.id)"
					:device="device"
					:profile="deviceProfileMap[device.profile_id]"
					:profiles="deviceProfileList"
					:profile-map="deviceProfileMap"
					:model="deviceModelMap[deviceProfileMap[device.profile_id].device_id]"
					:model-image="deviceModelImageMap[deviceProfileMap[device.profile_id].device_id]"
					:model-image-map="deviceModelImageMap"
					:subscribers="subscriberList"
					:subscriber-map="subscriberMap"
					:subscribers-loading="isSubscribersRequesting"
					:subscriber-options="getSubscriberOptions"
					@load-model="loadDeviceModel({
						type: 'all',
						deviceId: deviceProfileMap[device.profile_id].device_id
					})"
					@expand="expandDevice(device.id)"
					@collapse="collapseDevice"
					@expanded="deviceExpanded"
					@remove="openDeviceRemovalDialog(device.id)"
					@save-station-name="setDeviceStationName"
					@save-identifier="setDeviceIdentifier"
					@save-profile="setDeviceProfile"
					@save-keys="setDeviceKeys"
					@model-select-opened="loadDeviceModels('front_thumb')"
				/>
			</csc-fade>
		</csc-list>
		<div
			v-if="isDeviceListEmpty && !isDeviceListRequesting && hasFilters"
			class="row justify-center csc-no-entities"
		>
			{{ $t('pbxConfig.noDevicesFound') }}
		</div>
		<div
			v-else-if="isDeviceListEmpty && !isDeviceListRequesting"
			class="row justify-center csc-no-entities"
		>
			{{ $t('pbxConfig.noDevicesCreated') }}
		</div>
		<csc-remove-dialog
			ref="removeDialog"
			:title="$t('pbxConfig.removeDeviceTitle')"
			:message="getDeviceRemoveDialogMessage"
			@remove="removeDevice(deviceRemoving.id)"
			@cancel="closeDeviceRemovalDialog"
		/>
	</csc-page>
</template>

<script>
import {
	mapState,
	mapActions,
	mapGetters,
	mapMutations
} from 'vuex'
import CscPage from 'components/CscPage'
import CscList from 'components/CscList'
import CscPbxDevice from 'components/pages/PbxConfiguration/CscPbxDevice'
import CscFade from 'components/transitions/CscFade'
import CscListSpinner from 'components/CscListSpinner'
import CscListActions from 'components/CscListActions'
import CscListActionButton from 'components/CscListActionButton'
import CscPbxDeviceFilters from 'components/pages/PbxConfiguration/CscPbxDeviceFilters'
import CscPbxDeviceAddForm from 'components/pages/PbxConfiguration/CscPbxDeviceAddForm'
import CscRemoveDialog from 'components/CscRemoveDialog'
import {
	showGlobalError,
	showToast
} from 'src/helpers/ui'
import {
	CreationState,
	RequestState
} from 'src/store/common'
export default {
	name: 'CscPbxDevices',
	components: {
		CscRemoveDialog,
		CscPbxDeviceAddForm,
		CscPbxDeviceFilters,
		CscListActions,
		CscListActionButton,
		CscFade,
		CscPage,
		CscList,
		CscPbxDevice,
		CscListSpinner
	},
	data () {
		return {
			stationNameFilter: null,
			identifierFilter: null,
			profileFilter: null,
			filtersEnabled: false
		}
	},
	computed: {
		...mapState('pbx', [
			'deviceProfileMap',
			'deviceProfileList',
			'deviceModelList',
			'deviceModelMap',
			'deviceModelImageMap',
			'subscriberList',
			'subscriberMap'
		]),
		...mapGetters('pbx', [
			'getSubscriberOptions',
			'isSubscribersRequesting'
		]),
		...mapState('pbxDevices', [
			'deviceRemoving',
			'deviceListItems',
			'deviceListCurrentPage',
			'deviceListLastPage',
			'deviceListVisibility',
			'deviceCreationState',
			'deviceUpdateState',
			'deviceRemovalState'
		]),
		...mapGetters('pbxDevices', [
			'isDeviceListEmpty',
			'isDeviceListRequesting',
			'isDeviceExpanded',
			'isDeviceListPaginationActive',
			'isDeviceAddFormDisabled',
			'isDeviceCreating',
			'isDeviceUpdating',
			'isDeviceRemoving',
			'isDeviceLoading',
			'getDeviceRemoveDialogMessage',
			'getDeviceCreationToastMessage',
			'getDeviceUpdateToastMessage',
			'getDeviceRemovalToastMessage'
		]),
		hasFilters () {
			return this.stationNameFilter !== null ||
				this.identifierFilter !== null ||
				this.profileFilter !== null
		}
	},
	watch: {
		deviceCreationState (state) {
			if (state === CreationState.created) {
				this.$scrollTo(this.$parent.$el)
				showToast(this.getDeviceCreationToastMessage)
			} else if (state === CreationState.error) {
				showGlobalError(this.deviceCreationError)
			}
		},
		deviceUpdateState (state) {
			if (state === RequestState.succeeded) {
				showToast(this.getDeviceUpdateToastMessage)
			} else if (state === RequestState.failed) {
				showGlobalError(this.deviceUpdateError)
			}
		},
		deviceRemovalState (state) {
			if (state === RequestState.succeeded) {
				this.$scrollTo(this.$parent.$el)
				showToast(this.getDeviceRemovalToastMessage)
			} else if (state === RequestState.failed) {
				showGlobalError(this.deviceRemovalError)
			}
		}
	},
	mounted () {
		this.$scrollTo(this.$parent.$el)
		this.loadDeviceListItemsFiltered()
	},
	methods: {
		...mapActions('pbx', [
			'loadDeviceModel',
			'loadDeviceModels',
			'loadSubscribers'
		]),
		...mapMutations('pbxDevices', [
			'expandDevice',
			'collapseDevice',
			'enableDeviceAddForm',
			'disableDeviceAddForm',
			'deviceRemovalRequesting',
			'deviceRemovalCanceled'
		]),
		...mapActions('pbxDevices', [
			'loadDeviceListItems',
			'createDevice',
			'removeDevice',
			'setDeviceStationName',
			'setDeviceIdentifier',
			'setDeviceProfile',
			'setDeviceKeys'
		]),
		loadDeviceListItemsFiltered (page) {
			this.loadDeviceListItems({
				page: page || 1,
				stationNameFilter: this.stationNameFilter,
				identifierFilter: this.identifierFilter,
				profileFilter: this.profileFilter
			})
		},
		enableAddForm () {
			this.enableDeviceAddForm()
			this.closeFilters()
		},
		enableFilters () {
			this.filtersEnabled = true
			this.disableDeviceAddForm()
		},
		applyFilter (filterData) {
			this.stationNameFilter = filterData.stationNameFilter
			this.identifierFilter = filterData.identifierFilter
			this.profileFilter = filterData.profileFilter ? Number(filterData.profileFilter) : null
			this.loadDeviceListItemsFiltered()
		},
		closeFilters () {
			this.filtersEnabled = false
			this.resetFilters()
		},
		resetFilters () {
			if (this.stationNameFilter !== null ||
				this.identifierFilter !== null ||
				this.profileFilter !== null) {
				this.stationNameFilter = null
				this.identifierFilter = null
				this.profileFilter = null
				this.loadDeviceListItemsFiltered()
			}
		},
		deviceExpanded () {
			this.loadSubscribers()
		},
		openDeviceRemovalDialog (deviceId) {
			if (this.$refs.removeDialog) {
				this.deviceRemovalRequesting(deviceId)
				this.$refs.removeDialog.open()
			}
		},
		closeDeviceRemovalDialog () {
			this.deviceRemovalCanceled()
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
