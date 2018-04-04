'use strict';

import _ from 'lodash'

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
    listItemUpdating(state) {
        return state.listItemUpdating;
    },
    listItemUpdateState(state) {
        return state.listItemUpdateState;
    },
    listItemUpdateError(state) {
        return state.listItemUpdateError;
    },
    listLoadingSilently(state) {
        return (state.listLoadingSilently === true);
    },
    pilotId(state) {
        return state.pilot.id;
    }
}
