<template>
    <csc-page
        class="csc-list-page"
    >
        <q-list
            no-border
            separator
            sparse
            multiline
        >
            <q-item>
                <q-item-main>
                    <csc-pbx-device-add-form
                        ref="deviceAddForm"
                        :profiles="profiles"
                        :modelImages="modelImages"
                        :loading="createDeviceRequesting"
                        @remove="removeDevice"
                        @modelSelectOpened="modelSelectOpened()"
                        @save="saveDevice"
                    />
                    <csc-pbx-model-select
                        :erasable="true"
                        :profiles="profiles"
                        :modelImages="modelImages"
                        :label="$t('pbxConfig.filterPhoneModel')"
                        @opened="modelSelectOpened()"
                        @select="filterByProfile"
                        @reseted="resetFilter" />
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
                        <q-spinner-dots
                            color="primary"
                            :size="40"
                        />
                    </div>
                </q-item-main>
            </q-item>
            <csc-pbx-device
                v-for="device in devices"
                :key="device.id"
                :device="device"
                :loading="isDeviceLoading(device.id)"
                :groupsAndSeatsOptions="groupsAndSeatsOptions"
                :subscribers="getGroupOrSeatById"
                @remove="removeDevice"
                @loadGroupsAndSeats="loadGroupsAndSeats()"
                @deviceKeysChanged="deviceKeysChanged"
                @save-station-name="setStationName"
            />
        </q-list>
        <div
            v-if="devices.length === 0 && !isListRequesting"
            class="row justify-center csc-no-entities"
        >
            {{ noDeviceMessage }}
        </div>
    </csc-page>
</template>

<script>
    import { mapGetters } from 'vuex'
    import CscPage  from '../../CscPage'
    import CscPbxDevice from './CscPbxDevice'
    import CscPbxDeviceAddForm from './CscPbxDeviceAddForm'
    import CscPbxModelSelect from './CscPbxModelSelect'
    import { QSpinnerDots, QPagination, QList, Dialog, QItem, QItemMain, QBtn, QSelect } from 'quasar-framework'
    import { showToast, showGlobalError } from '../../../helpers/ui'

    export default {
        data () {
            return {
                profile: null,
                platform: this.$q.platform.is
            }
        },
        mounted() {
            this.listDevices();
            this.$store.dispatch('pbxConfig/loadProfiles');
        },
        components: {
            CscPage,
            CscPbxDevice,
            CscPbxDeviceAddForm,
            CscPbxModelSelect,
            QSpinnerDots,
            QPagination,
            QList,
            Dialog,
            QItem,
            QBtn,
            QSelect,
            QItemMain
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
                'groupsAndSeats',
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
                'updatedDeviceError'
            ]),
            noDeviceMessage() {
                if (this.profile) {
                    return this.$t('pbxConfig.noModel');
                }
                else {
                    return this.$t('pbxConfig.noDevices');
                }
            }
        },
        methods: {
            filterByProfile(profile) {
                this.profile = profile;
                this.$store.dispatch('pbxConfig/listDevices', {
                    page: this.listCurrentPage,
                    profile_id: profile.id
                });
            },
            resetFilter() {
                this.profile = null;
                this.$store.dispatch('pbxConfig/listDevices', {
                    page: 1,
                    profile_id: null
                });
            },
            changePage(page) {
                let profileId = null;
                if(this.profile !== null) {
                    profileId = this.profile.id;
                }
                this.$store.dispatch('pbxConfig/listDevices', {
                    page: page,
                    profile_id: profileId
                });
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
            removeDevice(device) {
                var store = this.$store;
                var i18n = this.$i18n;
                Dialog.create({
                    title: i18n.t('pbxConfig.removeDeviceTitle'),
                    message: i18n.t('pbxConfig.removeDeviceText', { device: device.station_name }),
                    buttons: [
                        'Cancel',
                        {
                            label: i18n.t('pbxConfig.removeDevice'),
                            color: 'negative',
                            handler () {
                                store.dispatch('pbxConfig/removeDevice', device);
                            }
                        }
                    ]
                });
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
                    showToast(this.$t('pbxConfig.toasts.updatedStationName', {
                        name: this.updatedDevice.station_name
                    }));
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
</style>
