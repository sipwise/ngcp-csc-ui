
import _ from 'lodash';
import { getPbxConfiguration } from '../api/pbx-config'

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
            return state.numbers;
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
        listSeats(context, options) {
            return new Promise((resolve, reject)=>{
                getPbxConfiguration().then((config)=>{
                   context.commit('listAll', config);
               }).catch((err)=>{
                   console.log(err);
               });
            });
        },
        listGroups(context, options) {
            return new Promise((resolve, reject)=>{
                getPbxConfiguration().then((config)=>{
                    context.commit('listAll', config);
                }).catch((err)=>{
                    console.log(err);
                });
            });
        }
    }
};
