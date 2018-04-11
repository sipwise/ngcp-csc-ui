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
    updateState(state) {
        return state.updateState;
    },
    updateItem(state) {
        return state.updateItem;
    },
    updateItemId(state, getters) {
        if(_.isObject(getters.updateItem)) {
            return getters.updateItem.id;
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
    }
}
