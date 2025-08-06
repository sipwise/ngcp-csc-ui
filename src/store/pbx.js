
import numberFilter from '../filters/number'
import _ from 'lodash'
import {
    getAllProfiles,
    getModel,
    getModelFrontImage,
    getModelFrontThumbnailImage,
    getProfile
} from 'src/api/pbx-config'
import { getSubscribers } from 'src/api/subscriber'
import { getNumbers } from 'src/api/user'
import { showGlobalError } from 'src/helpers/ui'
import { RequestState } from 'src/store/common'
import { i18n } from 'src/boot/i18n'

export default {
    namespaced: true,
    state: {
        pilot: null,
        numberList: [],
        numberMapById: {},
        numberListState: RequestState.initiated,
        groupList: [],
        groupMapById: {},
        seatList: [],
        seatMapById: {},
        soundSetList: [],
        soundSetMapByName: {},
        deviceProfileListState: RequestState.initiated,
        deviceProfileListError: null,
        deviceProfileList: [],
        deviceProfileMap: {},
        deviceModelList: [],
        deviceModelMap: {},
        deviceModelImageMap: {},
        deviceModelImageSmallMap: {},
        subscriberList: [],
        subscriberListState: RequestState.initiated,
        subscriberListError: null,
        subscriberMap: {},
        ncosMapByName: {}
    },
    getters: {
        pilot (state) {
            return state.pilot
        },
        numbers (state) {
            return state.numberList
        },
        getNumberOptions (state) {
            const options = []
            state.numberList.forEach((number) => {
                if (!number.is_primary) {
                    options.push({
                        label: numberFilter(number),
                        value: number.id
                    })
                }
            })
            return options
        },
        getPrimaryNumberOptions (state) {
            const options = []
            state.numberList.forEach((number) => {
                if (number.is_primary) {
                    options.push({
                        label: numberFilter(number),
                        value: numberFilter(number)
                    })
                }
            })
            return options
        },
        getFullNumberOptions (state) {
            const options = []
            state.numberList.forEach((number) => {
                options.push({
                    label: numberFilter(number),
                    value: numberFilter(number)
                })
            })
            return options
        },
        getSeatOptions (state) {
            const options = []
            state.seatList.forEach((seat) => {
                options.push({
                    label: (seat.display_name) ? seat.display_name : seat.username,
                    value: seat.id
                })
            })
            return options
        },
        getGroupOptions (state) {
            const options = []
            state.groupList.forEach((group) => {
                options.push({
                    label: group.display_name,
                    value: group.id
                })
            })
            return options
        },
        getSoundSetOptions (state) {
            const options = []
            const defaultLabel = i18n.global.tc('Default')
            state.soundSetList.forEach((soundSet) => {
                options.push({
                    label: soundSet.name,
                    value: soundSet.id
                })
            })
            options.unshift({
                label: defaultLabel,
                value: null
            })
            return options
        },
        getNcosByName (state) {
            return (level) => {
                return _.get(state.ncosMapByName, level, null)
            }
        },
        getSoundSetByName (state) {
            return (name) => {
                return _.get(state.soundSetMapByName, name, null)
            }
        },
        getSubscriberOptions (state) {
            const options = []
            options.push({
                label: i18n.global.tc('Unassigned'),
                icon: 'clear',
                value: null,
                type: null
            })
            state.subscriberList.forEach((subscriber) => {
                let icon = 'person'
                let type = 'seat'
                if (subscriber.is_pbx_group) {
                    icon = 'group'
                    type = 'group'
                } else if (subscriber.is_pbx_pilot) {
                    icon = 'person_outline'
                    type = 'pilot'
                }
                options.push({
                    label: subscriber.display_name || subscriber.webusername,
                    icon: icon,
                    value: subscriber.id,
                    type
                })
            })
            return options
        },
        isDeviceInModelMap (state) {
            return (deviceId) => {
                return state.deviceModelMap[deviceId] !== undefined
            }
        },
        isDeviceModelListStateRequesting (state) {
            return state.deviceModelListState === RequestState.requesting
        },
        isSubscribersRequesting (state) {
            return state.subscriberListState === RequestState.requesting
        },
        isNumbersRequesting (state) {
            return state.numberListState === RequestState.requesting
        },
        getMinAllowedExtension (state, getters, rootState, rootGetters) {
            const subscriber = rootGetters['user/getSubscriber']
            return subscriber.ext_range_min && subscriber.ext_range_min >= 0 ? +subscriber.ext_range_min : -1
        },
        getMaxAllowedExtension (state, getters, rootState, rootGetters) {
            const subscriber = rootGetters['user/getSubscriber']
            return subscriber.ext_range_max && subscriber.ext_range_max >= 1 ? +subscriber.ext_range_max : null
        },
        getExtensionHint (state, getters, rootState, rootGetters) {
            const min = getters.getMinAllowedExtension
            const max = getters.getMaxAllowedExtension
            if (min >= 0 && max == null) {
                return i18n.global.tc('Minimum allowed extension is {min}', {
                    min: min
                })
            } else if (min < 0 && max) {
                return i18n.global.tc('Maximum allowed extension is {max}', {
                    max: max
                })
            } else if (min >= 0 && max) {
                return i18n.global.tc('Allowed extensions are between {min} and {max}', {
                    min: min,
                    max: max
                })
            } else {
                return null
            }
        }
    },
    mutations: {
        pilotSucceeded (state, pilotItem) {
            state.pilot = pilotItem
        },
        numbersRequesting (state) {
            state.numberListState = RequestState.requesting
        },
        numbersSucceeded (state, numberList) {
            state.numberListState = RequestState.succeeded
            state.numberList = _.get(numberList, 'items', [])
            state.numberMapById = {}
            state.numberList.forEach((number) => {
                state.numberMapById[number.id] = number
            })
        },
        seatsSucceeded (state, seatList) {
            state.seatList = _.get(seatList, 'items', [])
            state.seatMapById = {}
            state.seatList.forEach((seat) => {
                state.seatMapById[seat.id] = seat
            })
        },
        groupsSucceeded (state, groupList) {
            state.groupList = _.get(groupList, 'items', [])
            state.groupMapById = {}
            state.groupList.forEach((group) => {
                state.groupMapById[group.id] = group
            })
        },
        soundSetsSucceeded (state, soundSetList) {
            state.soundSetList = _.get(soundSetList, 'items', [])
            state.soundSetMapByName = {}
            state.soundSetList.forEach((soundSet) => {
                state.soundSetMapByName[soundSet.name] = soundSet
            })
        },
        deviceProfileListStateRequesting (state) {
            state.deviceProfileListState = RequestState.requesting
        },
        deviceProfileListSucceeded (state, deviceProfileList) {
            const newList = _.get(deviceProfileList, 'items', [])

            // First remove existing items that we're about to replace with newer versions
            // and keep only items whoseIds are not in the updated list
            const existingIds = newList.map((item) => item.id)
            const filteredExistingList = state.deviceProfileList.filter(
                (existingItem) => !existingIds.includes(existingItem.id)
            )

            state.deviceProfileList = [...filteredExistingList, ...newList]
            state.deviceProfileListState = RequestState.succeeded
            state.deviceProfileMap = {}
            state.deviceProfileList.forEach((deviceProfile) => {
                state.deviceProfileMap[deviceProfile.id] = deviceProfile
            })
        },
        deviceProfileListFailed (state) {
            state.deviceProfileListState = RequestState.failed
        },
        deviceProfileRequesting (state) {
            state.deviceProfileListState = RequestState.requesting
        },
        deviceProfileSucceeded (state, deviceProfile) {
            state.deviceProfileListState = RequestState.succeeded
            state.deviceProfileList = [...state.deviceProfileList, deviceProfile]
            state.deviceProfileMap[deviceProfile.id] = deviceProfile
        },
        deviceProfileFailed (state) {
            state.deviceProfileListState = RequestState.failed
        },
        deviceModelSucceeded (state, deviceModel) {
            const model = _.get(deviceModel, 'model', null)
            const modelImage = _.get(deviceModel, 'modelImage', null)
            const modelImageThumbnail = _.get(deviceModel, 'modelImageThumbnail', null)
            if (model !== null) {
                state.deviceModelMap[model.id] = model
            }
            if (modelImage !== null) {
                state.deviceModelImageMap[modelImage.id] = modelImage
            }
            if (modelImageThumbnail !== null) {
                state.deviceModelImageSmallMap[modelImageThumbnail.id] = modelImageThumbnail
            }
        },
        deviceModelFailed (state, deviceModelId) {
            delete state.deviceModelMap[deviceModelId]
            delete state.deviceModelImageMap[deviceModelId]
            delete state.deviceModelImageSmallMap[deviceModelId]
        },
        subscribersRequesting (state) {
            state.subscriberListState = RequestState.requesting
            state.subscriberList = []
        },
        subscribersSucceeded (state, subscribers) {
            state.subscriberList = _.get(subscribers, 'items', [])
            state.subscriberListState = RequestState.succeeded
            state.subscriberMap = {}
            state.subscriberList.forEach((subscriber) => {
                state.subscriberMap[subscriber.id] = subscriber
            })
        },
        subscribersFailed (state, err) {
            state.subscriberListState = RequestState.failed
            state.subscriberListError = err
        }
    },
    actions: {
        async loadProfiles (context) {
            context.commit('deviceProfileListStateRequesting')
            try {
                const profiles = await getAllProfiles()
                context.commit('deviceProfileListSucceeded', profiles)
            } catch (err) {
                context.commit('deviceProfileListFailed', err.message)
            }
        },
        async loadProfileById (context, deviceId) {
            context.commit('deviceProfileRequesting')
            try {
                const profile = await getProfile(deviceId)
                context.commit('deviceProfileSucceeded', profile)
            } catch (err) {
                context.commit('deviceProfileFailed')
            }
        },
        async loadProfileThumbnails (context) {
            const requests = []

            context.state.deviceProfileList.forEach((deviceProfile) => {
                const isFrontThumbnailCached = context.state.deviceModelImageSmallMap[deviceProfile.device_id] !== undefined
                if (!isFrontThumbnailCached) {
                    requests.push(
                        getModelFrontThumbnailImage(deviceProfile.device_id)
                            .then((thumbnail) => ({
                                deviceId: deviceProfile.device_id,
                                thumbnail
                            }))
                            .catch((error) => ({
                                deviceId: deviceProfile.device_id,
                                error
                            }))
                    )
                }
            })

            if (requests.length > 0) {
                try {
                    const results = await Promise.all(requests)

                    results.forEach((result) => {
                        if (result.thumbnail) {
                            context.commit('deviceModelSucceeded', {
                                modelImageThumbnail: result.thumbnail
                            })
                        } else if (result.error) {
                            // Silent warning as it's not a critical error
                            // and we can still use the device profile without the thumbnail
                            // eslint-disable-next-line no-console
                            console.warn(`Failed to load thumbnail for device ${result.deviceId}:`, result.error)
                        }
                    })
                } catch (error) {
                    showGlobalError('Failed to load profile thumbnails:', error)
                }
            }
        },
        async loadDeviceModel (context, payload) {
            try {
                const isFrontCached = context.state.deviceModelImageMap[payload.deviceId] !== undefined
                const isFrontThumbnailCached = context.state.deviceModelImageSmallMap[payload.deviceId] !== undefined
                const isModelCached = context.state.deviceModelMap[payload.deviceId] !== undefined
                const deviceModel = {
                    modelImage: null,
                    modelImageThumbnail: null,
                    model: null
                }
                const requests = []
                let isFrontImageRequested = false
                if (!isFrontCached && (payload.type === 'front' || payload.type === 'all')) {
                    requests.push(getModelFrontImage(payload.deviceId))
                    isFrontImageRequested = true
                }
                let isFrontThumbnailImageRequested = false
                if (!isFrontThumbnailCached && (payload.type === 'front_thumb' || payload.type === 'all')) {
                    requests.push(getModelFrontThumbnailImage(payload.deviceId))
                    isFrontThumbnailImageRequested = true
                }
                let isModelRequested = false
                if (!isModelCached) {
                    requests.push(getModel(payload.deviceId))
                    isModelRequested = true
                }
                if (requests.length > 0) {
                    const res = await Promise.all(requests)
                    if (res.length === 1 && isModelRequested) {
                        deviceModel.model = res[0]
                    } else if (res.length === 1 && isFrontImageRequested) {
                        deviceModel.modelImage = res[0]
                    } else if (res.length === 1 && isFrontThumbnailImageRequested) {
                        deviceModel.modelImageThumbnail = res[0]
                    } else if (res.length === 2 && isModelRequested && isFrontImageRequested) {
                        deviceModel.modelImage = res[0]
                        deviceModel.model = res[1]
                    } else if (res.length === 2 && isModelRequested && isFrontThumbnailImageRequested) {
                        deviceModel.modelImageThumbnail = res[0]
                        deviceModel.model = res[1]
                    } else if (res.length === 2 && isFrontImageRequested && isFrontThumbnailImageRequested) {
                        deviceModel.modelImage = res[0]
                        deviceModel.modelImageThumbnail = res[1]
                    } else if (res.length === 3) {
                        deviceModel.modelImage = res[0]
                        deviceModel.modelImageThumbnail = res[1]
                        deviceModel.model = res[2]
                    }
                }
                context.commit('deviceModelSucceeded', deviceModel)
            } catch (err) {
                // Note: the way it is implemented at the moment
                // if any of the promises fails, the whole action fails
                // and only the first error is reported. This needs refactoring
                // to handle each request separately and report errors accordingly.
                context.commit('deviceModelFailed', {
                    deviceModelId: payload.deviceId,
                    error: err.message
                })
            }
        },
        async loadDeviceModels (context, imageType) {
            const requests = context.state.deviceProfileList.map((deviceProfile) => {
                return context.dispatch('loadDeviceModel', {
                    deviceId: deviceProfile.device_id,
                    type: imageType
                })
            })

            await Promise.all(requests)
        },
        loadSubscribers (context) {
            if (context.state.subscriberListState !== RequestState.requesting) {
                context.commit('subscribersRequesting')
                getSubscribers({
                    all: true
                }).then((subscribers) => {
                    context.commit('subscribersSucceeded', subscribers)
                }).catch((err) => {
                    console.debug(err)
                    context.commit('subscribersSucceeded', {
                        items: []
                    })
                })
            }
        },
        loadNumbers (context) {
            if (context.state.numberList.length === 0 &&
                context.state.numberListState !== RequestState.requesting) {
                context.commit('numbersRequesting')
                getNumbers({
                    all: true
                }).then((numbers) => {
                    context.commit('numbersSucceeded', numbers)
                }).catch((err) => {
                    console.debug(err)
                    context.commit('numbersSucceeded', {
                        items: []
                    })
                })
            }
        }
    }
}
