
import Vue from 'vue'
import numberFilter from '../filters/number'
import _ from 'lodash'
import {
    getAllProfiles, getModel, getModelFrontImage, getModelFrontThumbnailImage
} from '../api/pbx-config'
import {
    getSubscribers
} from '../api/subscriber'
import {
    RequestState
} from './common'
// import {
//     loadDeviceModel
// } from '../api/pbx-devices'
import { getNumbers } from '../api/user'
import {
    i18n
} from 'src/boot/i18n'

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
        deviceProfileList: [],
        deviceProfileMap: {},
        deviceModelList: [],
        deviceModelMap: {},
        deviceModelImageMap: {},
        deviceModelImageSmallMap: {},
        subscriberList: [],
        subscriberListState: RequestState.initiated,
        subscriberMap: {}
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
                    label: seat.display_name,
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
            let defaultLabel = i18n.t('Default')
            state.soundSetList.forEach((soundSet) => {
                if (soundSet.contract_default) {
                    defaultLabel = i18n.t('Default') + ' (' + soundSet.name + ')'
                } else {
                    options.push({
                        label: soundSet.name,
                        value: soundSet.id
                    })
                }
            })
            options.unshift({
                label: defaultLabel,
                value: null
            })
            return options
        },
        getSoundSetByName (state) {
            return (name) => {
                return _.get(state.soundSetMapByName, name, null)
            }
        },
        getSubscriberOptions (state) {
            const options = []
            options.push({
                label: i18n.t('Unassigned'),
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
        isSubscribersRequesting (state) {
            return state.subscriberListState === RequestState.requesting
        },
        isNumbersRequesting (state) {
            return state.numberListState === RequestState.requesting
        },
        getMinAllowedExtension (state, getters, rootState, rootGetters) {
            const subscriber = rootGetters['user/getSubscriber']
            return subscriber.ext_range_min
        },
        getMaxAllowedExtension (state, getters, rootState, rootGetters) {
            const subscriber = rootGetters['user/getSubscriber']
            return subscriber.ext_range_max
        },
        getExtensionHint (state, getters, rootState, rootGetters) {
            const min = getters.getMinAllowedExtension
            const max = getters.getMaxAllowedExtension
            if (min && max == null) {
                return i18n.t('Minimum allowed extension is {min}', {
                    min: min
                })
            } else if (min == null && max) {
                return i18n.t('Maximum allowed extension is {max}', {
                    max: max
                })
            } else if (min && max) {
                return i18n.t('Allowed extensions are between {min} and {max}', {
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
                Vue.set(state.numberMapById, number.id, number)
            })
        },
        seatsSucceeded (state, seatList) {
            state.seatList = _.get(seatList, 'items', [])
            state.seatMapById = {}
            state.seatList.forEach((seat) => {
                Vue.set(state.seatMapById, seat.id, seat)
            })
        },
        groupsSucceeded (state, groupList) {
            state.groupList = _.get(groupList, 'items', [])
            state.groupMapById = {}
            state.groupList.forEach((group) => {
                Vue.set(state.groupMapById, group.id, group)
            })
        },
        soundSetsSucceeded (state, soundSetList) {
            state.soundSetList = _.get(soundSetList, 'items', [])
            state.soundSetMapByName = {}
            state.soundSetList.forEach((soundSet) => {
                Vue.set(state.soundSetMapByName, soundSet.name, soundSet)
            })
        },
        deviceProfilesSucceeded (state, deviceProfileList) {
            state.deviceProfileList = _.get(deviceProfileList, 'items', [])
            state.deviceProfileMap = {}
            state.deviceProfileList.forEach((deviceProfile) => {
                Vue.set(state.deviceProfileMap, deviceProfile.id, deviceProfile)
            })
        },
        deviceProfilesFailed (state) {
            state.deviceProfileList = []
            state.deviceProfileMap = {}
        },
        deviceModelSucceeded (state, deviceModel) {
            const model = _.get(deviceModel, 'model', null)
            const modelImage = _.get(deviceModel, 'modelImage', null)
            const modelImageThumbnail = _.get(deviceModel, 'modelImageThumbnail', null)
            if (model !== null) {
                Vue.set(state.deviceModelMap, model.id, model)
            }
            if (modelImage !== null) {
                Vue.set(state.deviceModelImageMap, modelImage.id, modelImage)
            }
            if (modelImageThumbnail !== null) {
                Vue.set(state.deviceModelImageSmallMap, modelImageThumbnail.id, modelImageThumbnail)
            }
        },
        deviceModelFailed (state, deviceModelId) {
            Vue.delete(state.deviceModelMap, deviceModelId)
            Vue.delete(state.deviceModelImageMap, deviceModelId)
            Vue.delete(state.deviceModelImageSmallMap, deviceModelId)
        },
        subscribersRequesting (state) {
            state.subcriberListState = RequestState.requesting
            state.subscriberList = []
        },
        subscribersSucceeded (state, subscribers) {
            state.subscriberList = _.get(subscribers, 'items', [])
            state.subscriberMap = {}
            state.subscriberList.forEach((subscriber) => {
                Vue.set(state.subscriberMap, subscriber.id, subscriber)
            })
        }
    },
    actions: {
        loadProfiles (context) {
            return new Promise((resolve, reject) => {
                if (context.state.deviceProfileList.length === 0) {
                    getAllProfiles().then((profiles) => {
                        context.commit('deviceProfilesSucceeded', profiles)
                        resolve(profiles)
                    }).catch((err) => {
                        context.commit('deviceProfilesFailed')
                        reject(err)
                    })
                } else {
                    resolve()
                }
            })
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
            const requests = []
            for (let i = 0; i < context.state.deviceProfileList.length; i++) {
                requests.push(context.dispatch('loadDeviceModel', {
                    deviceId: context.state.deviceProfileList[i].device_id,
                    type: imageType
                }))
            }
            await Promise.all(requests)
        },
        loadSubscribers (context) {
            if (context.state.subscriberList.length === 0 &&
                context.state.subscriberListState !== RequestState.requesting) {
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
