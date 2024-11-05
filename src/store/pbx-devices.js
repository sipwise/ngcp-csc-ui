import { i18n } from 'boot/i18n'
import _ from 'lodash'
import {
    createDevice,
    getDevice,
    getDeviceList,
    getDevicesPreferences,
    removeDevice,
    setDeviceIdentifier,
    setDeviceKeys,
    setDeviceProfile,
    setDeviceStationName,
    setPreferenceDevice
} from 'src/api/pbx-devices'
import { CreationState, RequestState } from 'src/store/common'

export default {
    namespaced: true,
    state: {
        deviceCreating: null,
        deviceCreationError: null,
        deviceCreationState: CreationState.initiated,
        deviceListCurrentPage: 1,
        deviceList: [],
        deviceListError: null,
        deviceListLastPage: null,
        deviceListState: RequestState.initiated,
        deviceListVisibility: 'visible',
        deviceMapById: {},
        devicePreferencesList: [],
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
            return i18n.global.t('Created device {device} successfully', {
                device: getters.getDeviceCreatingName
            })
        },
        getDevicePreferencesUpdateToastMessage (state, getters) {
            return i18n.global.t('Updated {field} successfully', {
                field: getters.getDevicePreferencesUpdatingField
            })
        },
        getDevicePreferencesUpdatingField (state) {
            return state.devicePreferencesUpdatingField
        },
        getDevicePreferencesUpdatingName (state) {
            return _.get(state, 'devicePreferencesUpdating.admin_name', '')
        },
        getDevicePreferencesUpdatingPassword (state) {
            return _.get(state, 'devicePreferencesUpdating.admin_pass', '')
        },
        getDeviceRemoveDialogMessage (state, getters) {
            if (getters.isDeviceRemoving) {
                return i18n.global.t('You are about to remove device {device}', {
                    device: getters.getDeviceRemovingName
                })
            }
            return ''
        },
        getDeviceRemovingName (state) {
            return _.get(state, 'deviceRemoving.station_name', '')
        },
        getDeviceRemovalToastMessage (state, getters) {
            return i18n.global.t('Removed device {device} successfully', {
                device: getters.getDeviceRemovingName
            })
        },
        getDeviceUpdateToastMessage (state, getters) {
            return i18n.global.t('Updated {field} for device {device} successfully', {
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
            return Array.isArray(state.deviceList) && state.deviceList.length === 0
        },
        isDeviceInMapBy (state) {
            return (deviceId) => {
                return state.deviceMapById[deviceId] !== undefined
            }
        },
        isDeviceInPreferencesMap (state) {
            return (deviceId) => {
                return state.devicePreferencesMap[deviceId] !== undefined
            }
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
        deviceListRequesting (state, options) {
            const clearList = _.get(options, 'clearList', true)
            state.deviceListState = RequestState.requesting
            state.deviceListLastPage = null
            if (clearList) {
                state.deviceListVisibility = 'hidden'
                state.deviceList = []
                state.deviceMapById = {}
            } else {
                state.deviceListVisibility = 'visible'
            }
        },
        deviceListSucceeded (state, options) {
            state.deviceListState = RequestState.succeeded
            state.deviceListCurrentPage = _.get(options, 'page', 1)
            state.deviceList = _.get(options, 'devices.items', [])
            state.deviceListLastPage = _.get(options, 'devices.lastPage', 1)
            state.deviceMapById = {}
            state.deviceList.forEach((device) => {
                state.deviceMapById[device.id] = device
            })
            state.deviceListVisibility = 'visible'
        },
        deviceSucceeded (state, device) {
            state.deviceListState = RequestState.succeeded
            state.deviceList = [...state.deviceList, device]
            state.deviceMapById[device.id] = device
        },
        devicePreferencesListRequesting (state) {
            state.devicePreferencesListState = RequestState.requesting
        },
        devicePreferencesListSucceeded (state, options) {
            state.devicePreferencesListState = RequestState.succeeded
            state.devicePreferencesList = _.get(options, 'devicesPreferences', [])
            state.devicePreferencesMap = {}
            state.devicePreferencesList.forEach((devicePreferences) => {
                state.devicePreferencesMap[devicePreferences.id] = devicePreferences
            })
        },
        deviceListFailed (state) {
            state.deviceListState = RequestState.failed
        },
        devicePreferencesListFailed (state) {
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
            state.deviceUpdating = state.deviceMapById[options.deviceId]
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
            delete state.deviceMapById[device.id]
            state.deviceMapById[device.id] = device
            state.deviceList.forEach((item, index) => {
                if (item.id === device.id) {
                    state.deviceList[index] = device
                }
            })
            if (state.deviceSelected !== null && state.deviceSelected.id === device.id) {
                state.deviceSelected = device
            }
        },
        devicePreferencesUpdateSucceeded (state, device) {
            state.devicePreferencesUpdateState = RequestState.succeeded
            delete state.devicePreferencesMap[device.id]
            state.devicePreferencesMap[device.id] = device
            state.devicePreferencesList.forEach((item, index) => {
                if (item.id === device.id) {
                    state.devicePreferencesList[index] = device
                }
            })
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
            state.deviceRemoving = state.deviceMapById[id]
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
            state.deviceSelected = state.deviceMapById[deviceId]
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
        async loadDeviceList (context, options) {
            const page = _.get(options, 'page', context.state.deviceListCurrentPage)
            const clearList = _.get(options, 'clearList', true)
            const filters = _.get(options, 'filters', {})

            context.commit('deviceListRequesting', { clearList })

            try {
                const devices = await getDeviceList({ page, filters })
                context.commit('deviceListSucceeded', { devices, page })
            } catch (err) {
                context.commit('deviceListFailed', err.message)
                throw err
            }
        },
        async loadDevice (context, deviceId) {
            context.commit('deviceListRequesting', { clearList: false })
            try {
                await context.dispatch('pbx/loadProfileById', deviceId, { root: true })
                const device = await getDevice(deviceId)
                context.commit('deviceSucceeded', device)
            } catch (err) {
                context.commit('deviceListFailed', err.message)
                throw err
            }
        },
        async loadDevicePreferencesList (context) {
            context.commit('devicePreferencesListRequesting')
            try {
                const devicesPreferences = await getDevicesPreferences()
                context.commit('devicePreferencesListSucceeded', {
                    devicesPreferences: devicesPreferences.items
                })
            } catch (err) {
                context.commit('devicePreferencesListFailed', err.message)
            }
        },
        createDevice (context, deviceData) {
            context.commit('deviceCreationRequesting', deviceData)
            createDevice(deviceData).then(() => {
                context.dispatch('loadDeviceList', {
                    page: 1,
                    clearList: false
                })
                context.dispatch('loadDevicePreferencesList')
            }).then(() => {
                context.commit('deviceCreationSucceeded')
            }).catch((err) => {
                context.commit('deviceCreationFailed', err.message)
            })
        },
        removeDevice (context, deviceId) {
            context.commit('deviceRemovalRequesting', deviceId)
            removeDevice(deviceId).then(() => {
                return context.dispatch('loadDeviceList', {
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
                deviceField: i18n.global.t('Station name')
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
                deviceField: i18n.global.t('MAC address')
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
                deviceField: i18n.global.t('Phone model')
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
                deviceField: i18n.global.t('Lamps/Keys')
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
                devicePreferencesField: i18n.global.t('Admin name')
            })
            setPreferenceDevice(options.deviceId, options.adminName, 'admin_name').then((device) => {
                context.commit('devicePreferencesUpdateSucceeded', device)
            }).catch((err) => {
                context.commit('devicePreferencesUpdateFailed', err.message)
            })
        },
        setAdminPassword (context, options) {
            context.commit('devicePreferencesUpdateRequesting', {
                deviceId: options.deviceId,
                devicePreferencesField: i18n.global.t('Admin password')
            })
            setPreferenceDevice(options.deviceId, options.adminPassword, 'admin_pass').then((device) => {
                context.commit('devicePreferencesUpdateSucceeded', device)
            }).catch((err) => {
                context.commit('devicePreferencesUpdateFailed', err.message)
            })
        },
        setFW (context, options) {
            context.commit('devicePreferencesUpdateRequesting', {
                deviceId: options.deviceId,
                devicePreferencesField: i18n.global.t('FW Upgrade disable')
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
                devicePreferencesField: i18n.global.t('Disable phone web interface')
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
                devicePreferencesField: i18n.global.t('User config priority over provisioning')
            })
            setPreferenceDevice(options.deviceId, options.userConf, 'user_conf_priority').then((device) => {
                context.commit('devicePreferencesUpdateSucceeded', device)
            }).catch((err) => {
                context.commit('devicePreferencesUpdateFailed', err.message)
            })
        }
    }
}
