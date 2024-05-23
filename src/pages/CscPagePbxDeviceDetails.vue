<template>
    <csc-page-sticky-tabs
        id="csc-page-pbx-devices-details"
        ref="pageSticky"
        :value="selectedTab"
    >
        <template
            #tabs
        >
            <q-breadcrumbs
                class="q-item absolute absolute-left text-weight-light"
                active-color="primary"
                separator-color="primary"
            >
                <q-breadcrumbs-el
                    key="devices"
                    class="cursor-pointer"
                    to="/user/pbx-configuration/devices"
                    :label="$t('Devices')"
                    icon="fas fa-fax"
                />
                <q-breadcrumbs-el
                    v-if="deviceSelected"
                    key="device"
                    :label="deviceSelected.station_name"
                />
            </q-breadcrumbs>

            <q-tab
                v-for="tab in tabs"
                :key="tab.value"
                class="d-flex justify-content-center"
                :name="tab.value"
                :icon="tab.icon"
                :label="tab.label"
                :default="tab.value === selectedTab"
                @click="selectTab(tab.value)"
            />
        </template>

        <q-item
            v-if="selectedTab === 'preferences'"
            class="col col-xs-12 col-md-6"
        >
            <q-list
                v-if="changes"
                class="col-xs-12 col-md-6 q-mr-xl"
                side
                top
            >
                <q-input
                    v-model="changes.station_name"
                    :label="$t('Station name')"
                    :disable="isLoading"
                    @keyup.enter="save"
                >
                    <template
                        v-if="hasStationNameChanged"
                        #append
                    >
                        <csc-input-button-save
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            @click.stop="resetStationName"
                        />
                    </template>
                </q-input>
                <q-input
                    v-model="changes.identifier"
                    :disable="isLoading"
                    :label="$t('MAC address')"
                    @keyup.enter="save"
                >
                    <template
                        v-if="hasIdentifierChanged"
                        #append
                    >
                        <csc-input-button-save
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            @click.stop="resetIdentifier"
                        />
                    </template>
                </q-input>
                <csc-pbx-model-select
                    v-model="changes.profile_id"
                    :profiles="deviceProfileList"
                    :profile-map="deviceProfileMap"
                    :has-reset-button="false"
                    @opened="$emit('model-select-opened')"
                    @input="selectedProfile"
                >
                    <template
                        v-if="hasProfileChanged"
                        #append
                    >
                        <csc-input-button-save
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            @click.stop="resetProfile"
                        />
                    </template>
                </csc-pbx-model-select>
            </q-list>
            <q-list
                v-if="changes"
                class="col-xs-12 col-md-5 q-mr-xl"
                side
                top
            >
                <q-input
                    v-model="changes.admin_name"
                    :label="$t('Admin name')"
                    :disable="isLoadingPreferences"
                    @keyup.enter="save"
                >
                    <template
                        v-if="hasAdminNameChanged"
                        #append
                    >
                        <csc-input-button-save
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            @click.stop="resetAdminName"
                        />
                    </template>
                </q-input>
                <q-toggle
                    v-model="changes.web_gui_dis"
                    class="q-pa-sm"
                    :label="$t('Disable phone web interface')"
                    :disable="isLoadingPreferences"
                    @update:model-value="changeGui"
                />
                <q-toggle
                    v-model="changes.user_conf_priority"
                    class="q-pa-sm"
                    :label="$t('User config priority over provisioning')"
                    :disable="isLoadingPreferences"
                    @update:model-value="changeUserConfig"
                />
                <q-toggle
                    v-model="changes.FW_upg_dis"
                    class="q-pa-sm"
                    :label="$t('FW Upgrade disable')"
                    :disable="isLoadingPreferences"
                    @update:model-value="changeFW"
                />
            </q-list>
            <q-list
                v-if="changes"
                class="col-xs-12 col-md-16 q-mr-xl"
            >
                <csc-pbx-device-config
                    v-if="deviceModelImageMap[deviceProfileMap[deviceSelected.profile_id].device_id]"
                    :device="deviceSelected"
                    :model="deviceModelMap[deviceProfileMap[deviceSelected.profile_id].device_id]"
                    :model-image="deviceModelImageMap[deviceProfileMap[deviceSelected.profile_id].device_id]"
                    :loading="isSubscribersRequesting"
                    :subscribers="subscriberList"
                    :subscriber-map="subscriberMap"
                    :device-preferences="true"
                    @keysChanged="keysSave"
                />
            </q-list>
        </q-item>
    </csc-page-sticky-tabs>
</template>

<script>
import CscInputButtonReset from 'components/form/CscInputButtonReset'
import CscInputButtonSave from 'components/form/CscInputButtonSave'
import CscPageStickyTabs from 'components/CscPageStickyTabs'
import CscPbxDeviceConfig from 'components/pages/PbxConfiguration/CscPbxDeviceConfig'
import CscPbxModelSelect from 'components/pages/PbxConfiguration/CscPbxModelSelect'
import useValidate from '@vuelidate/core'
import {
    mapActions,
    mapGetters,
    mapMutations,
    mapState
} from 'vuex'
import { RequestState } from 'src/store/common'
import {
    showGlobalError,
    showToast
} from 'src/helpers/ui'
export default {
    name: 'CscPagePbxDeviceDetails',
    components: {
        CscPageStickyTabs,
        CscInputButtonSave,
        CscInputButtonReset,
        CscPbxModelSelect,
        CscPbxDeviceConfig
    },
    props: {
        initialTab: {
            type: String,
            default: 'preferences'
        },
        device: {
            type: Object,
            default: null
        }
    },
    data () {
        return {
            changes: null,
            id: this.$route.params.id,
            selectedTab: this.initialTab,
            v$: useValidate()
        }
    },
    computed: {
        ...mapState('pbxDevices', [
            'deviceSelected',
            'deviceUpdateError',
            'devicePreferencesUpdateError',
            'deviceUpdateState',
            'devicePreferencesUpdateState',
            'devicePreferencesSelected'
        ]),
        ...mapState('pbx', [
            'deviceProfileList',
            'deviceProfileMap',
            'deviceModelImageMap',
            'deviceModelMap',
            'subscriberList',
            'subscriberMap'
        ]),
        ...mapGetters('pbx', [
            'getSubscriberOptions',
            'isSubscribersRequesting'
        ]),
        ...mapGetters('pbxDevices', [
            'getDeviceUpdateToastMessage',
            'getDevicePreferencesUpdateToastMessage',
            'isDeviceLoading',
            'isDevicePreferencesLoading'
        ]),
        tabs () {
            return [
                {
                    label: this.$t('Preferences'),
                    value: 'preferences',
                    icon: 'perm_phone_msg'
                }
            ]
        },
        isLoading () {
            return this.isDeviceLoading(this.deviceSelected.id)
        },
        isLoadingPreferences () {
            return this.isDevicePreferencesLoading(this.devicePreferencesSelected.id)
        },
        hasStationNameChanged () {
            return this.changes.station_name !== this.deviceSelected.station_name
        },
        hasIdentifierChanged () {
            return this.changes.identifier !== this.deviceSelected.identifier
        },
        hasProfileChanged () {
            return this.changes.profile_id !== this.deviceSelected.profile_id
        },
        imageUrl () {
            if (this.modelImage && this.modelImage.url) {
                return this.modelImage.url
            }
            return null
        },
        hasAdminNameChanged () {
            return this.changes.admin_name !== this.devicePreferencesSelected.admin_name
        }
    },
    watch: {
        deviceSelected () {
            this.changes = this.getDeviceData()
        },
        deviceUpdateState (state) {
            if (state === RequestState.succeeded) {
                showToast(this.getDeviceUpdateToastMessage)
            } else if (state === RequestState.failed) {
                showGlobalError(this.deviceUpdateError)
            }
        },
        devicePreferencesUpdateState (state) {
            if (state === RequestState.succeeded) {
                showToast(this.getDevicePreferencesUpdateToastMessage)
            } else if (state === RequestState.failed) {
                showGlobalError(this.devicePreferencesUpdateError)
            }
        }
    },
    mounted () {
        this.expandDevice(this.id)
        this.expandDevicePreferences(this.id)
        this.loadSubscribers()
    },
    methods: {
        ...mapMutations('pbxDevices', [
            'expandDevice',
            'expandDevicePreferences'
        ]),
        ...mapActions('pbxDevices', [
            'setDeviceKeys',
            'setDeviceStationName',
            'setDeviceIdentifier',
            'setDeviceProfile',
            'setAdminName',
            'setGui',
            'setUserConfig',
            'setFW'
        ]),
        ...mapActions('pbx', [
            'loadSubscribers'
        ]),
        getDeviceData () {
            return (this.deviceSelected && this.devicePreferencesSelected)
                ? {
                    station_name: this.deviceSelected.station_name,
                    identifier: this.deviceSelected.identifier,
                    profile_id: this.deviceSelected.profile_id,
                    admin_name: this.devicePreferencesSelected.admin_name ? this.devicePreferencesSelected.admin_name : undefined,
                    web_gui_dis: this.devicePreferencesSelected.web_gui_dis ? this.devicePreferencesSelected.web_gui_dis : false,
                    user_conf_priority: this.devicePreferencesSelected.user_conf_priority ? this.devicePreferencesSelected.user_conf_priority : false,
                    FW_upg_dis: this.devicePreferencesSelected.FW_upg_dis ? this.devicePreferencesSelected.FW_upg_dis : false
                }
                : null
        },
        resetStationName () {
            this.changes.station_name = this.deviceSelected.station_name
        },
        resetIdentifier () {
            this.changes.identifier = this.deviceSelected.identifier
        },
        resetAdminName () {
            this.changes.admin_name = this.devicePreferencesSelected.admin_name
        },
        selectedProfile (profileId) {
            this.changes.profile_id = profileId
        },
        resetProfile () {
            this.changes.profile_id = this.deviceSelected.profile_id
        },
        selectTab (tabName) {
            if (this.selectedTab !== tabName) {
                this.forceTabReload(tabName)
            }
        },
        forceTabReload (tabName) {
            this.selectedTab = tabName
        },
        keysSave (keys) {
            this.setDeviceKeys({
                deviceId: this.deviceSelected.id,
                keys: keys
            })
        },
        save () {
            if (this.hasStationNameChanged) {
                this.setDeviceStationName({
                    deviceId: this.deviceSelected.id,
                    stationName: this.changes.station_name
                })
            }
            if (this.hasIdentifierChanged) {
                this.setDeviceIdentifier({
                    deviceId: this.deviceSelected.id,
                    identifier: this.changes.identifier
                })
            }
            if (this.hasProfileChanged) {
                this.setDeviceProfile({
                    deviceId: this.deviceSelected.id,
                    profileId: this.changes.profile_id
                })
            }
            if (this.hasAdminNameChanged) {
                this.setAdminName({
                    deviceId: this.devicePreferencesSelected.id,
                    adminName: this.changes.admin_name
                })
            }
        },
        changeGui () {
            this.setGui({
                deviceId: this.devicePreferencesSelected.id,
                webGui: this.changes.web_gui_dis
            })
        },
        changeUserConfig () {
            this.setUserConfig({
                deviceId: this.devicePreferencesSelected.id,
                userConf: this.changes.user_conf_priority
            })
        },
        changeFW () {
            this.setFW({
                deviceId: this.devicePreferencesSelected.id,
                FWupg: this.changes.FW_upg_dis
            })
        }
    }
}
</script>
<style>
.no-wrap {
    flex-wrap: wrap;
}
</style>
