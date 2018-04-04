'use strict';

import _ from 'lodash'
import { ListState, AddState, RemoveState } from '../common'

export default {
    listAllRequesting(state, silent) {
        state.listAllState = ListState.requesting;
        state.listLoadingSilently = silent;
    },
    listAllSucceeded(state, all) {
        state.listAllState = ListState.succeeded;
        state.listAllError = null;
        state.pilot = all.pilot;
        state.groups = {};
        state.groupsOrdered = [];
        state.seats = {};
        state.seatsOrdered = [];
        state.numbersMap = {};
        all.groups.forEach((group)=>{
            state.groups[group.id] = group;
            state.groupsOrdered.push(group);
        });
        all.seats.forEach((seat)=>{
            seat.pbx_group_ids.forEach((groupId)=>{
                let group = state.groups[groupId];
                let seats = _.get(group, 'seats', []);
                seats.push(seat);
                _.set(group, 'seats', seats);
                let groups = _.get(seat, 'groups', []);
                groups.push(group);
                _.set(seat, 'groups', groups);
            });
            state.seats[seat.id] = seat;
            state.seatsOrdered.push(seat);
        });
        if(_.isArray(all.numbers) && all.numbers.length > 0) {
            all.numbers.forEach((number)=>{
                if(_.has(state.groups, number.subscriber_id)) {
                    number.subscriber = state.groups[number.subscriber_id];
                }
                else if (_.has(state.seats, number.subscriber_id)) {
                    number.subscriber = state.seats[number.subscriber_id];
                }
                else if (state.pilot.id === number.subscriber_id) {
                    number.subscriber = state.pilot;
                }
                else {
                    number.subscriber = null;
                }
                state.numbersMap[number.id] = number;
            });
            state.numbers = all.numbers;
        }
        _.reverse(state.groupsOrdered);
        _.reverse(state.seatsOrdered);
    },
    listAllFailed(state, error) {
        state.listAllState = ListState.failed;
        state.listAllError = error;
    },
    addGroupRequesting(state){
        state.addGroupState = AddState.requesting;
        state.addGroupError = null;
    },
    addGroupSucceeded(state){
        state.addGroupState = AddState.succeeded;
        state.addGroupError = null;
    },
    addGroupFailed(state, error) {
        state.addGroupState = AddState.failed;
        state.addGroupError = error;
    },
    removeGroup(state, group) {
        delete state.groups[group.id];
        state.groupsOrdered.forEach(($group, index)=>{
            if(group.id === $group.id) {
                delete state.groupsOrdered[index];
            }
        });
    },
    addSeatRequesting(state){
        state.addSeatState = AddState.requesting;
        state.addSeatError = null;
    },
    addSeatSucceeded(state){
        state.addSeatState = AddState.succeeded;
        state.addSeatError = null;
    },
    addSeatFailed(state, error) {
        state.addSeatState = AddState.failed;
        state.addSeatError = error;
    },
    removeSeatRequesting(state, seat) {
        state.removeSeatState = RemoveState.requesting;
        state.removeSeatError = null;
        state.removeSeatItem = seat;
    },
    removeSeatSucceeded(state) {
        state.removeSeatState = RemoveState.succeeded;
        state.removeSeatError = null;
    },
    removeSeatFailed(state, message) {
        state.removeSeatState = RemoveState.failed;
        state.removeSeatError = message;
        state.removeSeatItem = null;
    },
    updateListItemStarted(state, item) {
        state.listItemUpdateState = 'requesting';
        state.listItemUpdating = item;
    },
    updateListItemSucceeded(state) {
        state.listItemUpdateState = 'succeeded';
        state.listItemUpdating = null;
    },
    updateListItemFailed(state, error) {
        state.listItemUpdateState = 'failed';
        state.listItemUpdating = null;
        state.listItemUpdateError = error;
    }
}
