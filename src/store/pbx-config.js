
import _ from 'lodash';
import { getPbxConfiguration, addGroup,
    removeGroup, addSeat, removeSeat } from '../api/pbx-config'

const ListState = {
    initiated: 'initiated',
    requesting: 'requesting',
    succeeded: 'succeeded',
    failed: 'failed'
};

const AddState = {
    button: 'button',
    input: 'input',
    requesting: 'requesting',
    succeeded: 'succeeded',
    failed: 'failed'
};

const RemoveState = {
    initiated: 'initiated',
    requesting: 'requesting',
    succeeded: 'succeeded',
    failed: 'failed'
};

export default {
    namespaced: true,
    state: {
        pilot: null,
        groups: {},
        groupsOrdered: [],
        seats: {},
        seatsOrdered: [],
        numbers: [],
        numbersMap : {},
        listAllState: ListState.initiated,
        listAllError: null,
        addGroupState: AddState.button,
        addGroupError: null,
        removeGroupState: RemoveState.initiated,
        removeGroupError: null,
        removeGroupItem: null,
        addSeatState: AddState.button,
        addSeatError: null,
        removeSeatState: RemoveState.initiated,
        removeSeatError: null,
        removeSeatItem: null
    },
    getters: {
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
        }
    },
    mutations: {
        listAllRequesting(state) {
            state.listAllState = ListState.requesting;
        },
        listAllSucceeded(state, all) {
            state.RemoveState = RemoveState.initiated;
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
        removeGroupRequesting(state, group) {
            state.removeGroupState = RemoveState.requesting;
            state.removeGroupError = null;
            state.removeGroupItem = group;
        },
        removeGroupSucceeded(state) {
            state.removeGroupState = RemoveState.succeeded;
            state.removeGroupError = null;
        },
        removeGroupFailed(state, message) {
            state.removeGroupState = RemoveState.failed;
            state.removeGroupError = message;
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
    },
    actions: {
        listSeats(context) {
            return context.dispatch('listGroups');
        },
        listGroups(context) {
            context.commit('listAllRequesting');
            getPbxConfiguration().then((config)=>{
                context.commit('listAllSucceeded', config);
            }).catch((err)=>{
                context.commit('listAllFailed', err.message);
            });
        },
        addGroup(context, group) {
            context.commit('addGroupRequesting');
            group.customerId = context.state.pilot.customer_id;
            group.domainId = context.state.pilot.domain_id;
            addGroup(group).then(()=>{
                context.commit('addGroupSucceeded');
                context.dispatch('listGroups');
            }).catch((err)=>{
                context.commit('addGroupFailed', err.message);
            });
        },
        removeGroup(context, group) {
            context.commit('removeGroupRequesting', group);
            removeGroup(group.id).then(()=>{
                context.commit('removeGroupSucceeded');
                context.dispatch('listGroups');
            }).catch((err)=>{
                context.commit('removeGroupFailed', err.message);
            });
        },
        addSeat(context, seat) {
            seat.customerId = context.state.pilot.customer_id;
            seat.domainId = context.state.pilot.domain_id;
            context.commit('addSeatRequesting', seat);
            addSeat(seat).then(()=>{
                context.commit('addSeatSucceeded', seat);
                context.dispatch('listGroups');
            }).catch((err)=>{
                context.commit('addSeatFailed', err.message);
            });
        },
        removeSeat(context, seat) {
            context.commit('removeSeatRequesting', seat);
            removeSeat(seat.id).then(()=>{
                context.commit('removeSeatSucceeded');
                context.dispatch('listGroups');
            }).catch((err)=>{
                context.commit('removeSeatFailed', err.message);
            });
        }
    }
};
