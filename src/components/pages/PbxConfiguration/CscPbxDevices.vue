<template>
    <csc-page
        :title="$t('pbxConfig.devicesTitle')"
        class="csc-list-page"
    >
        <q-select
            v-model="profile"
            :float-label="$t('pbxConfig.filterPhoneModel')"
            :options="profileOptions"
            @change="filterByProfile"
            :after="modelButtons"
            :class="{ 'filter-model-select': this.platform.mobile }"
        />
        <div
            v-if="isListLoadingVisible"
            class="row justify-center"
        >
            <q-spinner-dots
                color="primary"
                :size="40"
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
        <q-list
            no-border
            separator
            sparse
            multiline
        >
            <q-item> </q-item>
            <csc-pbx-device
                v-for="device in devices"
                :key="device.id"
                :device="device"
                @remove="removeDevice"
                :modelOptions="modelOptions"
                :loading="isDeviceLoading(device.id)"
                :groupsAndSeatsOptions="groupsAndSeatsOptions"
                :subscribers="getGroupOrSeatById"
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
    import {
        showGlobalError,
        showToast
    } from '../../../helpers/ui'
    import {
        QSpinnerDots,
        QPagination,
        QList,
        Dialog,
        QItem,
        QSelect
    } from 'quasar-framework'
    import itemError from '../../../mixins/item-error'

    export default {
        mixins: [itemError],
        data () {
            return {
                profile: null,
                platform: this.$q.platform.is
            }
        },
        mounted() {
            this.listDevices();
            this.$store.dispatch('pbxConfig/listProfiles');
        },
        components: {
            CscPage,
            CscPbxDevice,
            QSpinnerDots,
            QPagination,
            QList,
            Dialog,
            QItem,
            QSelect
        },
        computed: {
            ...mapGetters('pbxConfig', [
                'devices',
                'modelOptions',
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
                'profileOptions',
                'listProfilesState',
                'listProfilesError',
                'updatedStationName'
            ]),
            noDeviceMessage() {
                if (this.profile) {
                    return this.$t('pbxConfig.noModel');
                }
                else {
                    return this.$t('pbxConfig.noDevices');
                }
            },
            modelButtons() {
                let self = this;
                let buttons = [];
                if (this.profile) {
                    buttons = [{
                        icon: 'clear',
                        error: false,
                        handler (event) {
                            event.stopPropagation();
                            self.resetFilter();
                        }
                    }];
                }
                return buttons;
            }
        },
        methods: {
            resetFilter() {
                this.profile = null;
                this.listDevices();
            },
            filterByProfile(profile) {
                this.$store.dispatch('pbxConfig/filterDevices', {
                    profile_id: profile
                });
            },
            changePage(page) {
                this.$store.dispatch('pbxConfig/listDevices', {
                    page: page
                });
            },
            loadDevice(id) {
                this.$store.dispatch('pbxConfig/loadDevice', id);
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
            listProfilesState(state) {
                if (state === 'failed') {
                    showGlobalError(this.listProfilesError);
                }
            },
            updatedStationName(data) {
                console.log('updatedStationName', data);
                if(data !== null) {
                    showToast(this.$t('pbxConfig.toasts.updatedStationName', {
                        name: data.station_name
                    }));
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">

    .filter-model-select
        margin 16px 16px 8px 16px

</style>
