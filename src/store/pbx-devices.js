
import {
    CreationState,
    RequestState
} from './common'
import _ from 'lodash'
import {
    createDevice,
    getDeviceList,
    getDevicesPreferences,
    removeDevice,
    setDeviceIdentifier,
    setDeviceKeys,
    setDeviceProfile,
    setDeviceStationName,
    setPreferenceDevice
} from '../api/pbx-devices'
import {
    i18n
} from 'src/boot/i18n'

export default {
    namespaced: true,
    state: {
        deviceCreating: null,
        deviceCreationError: null,
        deviceCreationState: CreationState.initiated,
        deviceListCurrentPage: 1,
        deviceListItems: [],
        deviceListLastPage: null,
        deviceListState: RequestState.initiated,
        deviceListVisibility: 'visible',
        deviceMap: {},
        devicePreferencesListItems: [],
        devicePreferencesListState: RequestState.initiated,
        devicePreferencesMap: {},
        devicePreferencesRemovalState: RequestState.initiated,
        devicePreferencesRemoving: null,
        devicePreferencesSelected: null,
        devicePreferencesUpdateError: null,
        devicePreferencesUpdateState: RequestState.initiated,
        devicePreferencesUpdating: null,
        devicePreferencesUpdatingField: null,
        deviceRemovalError: null,
        deviceRemovalState: RequestState.initiated,
        deviceRemoving: null,
        deviceSelected: null,
        deviceUpdateError: null,
        deviceUpdateState: RequestState.initiated,
        deviceUpdating: null,
        deviceUpdatingField: null
    },
    getters: {
        getDeviceCreatingName (state) {
            return _.get(state, 'deviceCreating.stationName', '')
        },
        getDeviceCreationToastMessage (state, getters) {
            return i18n.global.tc('Created device {device} successfully', {
                device: getters.getDeviceCreatingName
            })
        },
        getDevicePreferencesUpdateToastMessage (state, getters) {
            return i18n.global.tc('Updated {field} successfully', {
                field: getters.getDevicePreferencesUpdatingField
            })
        },
        getDevicePreferencesUpdatingField (state) {
            return state.devicePreferencesUpdatingField
        },
        getDevicePreferencesUpdatingName (state) {
            return _.get(state, 'devicePreferencesUpdating.admin_name', '')
        },
        getDeviceRemoveDialogMessage (state, getters) {
            if (getters.isDeviceRemoving) {
                return i18n.global.tc('You are about to remove device {device}', {
                    device: getters.getDeviceRemovingName
                })
            }
            return ''
        },
        getDeviceRemovingName (state) {
            return _.get(state, 'deviceRemoving.station_name', '')
        },
        getDeviceRemovalToastMessage (state, getters) {
            return i18n.global.tc('Removed device {device} successfully', {
                device: getters.getDeviceRemovingName
            })
        },
        getDeviceUpdateToastMessage (state, getters) {
            return i18n.global.tc('Updated {field} for device {device} successfully', {
                device: getters.getDeviceUpdatingName,
                field: getters.getDeviceUpdatingField
            })
        },
        getDeviceUpdatingField (state) {
            return state.deviceUpdatingField
        },
        getDeviceUpdatingName (state) {
            return _.get(state, 'deviceUpdating.station_name', '')
        },
        isDeviceAddFormDisabled (state) {
            return state.deviceCreationState === CreationState.initiated ||
                state.deviceCreationState === CreationState.created
        },
        isDeviceCreating (state) {
            return state.deviceCreationState === CreationState.creating
        },
        isDeviceExpanded (state) {
            return (id) => {
                return state.deviceSelected !== null && state.deviceSelected.id === id
            }
        },
        isDeviceListEmpty (state) {
            return Array.isArray(state.deviceListItems) && state.deviceListItems.length === 0
        },
        isDeviceListPaginationActive (state, getters) {
            const requesting = !getters.isDeviceListRequesting || getters.isDeviceCreating ||
                getters.isDeviceRemoving || getters.isDeviceUpdating
            return !getters.isDeviceListEmpty && requesting && state.deviceListLastPage > 1
        },
        isDeviceListRequesting (state) {
            return state.deviceListState === RequestState.requesting
        },
        isDeviceLoading (state, getters) {
            return (deviceId) => {
                return (getters.isDeviceUpdating && state.deviceUpdating.id === deviceId) ||
                    (getters.isDeviceRemoving && state.deviceRemoving.id === deviceId)
            }
        },
        isDevicePreferencesLoading (state, getters) {
            return (devicePreferencesId) => {
                return (getters.isDevicePreferencesUpdating && state.devicePreferencesUpdating.id === devicePreferencesId) ||
                    (getters.isDevicePreferencesRemoving && state.devicePreferencesRemoving.id === devicePreferencesId)
            }
        },
        isDevicePreferencesRemoving (state) {
            return state.devicePreferencesRemovalState === RequestState.requesting
        },
        isDevicePreferencesUpdating (state) {
            return state.devicePreferencesUpdateState === RequestState.requesting
        },
        isDeviceRemoving (state) {
            return state.deviceRemovalState === RequestState.requesting
        },
        isDeviceUpdating (state) {
            return state.deviceUpdateState === RequestState.requesting
        }
    },
    mutations: {
        deviceListItemsRequesting (state, options) {
            const clearList = _.get(options, 'clearList', true)
            state.deviceListState = RequestState.requesting
            state.deviceListLastPage = null
            if (clearList) {
                state.deviceListVisibility = 'hidden'
                state.deviceListItems = []
                state.deviceMap = {}
            } else {
                state.deviceListVisibility = 'visible'
            }
        },
        deviceListItemsSucceeded (state, options) {
            state.deviceListState = RequestState.succeeded
            state.deviceListCurrentPage = _.get(options, 'page', 1)
            state.deviceListItems = _.get(options, 'devices.items', [])
            state.deviceListLastPage = _.get(options, 'devices.lastPage', 1)
            state.deviceMap = {}
            state.deviceListItems.forEach((device) => {
                state.deviceMap[device.id] = device
            })
            state.deviceListVisibility = 'visible'
        },
        devicePreferencesListItemsSucceeded (state, options) {
            state.devicePreferencesListState = RequestState.succeeded
            state.devicePreferencesListItems = _.get(options, 'devicesPreferences', [])
            state.devicePreferencesMap = {}
            state.devicePreferencesListItems.forEach((devicePreferences) => {
                state.devicePreferencesMap[devicePreferences.id] = devicePreferences
            })
        },
        deviceListItemsFailed (state) {
            state.deviceListState = RequestState.failed
        },
        devicePreferencesListItemsFailed (state) {
            state.devicePreferencesListState = RequestState.failed
        },
        deviceCreationRequesting (state, device) {
            state.deviceCreationState = CreationState.creating
            state.deviceCreating = device
        },
        deviceCreationSucceeded (state) {
            state.deviceCreationState = CreationState.created
        },
        deviceCreationFailed (state, err) {
            state.deviceCreationState = CreationState.error
            state.deviceCreationError = err
        },
        deviceUpdateRequesting (state, options) {
            state.deviceUpdating = state.deviceMap[options.deviceId]
            state.deviceUpdatingField = options.deviceField
            state.deviceUpdateState = RequestState.requesting
        },
        devicePreferencesUpdateRequesting (state, options) {
            state.devicePreferencesUpdating = state.devicePreferencesMap[options.deviceId]
            state.devicePreferencesUpdatingField = options.devicePreferencesField
            state.devicePreferencesUpdateState = RequestState.requesting
        },
        deviceUpdateSucceeded (state, device) {
            state.deviceUpdateState = RequestState.succeeded
            delete state.deviceMap[device.id]
            state.deviceMap[device.id] = device
            for (let i = 0; i < state.deviceListItems.length; i++) {
                if (state.deviceListItems[i].id === device.id) {
                    state.deviceListItems[i] = device
                }
            }
            if (state.deviceSelected !== null && state.deviceSelected.id === device.id) {
                state.deviceSelected = device
            }
        },
        devicePreferencesUpdateSucceeded (state, device) {
            state.devicePreferencesUpdateState = RequestState.succeeded
            delete state.devicePreferencesMap[device.id]
            state.devicePreferencesMap[device.id] = device
            for (let i = 0; i < state.devicePreferencesListItems.length; i++) {
                if (state.devicePreferencesListItems[i].id === device.id) {
                    state.devicePreferencesListItems[i] = device
                }
            }
            if (state.devicePreferencesSelected !== null && state.devicePreferencesSelected.id === device.id) {
                state.devicePreferencesSelected = device
            }
        },
        deviceUpdateFailed (state, err) {
            state.deviceUpdating = null
            state.deviceUpdateState = RequestState.failed
            state.deviceUpdateError = err
        },
        devicePreferencesUpdateFailed (state, err) {
            state.devicePreferencesUpdating = null
            state.devicePreferencesUpdateState = RequestState.failed
            state.devicePreferencesUpdateError = err
        },
        deviceRemovalRequesting (state, id) {
            state.deviceRemovalState = RequestState.requesting
            state.deviceRemoving = state.deviceMap[id]
        },
        deviceRemovalCanceled (state) {
            state.deviceRemovalState = RequestState.initiated
            state.deviceRemoving = null
        },
        deviceRemovalSucceeded (state) {
            state.deviceRemovalState = RequestState.succeeded
        },
        deviceRemovalFailed (state, err) {
            state.deviceRemovalState = RequestState.failed
            state.deviceRemovalError = err
        },
        expandDevice (state, deviceId) {
            state.deviceSelected = state.deviceMap[deviceId]
        },
        expandDevicePreferences (state, devicePreferencesId) {
            state.devicePreferencesSelected = state.devicePreferencesMap[devicePreferencesId]
        },
        collapseDevice (state) {
            state.deviceSelected = null
        },
        enableDeviceAddForm (state) {
            state.deviceCreationState = CreationState.input
            state.deviceSelected = null
        },
        disableDeviceAddForm (state) {
            state.deviceCreationState = CreationState.initiated
        }
    },
    actions: {
        loadDeviceListItems (context, options) {
            return new Promise((resolve, reject) => {
                const page = _.get(options, 'page', context.state.deviceListCurrentPage)
                const clearList = _.get(options, 'clearList', true)
                const filters = _.get(options, 'filters', {})
                context.commit('deviceListItemsRequesting', {
                    clearList: clearList
                })
                Promise.resolve().then(() => {
                    return context.dispatch('pbx/loadProfiles', null, { root: true })
                }).then(() => {
                    return getDeviceList({
                        page: page,
                        filters
                    })
                }).then((devices) => {
                    context.commit('deviceListItemsSucceeded', {
                        devices: devices,
                        page: page
                    })
                    resolve()
                }).catch((err) => {
                    context.commit('deviceListItemsFailed', err.message)
                    reject(err)
                })
            })
        },
        loadDevicePreferencesListItems (context) {
            return new Promise((resolve, reject) => {
                Promise.resolve().then(() => {
                    return getDevicesPreferences()
                }).then((devicesPreferences) => {
                    context.commit('devicePreferencesListItemsSucceeded', {
                        devicesPreferences: devicesPreferences.items
                    })
                    resolve()
                }).catch((err) => {
                    context.commit('devicePreferencesListItemsFailed', err.message)
                    reject(err)
                })
            })
        },
        createDevice (context, deviceData) {
            context.commit('deviceCreationRequesting', deviceData)
            createDevice(deviceData).then(() => {
                context.dispatch('loadDeviceListItems', {
                    page: 1,
                    clearList: false
                })
                context.dispatch('loadDevicePreferencesListItems')
            }).then(() => {
                context.commit('deviceCreationSucceeded')
            }).catch((err) => {
                context.commit('deviceCreationFailed', err.message)
            })
        },
        removeDevice (context, deviceId) {
            context.commit('deviceRemovalRequesting', deviceId)
            removeDevice(deviceId).then(() => {
                return context.dispatch('loadDeviceListItems', {
                    page: context.state.deviceListCurrentPage,
                    clearList: false
                })
            }).then(() => {
                context.commit('deviceRemovalSucceeded')
            }).catch((err) => {
                context.commit('deviceRemovalFailed', err.message)
            })
        },
        setDeviceStationName (context, options) {
            context.commit('deviceUpdateRequesting', {
                deviceId: options.deviceId,
                deviceField: i18n.global.tc('Station name')
            })
            setDeviceStationName(options.deviceId, options.stationName).then((device) => {
                context.commit('deviceUpdateSucceeded', device)
            }).catch((err) => {
                context.commit('deviceUpdateFailed', err.message)
            })
        },
        setDeviceIdentifier (context, options) {
            context.commit('deviceUpdateRequesting', {
                deviceId: options.deviceId,
                deviceField: i18n.global.tc('MAC address')
            })
            setDeviceIdentifier(options.deviceId, options.identifier).then((device) => {
                context.commit('deviceUpdateSucceeded', device)
            }).catch((err) => {
                context.commit('deviceUpdateFailed', err.message)
            })
        },
        setDeviceProfile (context, options) {
            context.commit('deviceUpdateRequesting', {
                deviceId: options.deviceId,
                deviceField: i18n.global.tc('Phone model')
            })
            setDeviceProfile(options.deviceId, options.profileId).then((device) => {
                context.commit('deviceUpdateSucceeded', device)
            }).catch((err) => {
                context.commit('deviceUpdateFailed', err.message)
            })
        },
        setDeviceKeys (context, options) {
            context.commit('deviceUpdateRequesting', {
                deviceId: options.deviceId,
                deviceField: i18n.global.tc('Lamps/Keys')
            })
            setDeviceKeys(options.deviceId, options.keys).then((device) => {
                context.commit('deviceUpdateSucceeded', device)
            }).catch((err) => {
                context.commit('deviceUpdateFailed', err.message)
            })
        },
        setAdminName (context, options) {
            context.commit('devicePreferencesUpdateRequesting', {
                deviceId: options.deviceId,
                devicePreferencesField: i18n.global.tc('Admin name')
            })
            setPreferenceDevice(options.deviceId, options.adminName, 'admin_name').then((device) => {
                context.commit('devicePreferencesUpdateSucceeded', device)
            }).catch((err) => {
                context.commit('devicePreferencesUpdateFailed', err.message)
            })
        },
        setFW (context, options) {
            context.commit('devicePreferencesUpdateRequesting', {
                deviceId: options.deviceId,
                devicePreferencesField: i18n.global.tc('FW Upgrade disable')
            })
            setPreferenceDevice(options.deviceId, options.FWupg, 'FW_upg_dis').then((device) => {
                context.commit('devicePreferencesUpdateSucceeded', device)
            }).catch((err) => {
                context.commit('devicePreferencesUpdateFailed', err.message)
            })
        },
        setGui (context, options) {
            context.commit('devicePreferencesUpdateRequesting', {
                deviceId: options.deviceId,
                devicePreferencesField: i18n.global.tc('Disable phone web interface')
            })
            setPreferenceDevice(options.deviceId, options.webGui, 'web_gui_dis').then((device) => {
                context.commit('devicePreferencesUpdateSucceeded', device)
            }).catch((err) => {
                context.commit('devicePreferencesUpdateFailed', err.message)
            })
        },
        setUserConfig (context, options) {
            context.commit('devicePreferencesUpdateRequesting', {
                deviceId: options.deviceId,
                devicePreferencesField: i18n.global.tc('User config priority over provisioning')
            })
            setPreferenceDevice(options.deviceId, options.userConf, 'user_conf_priority').then((device) => {
                context.commit('devicePreferencesUpdateSucceeded', device)
            }).catch((err) => {
                context.commit('devicePreferencesUpdateFailed', err.message)
            })
        }
    }
}
