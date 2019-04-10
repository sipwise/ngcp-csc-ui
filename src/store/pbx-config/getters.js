'use strict';

import _ from 'lodash'
import { RequestState } from '../common'
import { i18n } from '../../i18n';

export default {
    groups(state) {
        return state.groupsOrdered;
    },
    seats(state) {
        return state.seatsOrdered;
    },
    numbers(state) {
        return _.get(state, 'numbers', []);
    },
    primaryNumbers(state, getters) {
        let numbers = getters.numbers;
        let primaryNumbers = [];
        if(_.isArray(numbers)) {
            numbers.forEach((number)=>{
                if(number.is_primary) {
                    primaryNumbers.push(number);
                }
            });
        }
        return primaryNumbers;
    },
    aliasNumbers(state, getters) {
        let numbers = getters.numbers;
        let aliasNumbers = [];
        if(_.isArray(numbers) && numbers.length) {
            numbers.forEach((number)=>{
                if(!number.is_primary) {
                    aliasNumbers.push(number);
                }
            });
        }
        return aliasNumbers;
    },
    isListRequesting(state) {
        return state.listState === RequestState.requesting;
    },
    isListLoadingSilently(state) {
        return (state.listLoadingSilently === true);
    },
    isListLoadingVisible(state, getters) {
        return getters.isListRequesting && !getters.isListLoadingSilently;
    },
    listState(state) {
        return state.listState;
    },
    listError(state) {
        return state.listError;
    },
    listLoadingSilently(state) {
        return (state.listLoadingSilently === true);
    },
    pilotId(state) {
        return state.pilot ? state.pilot.id : null;
    },
    isAdding(state) {
        return state.addState === RequestState.requesting;
    },
    addState(state) {
        return state.addState;
    },
    addItem(state) {
        return state.addItem;
    },
    addError(state) {
        return state.addError;
    },
    isUpdating(state) {
        return state.updateState === RequestState.requesting;
    },
    isUpdatingAliasNumbers(state) {
        return state.updateAliasNumbersState === RequestState.requesting;
    },
    isUpdatingGroupsAndSeats(state) {
        return state.updateGroupsAndSeatsState === RequestState.requesting;
    },
    updateState(state) {
        return state.updateState;
    },
    updateItem(state) {
        return state.updateItem;
    },
    updateGroupsAndSeatsItem(state) {
        return state.updateGroupsAndSeatsItem;
    },
    updateAliasNumbersItem(state) {
        return state.updateAliasNumbersItem;
    },
    updateItemId(state, getters) {
        if(_.isObject(getters.updateItem)) {
            return getters.updateItem.id;
        }
        return null;
    },
    updateGroupsAndSeatsItemId(state, getters) {
        if(_.isObject(getters.updateGroupsAndSeatsItem)) {
            return getters.updateGroupsAndSeatsItem.id;
        }
        return null;
    },
    updateAliasNumbersItemId(state, getters) {
        if(_.isObject(getters.updateAliasNumbersItem)) {
            return getters.updateAliasNumbersItem.id;
        }
        return null;
    },
    updateError(state) {
        return state.updateError;
    },
    isRemoving(state) {
        return state.removeState === RequestState.requesting;
    },
    removeState(state) {
        return state.removeState;
    },
    removeItem(state) {
        return state.removeItem;
    },
    removeItemId(state, getters) {
        if(_.isObject(getters.removeItem)) {
            return getters.removeItem.id;
        }
        return null;
    },
    removeError(state) {
        return state.removeError;
    },
    devices(state) {
        return state.devicesOrdered;
    },
    listCurrentPage(state) {
        return state.listCurrentPage;
    },
    listLastPage(state) {
        return state.listLastPage;
    },
    isDeviceLoading(state) {
        return (id) => {
            return state.deviceStates[id + ""] === RequestState.requesting;
        }
    },
    lastAddedGroup(state) {
        return state.lastAddedGroup;
    },
    lastRemovedGroup(state) {
        return state.lastRemovedGroup;
    },
    lastUpdatedField(state) {
        return state.lastUpdatedField;
    },
    updateAliasNumbersState(state) {
        return state.updateAliasNumbersState;
    },
    updateGroupsAndSeatsState(state) {
        return state.updateGroupsAndSeatsState;
    },
    lastAddedSeat(state) {
        return state.lastAddedSeat;
    },
    lastRemovedSeat(state) {
        return state.lastRemovedSeat;
    },
    profiles(state) {
        return state.profilesOrdered;
    },
    models(state) {
        return state.models;
    },
    hasProfiles(state) {
        return state.profilesOrdered.length > 0;
    },
    deviceRemoved(state) {
        return state.deviceRemoved;
    },
    groupsAndSeats(state) {
        return state.groupsAndSeats;
    },
    groupsAndSeatsOptions(state) {
        let options = [
            {
                icon: 'clear',
                label: i18n.t('pbxConfig.keyEmptyLabel'),
                value: null
            }
        ];
        state.groupsAndSeats.forEach((item)=>{
            let icon = 'person';
            if(item.is_pbx_pilot) {
                icon = 'person_outline';
            }
            else if (item.is_pbx_group){
                icon = 'group';
            }
            options.push({
                icon: icon,
                label: item.display_name,
                value: item.id
            });
        });
        return options;
    },
    getGroupOrSeatById(state) {
        return (id)=>{
            let groupOrSeat = null;
            state.groupsAndSeats.forEach(($groupOrSeat)=>{
                if(id === $groupOrSeat.id) {
                    groupOrSeat = $groupOrSeat;
                }
            });
            return groupOrSeat;
        };
    },
    updatedDeviceKey(state) {
        return state.updatedDeviceKey;
    },
    createDeviceRequesting(state) {
        return state.createDeviceState === RequestState.requesting;
    },
    createDeviceSucceeded(state) {
        return state.createDeviceState === RequestState.succeeded;
    },
    createDeviceFailed(state) {
        return state.createDeviceState === RequestState.failed;
    },
    createDeviceError(state) {
        return state.createDeviceError;
    },
    createDeviceItem(state) {
        return state.createDeviceItem;
    },
    profileOptions(state) {
        let profileOptions = [];
        state.profilesOrdered.forEach((profile) => {
            profileOptions.push({
                label: profile.name,
                value: profile.id
            });
        });
        return profileOptions;
    },
    listProfilesState(state) {
        return state.listState;
    },
    listProfilesError(state) {
        return state.listError;
    },
    updatedStationName(state) {
        return state.updatedStationName;
    },
    modelImages(state) {
        return state.modelImages;
    },
    updatedDevice(state) {
        return state.updatedDevice;
    },
    updatedDeviceSucceeded(state) {
        return state.updatedDeviceState === 'succeeded';
    },
    updatedDeviceError(state) {
        return state.updatedDeviceError;
    },
    updatedDeviceProperty(state) {
        return state.updatedDeviceProperty;
    },
    listProfileFilter(state) {
        return state.listProfileFilter;
    },
    listProfileFilterObject(state) {
        if(state.listProfileFilter !== null) {
            let profile = state.profiles[state.listProfileFilter];
            profile.modelImage = state.modelImages[profile.device_id];
            return profile;
        }
        else {
            return null;
        }
    },
    listMacAddressFilter(state) {
        return state.listMacAddressFilter;
    },
    listStationNameFilter(state) {
        return state.listStationNameFilter;
    },
    chipModelFilter(state) {
        return state.chipModelFilter;
    },
    chipMacAddressFilter(state) {
        return state.chipMacAddressFilter;
    },
    chipStationNameFilter(state) {
        return state.chipStationNameFilter;
    },
    callQueueGroupsAndSeats(state) {
        return state.callQueueGroupsAndSeatsOrdered;
    },
    assignableGroupsAndSeatsOptions(state, getters) {
        return getters.groupsAndSeatsOptions.filter((option) => {
            return option.label !== 'Unassigned';
        });
    },
    callQueueGroupsAndSeatsOptions(state, getters) {
        let ids = _.map(state.callQueueGroupsAndSeats, (item) => {
            return item.id;
        });
        let options = getters.assignableGroupsAndSeatsOptions
            .filter((item) => {
                return ids.indexOf(item.value) === -1;
            }
        ).map((item)=>{
            item.leftColor = 'primary';
            return item;
        });
        return options;
    },
    configItemById(state) {
        return (id) => {
            return state.callQueueGroupsAndSeats.filter((item) => {
                return item.id === id;
            })
        }
    },
    soundSets(state) {
        return state.soundSetsList.map((setId) => {
            return state.soundSets[setId];
        });
    },
    soundSetFilesLoading(state) {
        return (id) => {
            return state.soundSetFilesStates[id] !== 'succeeded';
        }
    },
    isSoundSetsRequesting(state) {
        return state.listSoundSetsState === RequestState.requesting;
    },
    playSoundFileUrl(state) {
        return (id) => {
            return state.soundFileUrls[id];
        }
    },
    playSoundFileLoaded(state) {
        return (id) => {
            return state.soundFileUrls[id] ? true : false;
        }
    },
    isLastPlayed(state) {
        return (id) => {
            return state.lastPlayed + '' === id + '';
        }
    },
    lastAddedCallQueue(state, getters) {
        let lastAddedItem = '';
        if (state.addItem) {
            let added = _.find(getters.callQueueGroupsAndSeatsOptions, (option) => {
                return option.value == state.addItem.id
            });
            lastAddedItem = added ? added.label : '';
        }
        return lastAddedItem;
    },
    lastAddedSoundSet(state) {
        return state.addItem ? state.addItem.name : '';
    },
    groupLabel() {
        return (name) => {
            let regex = /[-_]/g;
            return _.capitalize(name.replace(regex, ' '));
        }
    },
    soundSetInvalidCount(state) {
        return (id) => {
            let count = 0;
            let soundSet = _.get(state, 'soundSets', {})[id];
            if (soundSet.hasOwnProperty('groups')) {
                soundSet.groups.forEach((group) => {
                    group.handles.forEach((handle) => {
                        if (handle.filename.length === 0) {
                            count++;
                        }
                    })
                });
            }
            return count;
        }
    },
    isRemoveFileRequesting(state) {
        return (id) => {
            return id ? state.removeItem === id : false;
        }
    },
    uploadSoundFileRequesting(state) {
        return (handle) => {
            return state.uploadSoundFileStates[handle] === 'requesting';
        }
    },
    uploadSoundFileState(state) {
        return (handle) => {
            return state.uploadSoundFileStates[handle];
        }
    },
    uploadSoundFileProgress(state) {
        return (handle) => {
            return state.uploadSoundFileProgresses[handle] || 0;
        }
    },
    soundSetOptions(state) {
        let options = [];
        Object.entries(state.soundSets).forEach((item)=>{
            options.push({
                label: item[1].name,
                value: item[1].id
            });
        });
        return options;
    },
    defaultSoundSet(state) {
        return state.defaultSoundSet;
    },
    soundSetValue(state, getters) {
        return (label) => {
            let value = null;
            getters.soundSetOptions.forEach((soundSet) => {
                console.log('soundSet HERE', soundSet);
                console.log('label', label);
                console.log('value', soundSet.value);
                if (soundSet.label === label) {
                    value = soundSet.value;
                }
            });
            return value;
        }
    }
}
