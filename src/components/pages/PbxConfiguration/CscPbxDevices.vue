<template>
    <csc-page
        :is-list="true"
    >
        <div
            class="row justify-center">
            <q-btn
                v-if="!formEnabled"
                flat
                icon="add"
                color="primary"
                @click="showForm()"
            >{{ addButtonLabel }}</q-btn>
            <q-btn
                v-if="!filterEnabled"
                flat
                icon="fa-filter"
                color="primary"
                @click="toggleFilter()"
            >{{ filterButtonLabel }}</q-btn>
        </div>

        <div v-if="filterEnabled" class="csc-form csc-list-form">
            <div :class="filterClasses">
                <q-field
                    class="col-xs-12 col-md-4 col-lg-2">
                    <q-input
                        dark
                        v-if="listStationNameFilter == null"
                        v-model="filterStationNameInput"
                        :float-label="$t('pbxConfig.filterStationName')"
                        @keyup.enter="filterByStationName()"
                        :after="searchButtonStationName"
                    />
                    <q-chip
                        class="full-width csc-search-criteria"
                        v-if="listStationNameFilter != null"
                        color="primary"
                    >{{ listStationNameFilter }}
                        <q-icon
                            size="26px"
                            class="csc-chip-remove absolute-right cursor-pointer"
                            name="fa-times-circle"
                            @click="resetStationNameFilter()"
                        />
                    </q-chip>
                </q-field>
                <q-field
                    class="col-xs-12 col-md-4 col-lg-2">
                    <q-input
                        dark
                        v-if="listMacAddressFilter == null"
                        v-model="filterMacAddressInput"
                        :float-label="$t('pbxConfig.filterMacAddress')"
                        @keyup.enter="filterByMacAddress()"
                        :after="searchButtonMacAddress"
                    />
                    <q-chip
                        class="full-width csc-search-criteria"
                        v-if="listMacAddressFilter != null"
                        color="primary"
                    >{{ listMacAddressFilter }}
                        <q-icon
                            size="26px"
                            class="csc-chip-remove absolute-right cursor-pointer"
                            name="fa-times-circle"
                            @click="resetMacAddressFilter()"
                        />
                    </q-chip>
                </q-field>
                <q-field
                    class="col-xs-12 col-md-4 col-lg-2">
                    <csc-pbx-model-select
                        v-if="listProfileFilter == null"
                        :preview="false"
                        :erasable="false"
                        :profiles="profiles"
                        :modelImages="modelImages"
                        :label="$t('pbxConfig.filterPhoneModel')"
                        @opened="modelSelectOpened()"
                        @select="filterByProfile"
                    />
                    <q-chip
                        class="full-width csc-search-criteria"
                        v-if="listProfileFilter != null"
                        :avatar="profileUrl"
                        color="primary"
                    >{{ profileName }}
                        <q-icon
                            size="26px"
                            class="csc-chip-remove absolute-right cursor-pointer"
                            name="fa-times-circle"
                            @click="resetProfileFilter()"
                        />
                    </q-chip>
                </q-field>
            </div>
            <div
                class="row justify-center form-actions"
            >
                <q-btn
                    v-if="filterEnabled"
                    flat
                    icon="clear"
                    color="default"
                    @click="closeFilter()"
                >{{ $t('pbxConfig.closeFilters') }}</q-btn>
                <q-btn
                    v-if="filterEnabled"
                    flat
                    icon="fa-filter"
                    color="negative"
                    @click="resetFilter()"
                    :disable="!hasFilters"
                >{{ $t('pbxConfig.resetFilters') }}</q-btn>
            </div>
        </div>

        <div
            v-if="formEnabled"
            class="row justify-center csc-form">
            <csc-pbx-device-add-form
                class="col col-md-6 col-sm-12 csc-list-form"
                v-if="formEnabled"
                ref="deviceAddForm"
                :profiles="profiles"
                :modelImages="modelImages"
                :loading="createDeviceRequesting"
                @remove="removeDeviceDialog"
                @modelSelectOpened="modelSelectOpened()"
                @save="saveDevice"
                @cancelForm="cancelForm"
            />
        </div>

        <div
            v-if="devices.length > 0 && !isListRequesting && listLastPage > 1"
            class="row justify-center"
        >
            <q-pagination
                :value="listCurrentPage"
                :max="listLastPage"
                @change="changePage"
            />
        </div>

        <div
            v-if="isListLoadingVisible"
            class="row justify-center"
        >
            <csc-spinner />
        </div>

        <q-list
            no-border
            multiline
            striped-odd
            :highlight="!isMobile"
        >
            <csc-pbx-device
                class="csc-list-item"
                v-for="device in devices"
                :key="device.id"
                :device="device"
                :loading="isDeviceLoading(device.id)"
                :groupsAndSeatsOptions="groupsAndSeatsOptions"
                :subscribers="getGroupOrSeatById"
                :profiles="profiles"
                :modelImages="modelImages"
                @remove="removeDeviceDialog"
                @loadGroupsAndSeats="loadGroupsAndSeats()"
                @deviceKeysChanged="deviceKeysChanged"
                @save-station-name="setStationName"
                @save-identifier="setIdentifier"
                @update-profile="updateProfile"
            />
        </q-list>
        <div
            v-if="devices.length === 0 && !isListRequesting"
            class="row justify-center csc-no-entities"
        >
            {{ noDeviceMessage }}
        </div>
        <csc-remove-dialog
            ref="removeDialog"
            :title="$t('pbxConfig.removeDeviceTitle')"
            :message="removeDialogMessage"
            @remove="removeDevice"
        />
    </csc-page>
</template>

<script>
    import _ from 'lodash'
    import { mapGetters } from 'vuex'
    import CscPage  from '../../CscPage'
    import CscPbxDevice from './CscPbxDevice'
    import CscPbxDeviceAddForm from './CscPbxDeviceAddForm'
    import CscPbxModelSelect from './CscPbxModelSelect'
    import CscRemoveDialog from '../../CscRemoveDialog'
    import { showToast, showGlobalError } from '../../../helpers/ui'
    import {
        QSpinnerDots,
        QPagination,
        QList,
        QItem,
        QItemMain,
        QBtn,
        QSelect,
        QField,
        QInput,
        QChip,
        QIcon,
        Platform
    } from 'quasar-framework'
    import CscSpinner from "../../CscSpinner";

    export default {
        data () {
            return {
                formEnabled: false,
                filterEnabled: false,
                filterStationNameInput: '',
                filterMacAddressInput: '',
                currentRemovingDevice: null
            }
        },
        mounted() {
            this.listDevices();
            this.$store.dispatch('pbxConfig/loadProfiles');
        },
        components: {
            CscSpinner,
            CscPage,
            CscPbxDevice,
            CscPbxDeviceAddForm,
            CscPbxModelSelect,
            CscRemoveDialog,
            QSpinnerDots,
            QPagination,
            QList,
            QItem,
            QBtn,
            QSelect,
            QItemMain,
            QField,
            QInput,
            QChip,
            QIcon
        },
        computed: {
            ...mapGetters('pbxConfig', [
                'devices',
                'profiles',
                'isListRequesting',
                'isListLoadingVisible',
                'listCurrentPage',
                'listLastPage',
                'isDeviceLoading',
                'deviceRemoved',
                'groupsAndSeatsOptions',
                'getGroupOrSeatById',
                'updatedDeviceKey',
                'createDeviceRequesting',
                'createDeviceSucceeded',
                'createDeviceFailed',
                'createDeviceError',
                'createDeviceItem',
                'profileOptions',
                'listProfilesState',
                'listProfilesError',
                'modelImages',
                'updatedDevice',
                'updatedDeviceSucceeded',
                'updatedDeviceError',
                'updatedDeviceProperty',
                'listProfileFilter',
                'listProfileFilterObject',
                'listMacAddressFilter',
                'listStationNameFilter'
            ]),
            isMobile() {
                return Platform.is.mobile;
            },
            noDeviceMessage() {
                if (this.listProfileFilter && !this.listMacAddressFilter && !this.listStationNameFilter) {
                    return this.$t('pbxConfig.noModel');
                }
                else if (this.listMacAddressFilter && !this.listProfileFilter && !this.listStationNameFilter) {
                    return this.$t('pbxConfig.noMacAddress')
                }
                else if (this.listStationNameFilter && !this.listProfileFilter && !this.listMacAddressFilter) {
                    return this.$t('pbxConfig.noStationName');
                }
                if (this.listMacAddressFilter && this.listProfileFilter && this.listStationNameFilter ||
                    this.listMacAddressFilter && this.listProfileFilter && !this.listStationNameFilter ||
                    this.listMacAddressFilter && !this.listProfileFilter && this.listStationNameFilter ||
                    !this.listMacAddressFilter && this.listProfileFilter && this.listStationNameFilter
                ) {
                    return this.$t('pbxConfig.noDevicesFound');
                }
                else if (this.devices.length === 0) {
                    return this.$t('pbxConfig.noDevicesCreated');
                }
            },
            profileUrl() {
                return _.get(this.listProfileFilterObject, 'modelImage.url', null);
            },
            profileName() {
                return this.listProfileFilterObject.name;
            },
            hasFilters() {
                return this.listProfileFilterObject !== null ||
                    this.listMacAddressFilter !== null ||
                    this.listStationNameFilter !== null;
            },
            filterResetButtonLabel() {
                if(this.hasFilters) {
                    return this.$t('pbxConfig.resetFilters');
                }
                else {
                    return this.$t('pbxConfig.closeFilters');
                }
            },
            filterClasses() {
                let classes = ['row', 'justify-center'];
                if(!this.isMobile) {
                    classes.push('sm-gutter');
                }
                return classes;
            },
            addButtonLabel() {
                if(this.isMobile) {
                    return this.$t('pbxConfig.addDeviceShort');
                }
                else {
                    return this.$t('pbxConfig.addDevice');
                }
            },
            filterButtonLabel() {
                if(this.isMobile) {
                    return this.$t('pbxConfig.filterDevicesShort');
                }
                else {
                    return this.$t('pbxConfig.filterDevices');
                }
            },
            searchButtonStationName() {
                let self = this;
                return [
                    {
                        icon: 'search',
                        error: false,
                        handler (event) {
                            event.stopPropagation();
                            self.filterByStationName();
                        }
                    }
                ];
            },
            searchButtonMacAddress() {
                let self = this;
                return [
                    {
                        icon: 'search',
                        error: false,
                        handler (event) {
                            event.stopPropagation();
                            self.filterByMacAddress();
                        }
                    }
                ];
            },
            removeDialogMessage() {
                if (this.currentRemovingDevice !== null) {
                    return this.$t('pbxConfig.removeDeviceText', {
                        device: this.currentRemovingDevice.station_name
                    });
                }
            }
        },
        methods: {
            changePage(page) {
                this.$store.dispatch('pbxConfig/goToPage', page);
            },
            loadDevice(id) {
                this.$store.dispatch('pbxConfig/loadDevice', id);
            },
            modelSelectOpened() {
                this.$store.dispatch('pbxConfig/loadProfiles');
            },
            saveDevice(device) {
                this.$store.dispatch('pbxConfig/createDevice', device);
            },
            removeDevice() {
                this.$store.dispatch('pbxConfig/removeDevice', this.currentRemovingDevice);
            },
            loadGroupsAndSeats() {
                this.$store.dispatch('pbxConfig/getAllGroupsAndSeats');
            },
            deviceKeysChanged(data) {
                this.$store.dispatch('pbxConfig/updateDeviceKeys', data);
            },
            listDevices() {
                this.$store.dispatch('pbxConfig/listDevices', {
                    page: 1
                });
            },
            setStationName(device) {
                this.$store.dispatch('pbxConfig/setStationName', device);
            },
            setIdentifier(device) {
                this.$store.dispatch('pbxConfig/setIdentifier', device);
            },
            updateProfile(data) {
                this.$store.dispatch('pbxConfig/setProfile', data);
            },
            showForm() {
                if(this.filterEnabled) {
                    this.closeFilter();
                }
                this.formEnabled = true;
            },
            cancelForm() {
                this.formEnabled = false;
            },
            toggleFilter() {
                if(this.formEnabled && !this.filterEnabled) {
                    this.cancelForm();
                }
                this.filterEnabled = !this.filterEnabled;
            },
            resetFilter() {
                this.filterStationNameInput = '';
                this.filterMacAddressInput = '';
                if(this.hasFilters) {
                    this.resetFilters();
                }
            },
            closeFilter() {
                this.filterEnabled = false;
                this.resetFilter();
            },
            filterByStationName() {
                this.$store.dispatch('pbxConfig/filterByStationName', this.filterStationNameInput);
                this.filterStationNameInput = '';
            },
            resetStationNameFilter() {
                this.filterStationNameInput = this.listStationNameFilter;
                this.$store.dispatch('pbxConfig/resetStationNameFilter');
            },
            filterByMacAddress() {
                this.$store.dispatch('pbxConfig/filterByMacAddress', this.filterMacAddressInput);
                this.filterMacAddressInput = '';
            },
            resetMacAddressFilter() {
                this.filterMacAddressInput = this.listMacAddressFilter;
                this.$store.dispatch('pbxConfig/resetMacAddressFilter');
            },
            filterByProfile(profile) {
                this.$store.dispatch('pbxConfig/filterByProfile', profile);
            },
            resetProfileFilter() {
                this.$store.dispatch('pbxConfig/resetProfileFilter');
            },
            resetFilters() {
                this.$store.dispatch('pbxConfig/resetDeviceFilters');
            },
            removeDeviceDialog(device) {
                this.currentRemovingDevice = device;
                this.$refs.removeDialog.open();
            }
        },
        watch: {
            deviceRemoved(device) {
                if(device !== null) {
                    showToast(this.$t('pbxConfig.toasts.removedDeviceToast', {
                        name: device.station_name
                    }));
                }
            },
            updatedDeviceKey(data) {
                if(data !== null) {
                    showToast(this.$t('pbxConfig.toasts.updatedDeviceKeys', {
                        name: data.device.station_name
                    }));
                }
            },
            createDeviceSucceeded(succeeded) {
                if(succeeded) {
                    this.$refs.deviceAddForm.disableForm();
                    showToast(this.$t('pbxConfig.toasts.createdDevice',{
                        name: this.createDeviceItem.station_name
                    }));
                }
            },
            createDeviceFailed(failed) {
                if(failed) {
                    showGlobalError(this.createDeviceError);
                }
            },
            listProfilesState(state) {
                if (state === 'failed') {
                    showGlobalError(this.listProfilesError);
                }
            },
            updatedDeviceSucceeded(succeeded) {
                if(succeeded === true) {
                    switch (this.updatedDeviceProperty) {
                        case 'profile_id':
                            showToast(this.$t('pbxConfig.toasts.updatedProfile', {
                                name: this.updatedDevice.station_name
                            }));
                            break;
                        case 'station_name':
                            showToast(this.$t('pbxConfig.toasts.updatedStationName', {
                                name: this.updatedDevice.station_name
                            }));
                            break;
                        case 'identifier':
                            showToast(this.$t('pbxConfig.toasts.updatedIdentifier', {
                                identifier: this.updatedDevice.identifier
                            }));
                            break;
                    }
                }
            },
            updatedDeviceError(err) {
                if (err !== null) {
                    showGlobalError(err);
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .filter-model-select
        margin 16px 16px 8px 16px

    .q-chip.csc-search-criteria
        position relative
        .q-chip-main
            text-overflow ellipsis
            white-space: nowrap;
            width 100%
            overflow hidden
            padding-right 18px

        .csc-chip-remove
            right 6px

        .q-chip-side
            background-color white
            position relative
            img
                position absolute
                display block
                top 0

    .form-actions
        margin-top 16px
        margin-bottom 8px

    .csc-form
        .q-field
            margin-bottom 0
</style>
