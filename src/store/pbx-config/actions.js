'use strict';

import { assignNumbers } from '../../api/user';
import { getPbxConfiguration, addGroup,
    removeGroup, addSeat, removeSeat, setGroupName,
    setGroupExtension, setGroupHuntPolicy, setGroupHuntTimeout, updateGroupSeats } from '../../api/pbx-config'

export default {
    listSeats(context, silent) {
        return context.dispatch('listGroups', silent);
    },
    listGroups(context, silent) {
        return new Promise((resolve, reject)=>{
            context.commit('listAllRequesting', silent);
            getPbxConfiguration().then((config)=>{
                context.commit('listAllSucceeded', config);
                resolve();
            }).catch((err)=>{
                context.commit('listAllFailed', err.message);
                reject(err);
            });
        });
    },
    addGroup(context, group) {
        context.commit('addGroupRequesting');
        group.customerId = context.state.pilot.customer_id;
        group.domainId = context.state.pilot.domain_id;
        addGroup(group).then(()=>{
            return context.dispatch('listGroups', true);
        }).then(()=>{
            context.commit('addGroupSucceeded');
        }).catch((err)=>{
            context.commit('addGroupFailed', err.message);
        });
    },
    removeGroup(context, group) {
        context.commit('updateListItemStarted', group);
        removeGroup(group.id).then(()=>{
            return context.dispatch('listGroups', true);
        }).then(()=>{
            context.commit('removeGroup', group);
            context.commit('updateListItemSucceeded');
        }).catch((err)=>{
            context.commit('updateListItemFailed', err.message);
        });
    },
    addSeat(context, seat) {
        seat.customerId = context.state.pilot.customer_id;
        seat.domainId = context.state.pilot.domain_id;
        context.commit('addSeatRequesting', seat);
        addSeat(seat).then(()=>{
            context.commit('addSeatSucceeded', seat);
            context.dispatch('listSeats', true);
        }).catch((err)=>{
            context.commit('addSeatFailed', err.message);
        });
    },
    removeSeat(context, seat) {
        context.commit('removeSeatRequesting', seat);
        removeSeat(seat.id).then(()=>{
            context.commit('removeSeatSucceeded');
            context.dispatch('listSeats', true);
        }).catch((err)=>{
            context.commit('removeSeatFailed', err.message);
        });
    },
    setGroupName(context, group) {
        context.commit('updateListItemStarted', group);
        setGroupName(group.id, group.name).then(() => {
            return context.dispatch('listGroups', true);
        }).then(()=>{
            context.commit('updateListItemSucceeded');
        }).catch((err) => {
            context.commit('updateListItemFailed', err.message);
        });
    },
    setGroupExtension(context, group) {
        context.commit('updateListItemStarted', group);
        setGroupExtension(group.id, group.extension).then(()=>{
            return context.dispatch('listGroups', true);
        }).then(() => {
            context.commit('updateListItemSucceeded');
        }).catch((err) => {
            context.commit('updateListItemFailed', err.message);
        });
    },
    setGroupHuntPolicy(context, group) {
        context.commit('updateListItemStarted', group);
        setGroupHuntPolicy(group.id, group.huntPolicy).then(() => {
            return context.dispatch('listGroups', true);
        }).then(()=>{
            context.commit('updateListItemSucceeded');
        }).catch((err) => {
            context.commit('updateListItemFailed', err.message);
        });
    },
    setGroupHuntTimeout(context, group) {
        context.commit('updateListItemStarted', group);
        setGroupHuntTimeout(group.id, group.huntTimeout).then(()=>{
            return context.dispatch('listGroups', true);
        }).then(() => {
            context.commit('updateListItemSucceeded');
        }).catch((err) => {
            context.commit('updateListItemFailed', err.message);
        });
    },
    updateAliasNumbers(context, data) {
        context.commit('updateListItemStarted', data.group);
        Promise.all([
            assignNumbers(data.add, data.group.id),
            assignNumbers(data.remove, context.getters.pilotId)
        ]).then(()=>{
            return context.dispatch('listGroups', true);
        }).then(()=>{
            context.commit('updateListItemSucceeded');
        }).catch((err)=>{
            context.commit('updateListItemFailed', err.message);
        });
    },
    updateSeats(context, group) {
        context.commit('updateListItemStarted', group);
        updateGroupSeats(group.id, group.seats).then(()=>{
            return context.dispatch('listGroups', true);
        }).then(() => {
            context.commit('updateListItemSucceeded');
        }).catch((err) => {
            context.commit('updateListItemFailed', err.message);
        });
    }
}
