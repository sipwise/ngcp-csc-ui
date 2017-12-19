
import _ from 'lodash';
import { getPbxConfiguration, addGroup } from '../api/pbx-config'

export default {
    namespaced: true,
    state: {
        pilot: null,
        groups: {},
        groupsOrdered: [],
        seats: {},
        seatsOrdered: [],
        numbers: []
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
        show: function(state, options) {
            state.groups = options.groups;
        },
        listAll(state, all) {
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
        }
    },
    actions: {
        listSeats(context) {
            return new Promise((resolve, reject)=>{
                getPbxConfiguration().then((config)=>{
                   context.commit('listAll', config);
               }).catch((err)=>{
                   console.log(err);
               });
            });
        },
        listGroups(context) {
            return new Promise((resolve, reject)=>{
                getPbxConfiguration().then((config)=>{
                    context.commit('listAll', config);
                }).catch((err)=>{
                    console.log(err);
                });
            });
        },
        addGroup(context, group) {
            return new Promise((resolve, reject)=>{
               Promise.resolve().then(()=>{
                   group.customerId = context.state.pilot.customer_id;
                   group.domain = context.state.pilot.domain;
                   return addGroup(group);
               }).then(()=>{
                   return context.dispatch('listGroups');
               }).then(()=>{
                   resolve();
               }).catch((err)=>{
                   console.log(err);
               });
            });
        }
    }
};
