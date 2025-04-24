<template>
    <csc-page
        id="csc-page-pbx-devices"
        class="q-pa-lg"
    >
        <csc-list-actions
            class="row justify-center q-mb-xs"
        >
            <template
                v-if="isDeviceAddFormDisabled"
                #slot1
            >
                <csc-list-action-button
                    icon="add"
                    color="primary"
                    :label="$t('Add device')"
                    :disable="isDeviceListRequesting || isDeviceRemoving || isDeviceUpdating"
                    @click="enableAddForm"
                />
            </template>
            <template
                #slot2
            >
                <csc-list-action-button
                    v-if="!filtersEnabled"
                    icon="filter_alt"
                    color="primary"
                    :label="$t('Filter devices')"
                    :disable="isDeviceListRequesting || isDeviceCreating || isDeviceRemoving || isDeviceUpdating"
                    @click="enableFilters"
                />
                <csc-list-action-button
                    v-if="filtersEnabled"
                    icon="clear"
                    color="negative"
                    :label="$t('Close filters')"
                    :disable="isDeviceListRequesting || isDeviceCreating || isDeviceRemoving || isDeviceUpdating"
                    @click="closeFilters"
                />
            </template>
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
                :model-value="deviceListCurrentPage"
                :max="deviceListLastPage"
                @update:model-value="loadDeviceListFiltered"
            />
        </div>
        <csc-list-spinner
            v-if="isDeviceListRequesting && !(isDeviceCreating || isDeviceRemoving || isDeviceUpdating)"
        />
        <q-list
            v-if="!isDeviceListEmpty && deviceListVisibility === 'visible'"
            class="row justify-start items-start"
        >
            <csc-fade
                v-for="(device, index) in deviceList"
                :key="'csc-fade-' + device.id"
            >
                <csc-pbx-device
                    :key="device.id"
                    :loading="isDeviceLoading(device.id) || isDeviceListRequesting"
                    :device="device"
                    :class="'col-xs-12 col-md-6 col-lg-4 csc-item-' + ((index % 2 === 0)?'odd':'even')"
                    :profile="deviceProfileMap[device.profile_id]"
                    :model="deviceModelMap[deviceProfileMap[device.profile_id].device_id]"
                    :model-image="deviceModelImageMap[deviceProfileMap[device.profile_id].device_id]"
                    @load-model="loadDeviceModel({
                        type: 'all',
                        deviceId: deviceProfileMap[device.profile_id].device_id
                    })"
                    @remove="openDeviceRemovalDialog(device.id)"
                />
            </csc-fade>
        </q-list>
        <div
            v-if="isDeviceListEmpty && !isDeviceListRequesting && hasFilters"
            class="row justify-center csc-no-entities"
        >
            {{ $t('Could not find any device matching any of the filter criteria') }}
        </div>
        <div
            v-else-if="isDeviceListEmpty && !isDeviceListRequesting"
            class="row justify-center csc-no-entities"
        >
            {{ $t('No devices created yet') }}
        </div>
        <csc-remove-dialog
            ref="removeDialog"
            :title="$t('Remove device')"
            :message="getDeviceRemoveDialogMessage"
            @remove="removeDevice(deviceRemoving.id)"
            @cancel="closeDeviceRemovalDialog"
        />
    </csc-page>
</template>

<script>
import CscListActionButton from 'components/CscListActionButton'
import CscListActions from 'components/CscListActions'
import CscListSpinner from 'components/CscListSpinner'
import CscPage from 'components/CscPage'
import CscRemoveDialog from 'components/CscRemoveDialog'
import CscPbxDevice from 'components/pages/PbxConfiguration/CscPbxDevice'
import CscPbxDeviceAddForm from 'components/pages/PbxConfiguration/CscPbxDeviceAddForm'
import CscPbxDeviceFilters from 'components/pages/PbxConfiguration/CscPbxDeviceFilters'
import CscFade from 'components/transitions/CscFade'
import { showGlobalError, showToast } from 'src/helpers/ui'
import { CreationState, RequestState } from 'src/store/common'
import {
    mapActions,
    mapGetters,
    mapMutations,
    mapState
} from 'vuex'
export default {
    name: 'CscPagePbxDevices',
    components: {
        CscRemoveDialog,
        CscPbxDeviceAddForm,
        CscPbxDeviceFilters,
        CscListActions,
        CscListActionButton,
        CscFade,
        CscPage,
        CscPbxDevice,
        CscListSpinner
    },
    data () {
        return {
            filters: {},
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
            'deviceList',
            'deviceListCurrentPage',
            'deviceListLastPage',
            'deviceListVisibility',
            'deviceCreationState',
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
            return Object.keys(this.filters).length > 0
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
        this.loadDeviceListFiltered()
        this.loadDevicePreferencesList()
    },
    methods: {
        ...mapActions('pbx', [
            'loadDeviceModel',
            'loadDeviceModels'
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
            'loadDeviceList',
            'loadDevicePreferencesList',
            'createDevice',
            'removeDevice',
            'setDeviceStationName',
            'setDeviceIdentifier',
            'setDeviceProfile',
            'setDeviceKeys'
        ]),
        loadDeviceListFiltered (page) {
            this.loadDeviceList({
                page: page || 1,
                filters: this.filters
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
            this.filters = filterData
            this.loadDeviceListFiltered()
        },
        closeFilters () {
            this.filtersEnabled = false
            this.resetFilters()
        },
        resetFilters () {
            if (this.hasFilters) {
                this.filters = {}
                this.loadDeviceListFiltered()
            }
        },
        openDeviceRemovalDialog (deviceId) {
            if (this.$refs.removeDialog) {
                this.deviceRemovalRequesting(deviceId)
                this.$refs.removeDialog.show()
            }
        },
        closeDeviceRemovalDialog () {
            this.deviceRemovalCanceled()
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">
</style>
