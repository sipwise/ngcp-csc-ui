import { i18n } from 'boot/i18n'
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
import numberFilter from 'src/filters/number'
import { RequestState } from 'src/store/common'

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
        deviceProfilesListState: RequestState.initiated,
        deviceProfileList: [],
        deviceProfileMap: {},
        deviceModelList: [],
        deviceModelMap: {},
        deviceModelImageMap: {},
        deviceModelImageSmallMap: {},
        subscriberList: [],
        subscriberListState: RequestState.initiated,
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
            const defaultLabel = i18n.global.t('Default')
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
                label: i18n.global.t('Unassigned'),
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
                    icon,
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
            if (min >= 0 && max === null) {
                return i18n.global.t('Minimum allowed extension is {min}', {
                    min
                })
            } else if (min < 0 && max) {
                return i18n.global.t('Maximum allowed extension is {max}', {
                    max
                })
            } else if (min >= 0 && max) {
                return i18n.global.t('Allowed extensions are between {min} and {max}', {
                    min,
                    max
                })
            }
            return null
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
        deviceProfilesListStateRequesting (state) {
            state.deviceProfilesListState = RequestState.requesting
        },
        deviceProfilesListSucceeded (state, deviceProfileList) {
            state.deviceProfilesListState = RequestState.succeeded
            state.deviceProfileList = _.get(deviceProfileList, 'items', [])
            state.deviceProfileMap = {}
            state.deviceProfileList.forEach((deviceProfile) => {
                state.deviceProfileMap[deviceProfile.id] = deviceProfile
            })
        },
        deviceProfilesListFailed (state) {
            state.deviceProfilesListState = RequestState.failed
        },
        deviceProfileRequesting (state) {
            state.deviceProfilesListState = RequestState.requesting
        },
        deviceProfileSucceeded (state, deviceProfile) {
            state.deviceProfilesListState = RequestState.succeeded
            state.deviceProfileList = [...state.deviceProfileList, deviceProfile]
            state.deviceProfileMap[deviceProfile.id] = deviceProfile
        },
        deviceProfileFailed (state) {
            state.deviceProfilesListState = RequestState.failed
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
            state.subcriberListState = RequestState.requesting
            state.subscriberList = []
        },
        subscribersSucceeded (state, subscribers) {
            state.subscriberList = _.get(subscribers, 'items', [])
            state.subscriberMap = {}
            state.subscriberList.forEach((subscriber) => {
                state.subscriberMap[subscriber.id] = subscriber
            })
        }
    },
    actions: {
        loadProfiles (context) {
            return new Promise((resolve, reject) => {
                context.commit('deviceProfilesListStateRequesting')
                if (context.state.deviceProfileList.length === 0) {
                    getAllProfiles().then((profiles) => {
                        context.commit('deviceProfilesListSucceeded', profiles)
                        resolve(profiles)
                    }).catch((err) => {
                        context.commit('deviceProfilesListFailed')
                        reject(err)
                    })
                } else {
                    resolve()
                }
            })
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
                context.commit('deviceModelFailed', payload.deviceId)
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
                }).catch(() => {
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
                }).catch(() => {
                    context.commit('numbersSucceeded', {
                        items: []
                    })
                })
            }
        }
    }
}
