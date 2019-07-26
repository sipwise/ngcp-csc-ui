'use strict';

import {
    i18n
} from '../i18n'
import Vue from 'vue'
import numberFilter from "../filters/number";
import _ from "lodash";
import {
    getAllProfiles
} from '../api/pbx-config'
import {
    getSubscribers
} from "../api/subscriber";
import {
    RequestState
} from "./common";
import {
    loadDeviceModel
} from "../api/pbx-devices";
import {getNumbers} from "../api/user";

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
        subscriberList: [],
        subscriberListState: RequestState.initiated,
        subscriberMap: {}
    },
    getters: {
        pilot(state) {
            return state.pilot;
        },
        numbers(state) {
            return state.numberList;
        },
        getNumberOptions(state) {
            let options = [];
            state.numberList.forEach((number)=>{
                if(!number.is_primary) {
                    options.push({
                        label: numberFilter(number),
                        value: number.id
                    });
                }
            });
            return options;
        },
        getFullNumberOptions(state) {
            let options = [];
            state.numberList.forEach((number)=>{
                options.push({
                    label: numberFilter(number),
                    value: numberFilter(number)
                });
            });
            return options;
        },
        getSeatOptions(state) {
            let options = [];
            state.seatList.forEach((seat)=>{
                options.push({
                    label: seat.display_name,
                    value: seat.id
                });
            });
            return options;
        },
        getGroupOptions(state) {
            let options = [];
            state.groupList.forEach((group)=>{
                options.push({
                    label: group.display_name,
                    value: group.id
                });
            });
            return options;
        },
        getSoundSetOptions(state) {
            let options = [];
            let defaultLabel = i18n.t('pbxConfig.defaultSoundSetName');
            state.soundSetList.forEach((soundSet)=>{
                if(soundSet.contract_default) {
                    defaultLabel = i18n.t('pbxConfig.defaultSoundSetName') + ' (' + soundSet.name + ')'
                }
                else {
                    options.push({
                        label: soundSet.name,
                        value: soundSet.id
                    });
                }
            });
            options.unshift({
                label: defaultLabel,
                value: null
            });
            return options;
        },
        getSoundSetByName(state) {
            return (name)=>{
                return _.get(state.soundSetMapByName, name, null);
            };
        },
        getSubscriberOptions(state) {
            let options = [];
            options.push({
                label: i18n.t('pbxConfig.keyEmptyLabel'),
                icon: 'clear',
                value: null,
                leftColor: 'white',
                rightColor: 'white'
            });
            state.subscriberList.forEach((subscriber)=>{
                let icon = 'person';
                if(subscriber.is_pbx_group) {
                    icon = 'group';
                }
                else if (subscriber.is_pbx_pilot) {
                    icon = 'person_outline';
                }
                options.push({
                    label: subscriber.display_name,
                    icon: icon,
                    value: subscriber.id,
                    leftColor: 'white',
                    rightColor: 'white'
                });
            });
            return options;
        },
        isSubscribersRequesting(state) {
            return state.subscriberListState === RequestState.requesting;
        },
        isNumbersRequesting(state) {
            return state.numberListState === RequestState.requesting;
        }
    },
    mutations: {
        pilotSucceeded(state, pilotItem) {
            state.pilot = pilotItem;
        },
        numbersRequesting(state) {
            state.numberListState = RequestState.requesting;
        },
        numbersSucceeded(state, numberList) {
            state.numberListState = RequestState.succeeded;
            state.numberList = _.get(numberList, 'items', []);
            state.numberMapById = {};
            state.numberList.forEach((number)=>{
                Vue.set(state.numberMapById, number.id, number);
            });
        },
        seatsSucceeded(state, seatList) {
            state.seatList = _.get(seatList, 'items', []);
            state.seatMapById = {};
            state.seatList.forEach((seat)=>{
                Vue.set(state.seatMapById, seat.id, seat);
            });
        },
        groupsSucceeded(state, groupList) {
            state.groupList = _.get(groupList, 'items', []);
            state.groupMapById = {};
            state.groupList.forEach((group)=>{
                Vue.set(state.groupMapById, group.id, group);
            });
        },
        soundSetsSucceeded(state, soundSetList) {
            state.soundSetList = _.get(soundSetList, 'items', []);
            state.soundSetMapByName = {};
            state.soundSetList.forEach((soundSet)=>{
                Vue.set(state.soundSetMapByName, soundSet.name, soundSet);
            });
        },
        deviceProfilesSucceeded(state, deviceProfileList) {
            state.deviceProfileList = _.get(deviceProfileList, 'items', []);
            state.deviceProfileMap = {};
            state.deviceProfileList.forEach((deviceProfile)=>{
                Vue.set(state.deviceProfileMap, deviceProfile.id, deviceProfile);
            });
        },
        deviceProfilesFailed(state) {
            state.deviceProfileList = [];
            state.deviceProfileMap = {};
        },
        deviceModelSucceeded(state, deviceModel) {
            let model = _.get(deviceModel, 'model', null);
            let modelImage = _.get(deviceModel, 'modelImage', null);
            if(model !== null) {
                Vue.set(state.deviceModelMap, deviceModel.model.id, deviceModel.model);
            }
            if(modelImage !== null) {
                Vue.set(state.deviceModelImageMap, deviceModel.modelImage.id, deviceModel.modelImage);
            }
        },
        deviceModelFailed(state, deviceModelId) {
            Vue.delete(state.deviceModelMap, deviceModelId);
            Vue.delete(state.deviceModelImageMap, deviceModelId);
        },
        subscribersRequesting(state) {
            state.subcriberListState = RequestState.requesting;
            state.subscriberList = [];
        },
        subscribersSucceeded(state, subscribers) {
            state.subscriberList = _.get(subscribers, 'items', []);
            state.subscriberMap = {};
            state.subscriberList.forEach((subscriber)=>{
                Vue.set(state.subscriberMap, subscriber.id, subscriber);
            });
        }
    },
    actions: {
        loadProfiles(context) {
            return new Promise((resolve, reject)=>{
                if(context.state.deviceProfileList.length === 0) {
                    getAllProfiles().then((profiles)=>{
                        context.commit('deviceProfilesSucceeded', profiles);
                        resolve(profiles);
                    }).catch((err)=>{
                        context.commit('deviceProfilesFailed');
                        reject(err);
                    });
                }
                else {
                    resolve();
                }
            });
        },
        loadDeviceModel(context, deviceModelId) {
            if(!context.state.deviceModelMap[deviceModelId]) {
                loadDeviceModel(deviceModelId).then((deviceModel)=>{
                    context.commit('deviceModelSucceeded', deviceModel);
                }).catch(()=>{
                    context.commit('deviceModelFailed', deviceModelId);
                });
            }
        },
        loadDeviceModels(context) {
            context.state.deviceProfileList.forEach((profile)=>{
                context.dispatch('loadDeviceModel', profile.device_id);
            });
        },
        loadSubscribers(context) {
            if(context.state.subscriberList.length === 0 &&
                context.state.subscriberListState !== RequestState.requesting) {
                context.commit('subscribersRequesting');
                getSubscribers({
                    all: true
                }).then((subscribers)=>{
                    context.commit('subscribersSucceeded', subscribers);
                }).catch((err)=>{
                    console.debug(err);
                    context.commit('subscribersSucceeded', {
                        items: []
                    });
                });
            }
        },
        loadNumbers(context) {
            if(context.state.numberList.length === 0 &&
                context.state.numberListState !== RequestState.requesting) {
                context.commit('numbersRequesting');
                getNumbers({
                    all: true
                }).then((numbers)=>{
                    context.commit('numbersSucceeded', numbers);
                }).catch((err)=>{
                    console.debug(err);
                    context.commit('numbersSucceeded', {
                        items: []
                    });
                });
            }
        }
    }
};
