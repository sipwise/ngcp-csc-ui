
import _ from 'lodash';
import { getPbxConfiguration, addGroup } from '../api/pbx-config'

const ListState = {
    initiated: 'initiated',
    requesting: 'requesting',
    succeeded: 'succeeded',
    failed: 'failed'
};

const AddGroupState = {
    button: 'button',
    input: 'input',
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
        listAllState: ListState.initiated,
        listAllError: null,
        addGroupState: AddGroupState.button,
        addGroupError: null
    },
    getters: {
        groups(state, getters) {
            return state.groupsOrdered;
        },
        seats(state, getters) {
            return state.seatsOrdered;
        },
        numbers(state, getters) {
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
            state.pilot = null;
            state.groups = {};
            state.groupsOrdered = [];
            state.seats = {};
            state.seatsOrdered = [];
            state.numbers = [];
        },
        listAllSucceeded(state, all) {
            state.listAllState = ListState.succeeded;
            state.listAllError = null;
            state.pilot = all.pilot;
            state.groups = {};
            state.groupsOrdered = [];
            state.seats = {};
            state.seatsOrdered = [];
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
                    } else if (_.has(state.seats, number.subscriber_id)) {
                        number.subscriber = state.seats[number.subscriber_id];
                    } else if (state.pilot.id === number.subscriber_id) {
                        number.subscriber = state.pilot;
                    } else {
                        number.subscriber = null;
                    }
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
            state.addGroupState = AddGroupState.requesting;
            state.addGroupError = null;
        },
        addGroupSucceeded(state){
            state.addGroupState = AddGroupState.succeeded;
            state.addGroupError = null;
        },
        addGroupFailed(state, error) {
            state.addGroupState = AddGroupState.failed;
            state.addGroupError = error;
        }
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
        }
    }
};
