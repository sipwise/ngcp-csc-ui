
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
            state.groups = {};
            state.groupsOrdered = [];
            state.seats = {};
            state.seatsOrdered = [];
            state.numbers = all.numbers;
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
