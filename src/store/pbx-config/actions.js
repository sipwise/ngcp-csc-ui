
import _ from 'lodash';
import {
    assignNumbers
} from '../../api/user';
import {
    addGroup,
    removeGroup,
    addSeat,
    removeSeat,
    setGroupName,
    setGroupExtension,
    setGroupHuntPolicy,
    setGroupHuntTimeout,
    createDevice,
    removeDevice,
    updateGroupSeats,
    setSeatName,
    setSeatExtension,
    getProfiles,
    getModelFrontImage,
    updateDeviceKeys,
    updateSeatGroups,
    getGroupList,
    getSeatList,
    getDeviceList,
    getDevice,
    getAllGroupsAndSeats,
    setStationName,
    setIdentifier,
    setProfile,
    getGroup,
    getSeat,
    getCallQueueConfigurations,
    addCallQueueConfig,
    setQueueLengthConfig,
    setWrapUpTimeConfig,
    getConfig,
    getPrefs,
    removeCallQueue,
    getAllSoundSets,
    getSoundFilesGrouped,
    removeSoundSet,
    setSoundSetName,
    setSoundSetDescription,
    setSoundSetContractDefault,
    getSoundSet
} from '../../api/pbx-config'

export default {
    listGroups(context, options) {
        let silent = _.get(options, 'silent', false);
        let page = _.get(options, 'page', 1);
        context.commit('listRequesting', {
            silent: silent,
            page: page
        });
        getGroupList(page).then((data) => {
            context.commit('listSucceeded', data);
            return data;
        }).then((groups) => {
            groups.groups.items.forEach((group) => {
                context.dispatch('loadCallQueueForGroup', group.id);
            });
        }).catch((err) => {
            context.commit('listFailed', err.message);
        });
    },
    addGroup(context, group) {
        group.customerId = context.state.pilot.customer_id;
        group.domainId = context.state.pilot.domain_id;
        context.commit('addItemRequesting', group);
        context.commit('lastAddedGroup', group.name);
        addGroup(group).then(() => {
            return context.dispatch('listGroups', true);
        }).then(() => {
            context.commit('addItemSucceeded');
        }).catch((err) => {
            context.commit('addItemFailed', err.message);
        });
    },
    reloadGroup(context, group) {
        return new Promise((resolve, reject) => {
            context.commit('groupReloading', group);
            getGroup(group.id).then(($group) => {
                context.commit('groupReloaded', $group);
                return $group;
            }).then((data) => {
                context.dispatch('loadCallQueueForGroup', data.id);
            }).catch((err)=>{
                context.commit('groupReloadingFailed', {
                    group: group,
                    error: err.message
                });
            }).then(() => {
                resolve();
            }).catch((err) => {
                reject(err);
            });
        });
    },
    setGroupName(context, group) {
        context.commit('updateItemRequesting', group);
        context.commit('lastUpdatedField', {name: group.name, type: 'group name'});
        setGroupName(group.id, group.name).then(() => {
            return context.dispatch('reloadGroup', group);
        }).then(() => {
            context.commit('updateItemSucceeded');
        }).catch((err) => {
            context.commit('updateItemFailed', err.message);
        });
    },
    setGroupExtension(context, group) {
        context.commit('updateItemRequesting', group);
        context.commit('lastUpdatedField', {name: group.extension, type: 'group extension'});
        setGroupExtension(group.id, group.extension).then(() => {
            return context.dispatch('reloadGroup', group);
        }).then(() => {
            context.commit('updateItemSucceeded');
        }).catch((err) => {
            context.commit('updateItemFailed', err.message);
        });
    },
    setGroupHuntPolicy(context, group) {
        context.commit('updateItemRequesting', group);
        context.commit('lastUpdatedField', {name: group.huntPolicy + " ringing", type: 'group hunt policy'});
        setGroupHuntPolicy(group.id, group.huntPolicy).then(() => {
            return context.dispatch('reloadGroup', group);
        }).then(() => {
            context.commit('updateItemSucceeded');
        }).catch((err) => {
            context.commit('updateItemFailed', err.message);
        });
    },
    setGroupHuntTimeout(context, group) {
        context.commit('updateItemRequesting', group);
        context.commit('lastUpdatedField', {name: group.huntTimeout + " seconds", type: 'group hunt timeout'});
        setGroupHuntTimeout(group.id, group.huntTimeout).then(() => {
            return context.dispatch('reloadGroup', group);
        }).then(() => {
            context.commit('updateItemSucceeded');
        }).catch((err) => {
            context.commit('updateItemFailed', err.message);
        });
    },
    updateGroupAliasNumbers(context, data) {
        context.commit('updateAliasNumbersRequesting', data.item);
        Promise.all([
            assignNumbers(data.add, data.item.id),
            assignNumbers(data.remove, context.getters.pilotId)
        ]).then(() => {
            return context.dispatch('reloadGroup', data.item);
        }).then(() => {
            context.commit('updateAliasNumbersSucceeded');
        }).catch((err) => {
            context.commit('updateAliasNumbersFailed', err.message);
        });
    },
    updateSeatAliasNumbers(context, data) {
        context.commit('updateAliasNumbersRequesting', data.item);
        Promise.all([
            assignNumbers(data.add, data.item.id),
            assignNumbers(data.remove, context.getters.pilotId)
        ]).then(() => {
            return context.dispatch('reloadSeat', data.item);
        }).then(() => {
            context.commit('updateAliasNumbersSucceeded');
        }).catch((err) => {
            context.commit('updateAliasNumbersFailed', err.message);
        });
    },
    updateSeats(context, group) {
        context.commit('updateGroupsAndSeatsRequesting', group);
        updateGroupSeats(group.id, group.seats).then(() => {
            return context.dispatch('reloadGroup', group);
        }).then(() => {
            context.commit('updateGroupsAndSeatsSucceeded');
        }).catch((err) => {
            context.commit('updateGroupsAndSeatsFailed', err.message);
        });
    },
    removeGroup(context, group) {
        context.commit('removeItemRequesting', group);
        context.commit('lastRemovedGroup', group.name);
        removeGroup(group.id).then(() => {
            return context.dispatch('listGroups', true);
        }).then(() => {
            context.commit('removeGroup', group);
            context.commit('removeItemSucceeded');
        }).catch((err) => {
            context.commit('removeItemFailed', err.message);
        });
    },
    listSeats(context, options) {
        let silent = _.get(options, 'silent', false);
        let page = _.get(options, 'page', 1);
        context.commit('listRequesting', {
            silent: silent,
            page: page
        });
        getSeatList(page).then((data) => {
            context.commit('listSucceeded', data);
            return data;
        }).then((seats) => {
            seats.seats.items.forEach((seat) => {
                context.dispatch('loadCallQueueForSeat', seat.id);
            });
        }).catch((err) => {
            context.commit('listFailed', err.message);
        });
    },
    addSeat(context, seat) {
        seat.customerId = context.state.pilot.customer_id;
        seat.domainId = context.state.pilot.domain_id;
        context.commit('addItemRequesting', seat);
        context.commit('lastAddedSeat', seat.name);
        addSeat(seat).then(() => {
            return context.dispatch('listSeats', true);
        }).then(() => {
            context.commit('addItemSucceeded');
        }).catch((err) => {
            context.commit('addItemFailed', err.message);
        });
    },
    reloadSeat(context, seat) {
        return new Promise((resolve, reject) => {
            context.commit('seatReloading', seat);
            getSeat(seat.id).then(($seat) => {
                context.commit('seatReloaded', $seat);
                return $seat;
            }).then((data) => {
                context.dispatch('loadCallQueueForSeat', data.id);
            }).catch((err)=>{
                context.commit('seatReloadingFailed', {
                    seat: seat,
                    error: err.message
                });
            }).then(() => {
                resolve();
            }).catch((err) => {
                reject(err);
            });
        });
    },
    setSeatName(context, seat) {
        context.commit('updateItemRequesting', seat);
        context.commit('lastUpdatedField', {name: seat.name, type: 'seat name'});
        setSeatName(seat.id, seat.name).then(() => {
            return context.dispatch('reloadSeat', seat);
        }).then(() => {
            context.commit('updateItemSucceeded');
        }).catch((err) => {
            context.commit('updateItemFailed', err.message);
        });
    },
    setSeatExtension(context, seat) {
        context.commit('updateItemRequesting', seat);
        context.commit('lastUpdatedField', {name: seat.extension, type: 'seat extension'});
        setSeatExtension(seat.id, seat.extension).then(() => {
            return context.dispatch('reloadSeat', seat);
        }).then(() => {
            context.commit('updateItemSucceeded');
        }).catch((err) => {
            context.commit('updateItemFailed', err.message);
        });
    },
    updateGroups(context, seat) {
        context.commit('updateGroupsAndSeatsRequesting', seat);
        updateSeatGroups(seat.id, seat.groups).then(() => {
            return context.dispatch('reloadSeat', seat);
        }).then(() => {
            context.commit('updateGroupsAndSeatsSucceeded');
        }).catch((err) => {
            context.commit('updateGroupsAndSeatsFailed', err.message);
        });
    },
    removeSeat(context, seat) {
        context.commit('removeItemRequesting', seat);
        context.commit('lastRemovedSeat', seat.name);
        removeSeat(seat.id).then(() => {
            return context.dispatch('listSeats', true);
        }).then(() => {
            context.commit('removeItemSucceeded');
        }).catch((err) => {
            context.commit('removeItemFailed', err.message);
        });
    },
    listDevices(context, options) {
        return new Promise((resolve, reject) => {
            let silent = _.get(options, 'silent', false);
            context.commit('deviceListRequesting', silent);
            getDeviceList({
                page: _.get(context, 'getters.listCurrentPage', 1),
                profile_id: _.get(context, 'getters.listProfileFilter', null),
                identifier: _.get(context, 'getters.listMacAddressFilter', null),
                station_name: _.get(context, 'getters.listStationNameFilter', null)
            }).then((devices) => {
                context.commit('deviceListSucceeded', devices);
                devices.items.forEach((device) => {
                    context.dispatch('loadDevice', device.id);
                });
                resolve();
            }).catch((err) => {
                context.commit('deviceListFailed', err.message);
                reject(err);
            });
        });
    },
    loadDevice(context, deviceId) {
        context.commit('deviceRequesting', deviceId);
        getDevice(deviceId, {
            join: true,
            joinLines: false,
        }).then((device) => {
            context.commit('deviceSucceeded', device);
        }).catch((err) => {
            context.commit('deviceFailed', deviceId, err.message);
        });
    },
    loadProfiles(context) {
        if(!context.getters.hasProfiles) {
            getProfiles({ all: true }).then((profiles) => {
                context.commit('profilesSucceeded', profiles);
                profiles.items.forEach((profile) => {
                    context.dispatch('loadModelImage', profile.device_id);
                });
            }).catch((err) => {
                context.commit('profilesFailed', err.message);
            });
        }
    },
    loadModelImage(context, modelId) {
        context.commit('modelImageRequesting', modelId);
        getModelFrontImage(modelId).then((modelImage) => {
            context.commit('modelImageSucceeded', modelImage);
        }).catch((err) => {
            context.commit('modelImageFailed', modelId, err.message);
        });
    },
    createDevice(context, device) {
        context.commit('createDeviceRequesting', device);
        createDevice(device).then(() => {
            context.commit('createDeviceSucceeded');
            context.dispatch('listDevices', {
                page: context.getters.listCurrentPage,
                silent: true
            });
        }).catch((err) => {
            context.commit('createDeviceFailed', err.message);
        });
    },
    removeDevice(context, device) {
        context.commit('deviceRequesting', device.id);
        removeDevice(device.id).then(() => {
            context.commit('deviceRemoved', device);
            context.dispatch('listDevices', {
                page: context.getters.listCurrentPage,
                silent: true
            });
        }).catch((err) => {
            context.commit('deviceFailed', device.id, err.message);
        });
    },
    getAllGroupsAndSeats(context) {
        context.commit('groupsAndSeatsRequesting');
        getAllGroupsAndSeats().then((list) => {
            context.commit('groupsAndSeatsSucceeded', list);
        }).catch((err) => {
            context.commit('groupsAndSeatsError', err.message);
        });
    },
    updateDeviceKeys(context, data) {
        context.commit('updateDeviceKeyRequesting', data.device.id);
        updateDeviceKeys(data.device.id, data.keys).then(() => {
            context.commit('updateDeviceKeySucceeded', data);
            context.dispatch('loadDevice', data.device.id);
        }).catch((err) => {
            context.commit('updateDeviceKeyFailed', data.device.id, err);
        });
    },
    listProfiles(context) {
        context.commit('listProfilesRequesting');
        getProfiles({ all: true }).then((profiles) => {
            context.commit('listProfilesSucceeded', profiles);
        }).catch((err) => {
            context.commit('listProfilesFailed', err.message);
        });
    },
    setStationName(context, device) {
        context.commit('updateStationNameRequesting', device);
        setStationName(device).then(() => {
            context.commit('updateStationNameSucceeded');
            context.dispatch('loadDevice', device.id);
        }).catch((err) => {
            context.commit('updateStationNameFailed', err.message);
        });
    },
    setIdentifier(context, device) {
        context.commit('updateIdentifierRequesting', device);
        setIdentifier(device.id, device.identifier).then(() => {
            context.commit('updateIdentifierSucceeded');
            context.dispatch('loadDevice', device.id);
        }).catch((err) => {
            context.commit('updateIdentifierFailed', err.message);
        });
    },
    setProfile(context, data) {
        context.commit('updateProfileRequesting', data.device);
        setProfile(data.device.id, data.profile.id).then(() => {
            context.commit('updateProfileSucceeded');
            context.dispatch('loadDevice', data.device.id);
        }).catch((err) => {
            context.commit('updateProfileFailed', err.message);
        });
    },
    filterByProfile(context, profileId) {
        context.commit('filterByProfile', profileId);
        context.dispatch('listDevices');
    },
    filterByMacAddress(context, macAddress) {
        context.commit('filterByMacAddress', macAddress);
        context.dispatch('listDevices');
    },
    filterByStationName(context, stationName) {
        context.commit('filterByStationName', stationName);
        context.dispatch('listDevices');
    },
    resetProfileFilter(context) {
        context.commit('resetProfileFilter');
        context.dispatch('listDevices');
    },
    resetMacAddressFilter(context) {
        context.commit('resetMacAddressFilter');
        context.dispatch('listDevices');
    },
    resetStationNameFilter(context) {
        context.commit('resetStationNameFilter');
        context.dispatch('listDevices');
    },
    goToPage(context, page) {
        context.commit('goToPage', page);
        context.dispatch('listDevices');
    },
    resetDeviceFilters(context) {
        context.commit('resetProfileFilter');
        context.commit('resetStationNameFilter');
        context.commit('resetMacAddressFilter');
        context.dispatch('listDevices');
    },
    listCallQueueGroupsAndSeats(context, options) {
        let silent = _.get(options, 'silent', false);
        context.commit('callQueueListRequesting', silent);
        getCallQueueConfigurations().then((list) => {
            context.commit('callQueueListSucceeded', list);
        }).catch((err) => {
            context.commit('callQueueListFailed', err.message);
        });
    },
    addCallQueueConfig(context, data) {
        let config = Object.assign(data.config, {
            cloud_pbx_callqueue: true
        });
        if (!_.isNull(config.max_queue_length) && config.max_queue_length.length === 0) {
            config.max_queue_length = null;
        }
        if (!_.isNull(config.queue_wrap_up_time) && config.queue_wrap_up_time.length === 0) {
            config.queue_wrap_up_time = null;
        }
        context.commit('addItemRequesting', config);
        addCallQueueConfig(data.id, config).then(() => {
            return context.dispatch('listCallQueueGroupsAndSeats', true);
        }).then(() => {
            context.commit('addItemSucceeded');
        }).catch((err) => {
            context.commit('addItemFailed', err.message);
        });
    },
    reloadConfig(context, config) {
        return new Promise((resolve, reject) => {
            context.commit('configReloading', config);
            getConfig(config.id).then(($config) => {
                context.commit('configReloaded', $config);
            }).catch((err) => {
                context.commit('configReloadingFailed', {
                    config: config,
                    error: err.message
                });
            }).then(() => {
                resolve();
            }).catch((err) => {
                reject(err);
            });
        });
    },
    setQueueLength(context, subscriber) {
        let updateItem = {
            id: subscriber.id,
            max_queue_length: subscriber.max_queue_length || 5,
            queue_wrap_up_time: subscriber.queue_wrap_up_time || 10
        };
        context.commit('updateItemRequesting', updateItem);
        setQueueLengthConfig(updateItem.id, updateItem.max_queue_length).then(() => {
            return context.dispatch('reloadConfig', updateItem);
        }).then(() => {
            context.commit('updateItemSucceeded');
        }).catch((err) => {
            context.commit('updateItemFailed', err.message);
        });
    },
    setWrapUpTime(context, subscriber) {
        let updateItem = {
            id: subscriber.id,
            max_queue_length: subscriber.max_queue_length || 5,
            queue_wrap_up_time: subscriber.queue_wrap_up_time || 10
        };
        context.commit('updateItemRequesting', updateItem);
        setWrapUpTimeConfig(updateItem.id, updateItem.queue_wrap_up_time).then(() => {
            return context.dispatch('reloadConfig', updateItem);
        }).then(() => {
            context.commit('updateItemSucceeded');
        }).catch((err) => {
            context.commit('updateItemFailed', err.message);
        });
    },
    loadCallQueueForGroup(context, subscriberId) {
        context.commit('preferenceRequesting', 'group', subscriberId);
        getPrefs(subscriberId).then(($preferences) => {
            let preferences = $preferences;
            delete preferences._link;
            context.commit('preferenceSucceeded', {
                type: 'group',
                preferences: preferences
            });
        }).catch((err) => {
            context.commit('preferenceFailed', 'group', subscriberId, err.message);
        })
    },
    loadCallQueueForSeat(context, subscriberId) {
        context.commit('preferenceRequesting', 'seat', subscriberId);
        getPrefs(subscriberId).then(($preferences) => {
            let preferences = $preferences;
            delete preferences._link;
            context.commit('preferenceSucceeded', {
                type: 'seat',
                preferences: preferences
            });
        }).catch((err) => {
            context.commit('preferenceFailed', 'seat', subscriberId, err.message);
        })
    },
    removeCallQueue(context, config) {
        context.commit('removeItemRequesting', config);
        removeCallQueue(config.id).then(() => {
            return context.dispatch('listCallQueueGroupsAndSeats', true);
        }).then(() => {
            context.commit('removeItemSucceeded');
        }).catch((err) => {
            context.commit('removeItemFailed', err.message);
        });
    },
    listSoundSets(context) {
        context.commit('listSoundSetsRequesting');
        getAllSoundSets().then((data) => {
            context.commit('listSoundSetsSucceeded', data);
            return data;
        }).then((sets) => {
            sets.items.forEach((set) => {
                context.dispatch('loadFilesForSoundSet', set.id);
            });
        }).catch((err) => {
            context.commit('listSoundSetsFailed', err.message)
        });
    },
    loadFilesForSoundSet(context, id) {
        let options = {
            params: {
                set_id: id + ''
            }
        }
        context.commit('filesForSoundSetRequesting', id);
        getSoundFilesGrouped(options).then((files) => {
            let id = options.params.set_id;
            context.commit('filesForSoundSetSucceeded', {
                files: files,
                id: id
            });
        }).catch((err) => {
            context.commit('filesForSoundSetFailed',  id, err);
        })
    },
    removeSoundSet(context, soundSet) {
        context.commit('removeItemRequesting', soundSet);
        removeSoundSet(soundSet.id).then(() => {
            return context.dispatch('listSoundSets');
        }).then(() => {
            context.commit('removeItemSucceeded');
        }).catch((err) => {
            context.commit('removeItemFailed', err.message);
        });
    },
    saveSoundSetName(context, set) {
        context.commit('updateItemRequesting', set);
        context.commit('lastUpdatedField', {name: set.name, type: 'sound set name'});
        setSoundSetName(set.id, set.name).then(() => {
            return context.dispatch('reloadSoundSet', set);
        }).then(() => {
            context.commit('updateItemSucceeded');
        }).catch((err) => {
            context.commit('updateItemFailed', err.message);
        });
    },
    saveSoundSetDescription(context, set) {
        context.commit('updateItemRequesting', set);
        context.commit('lastUpdatedField', {name: set.name, type: 'sound set name'});
        setSoundSetDescription(set.id, set.description).then(() => {
            return context.dispatch('reloadSoundSet', set);
        }).then(() => {
            context.commit('updateItemSucceeded');
        }).catch((err) => {
            context.commit('updateItemFailed', err.message);
        });
    },
    saveContractDefault(context, set) {
        let defaultName = set.contract_default ? 'on' : 'off';
        context.commit('updateItemRequesting', set);
        context.commit('lastUpdatedField', {name: defaultName, type: 'default for subscribers'});
        setSoundSetContractDefault(set.id, set.contract_default).then(() => {
            return context.dispatch('reloadSoundSet', set);
        }).then(() => {
            context.commit('updateItemSucceeded');
        }).catch((err) => {
            context.commit('updateItemFailed', err.message);
        });
    },
    reloadSoundSet(context, set) {
        return new Promise((resolve, reject) => {
            context.commit('soundSetReloading', set);
            getSoundSet(set.id).then(($set) => {
                context.commit('soundSetReloaded', $set);
                return $set;
            }).then((data) => {
                context.dispatch('loadFilesForSoundSet', data.id);
            }).catch((err)=>{
                context.commit('soundSetReloadingFailed', {
                    set: set,
                    error: err.message
                });
            }).then(() => {
                resolve();
            }).catch((err) => {
                reject(err);
            });
        });
    }
}
