'use strict';

import _ from 'lodash'
import { RequestState } from '../common'

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
        return state.pilot.id;
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
    modelOptions(state) {
        let modelOptions = [];
        state.modelsOrdered.forEach((model)=>{
            modelOptions.push({
                label: model.vendor + " " + model.model,
                value: model.id
            });
        });
        return modelOptions;
    },
    listCurrentPage(state) {
        return state.listCurrentPage;
    },
    listLastPage(state) {
        return state.listLastPage;
    },
    isDeviceLoading(state) {
        return (id)=>{
            return state.deviceLoadingStates[id + ""] === true;
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
    }
}
