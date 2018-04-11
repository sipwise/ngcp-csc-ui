'use strict';

import { assignNumbers } from '../../api/user';
import { getPbxConfiguration, addGroup,
    removeGroup, addSeat, removeSeat, setGroupName,
    setGroupExtension, setGroupHuntPolicy, setGroupHuntTimeout,
    updateGroupSeats, setSeatName, setSeatExtension, updateSeatGroups } from '../../api/pbx-config'

export default {
    listGroups(context, silent) {
        return new Promise((resolve, reject)=>{
            context.commit('listRequesting', silent);
            getPbxConfiguration().then((config)=>{
                context.commit('listSucceeded', config);
                resolve();
            }).catch((err)=>{
                context.commit('listFailed', err.message);
                reject(err);
            });
        });
    },
    addGroup(context, group) {
        group.customerId = context.state.pilot.customer_id;
        group.domainId = context.state.pilot.domain_id;
        context.commit('addItemRequesting', group);
        addGroup(group).then(()=>{
            return context.dispatch('listGroups', true);
        }).then(()=>{
            context.commit('addItemSucceeded');
        }).catch((err)=>{
            context.commit('addItemFailed', err.message);
        });
    },
    setGroupName(context, group) {
        context.commit('updateItemRequesting', group);
        setGroupName(group.id, group.name).then(() => {
            return context.dispatch('listGroups', true);
        }).then(()=>{
            context.commit('updateItemSucceeded');
        }).catch((err) => {
            context.commit('updateItemFailed', err.message);
        });
    },
    setGroupExtension(context, group) {
        context.commit('updateItemRequesting', group);
        setGroupExtension(group.id, group.extension).then(()=>{
            return context.dispatch('listGroups', true);
        }).then(() => {
            context.commit('updateItemSucceeded');
        }).catch((err) => {
            context.commit('updateItemFailed', err.message);
        });
    },
    setGroupHuntPolicy(context, group) {
        context.commit('updateItemRequesting', group);
        setGroupHuntPolicy(group.id, group.huntPolicy).then(() => {
            return context.dispatch('listGroups', true);
        }).then(()=>{
            context.commit('updateItemSucceeded');
        }).catch((err) => {
            context.commit('updateItemFailed', err.message);
        });
    },
    setGroupHuntTimeout(context, group) {
        context.commit('updateItemRequesting', group);
        setGroupHuntTimeout(group.id, group.huntTimeout).then(()=>{
            return context.dispatch('listGroups', true);
        }).then(() => {
            context.commit('updateItemSucceeded');
        }).catch((err) => {
            context.commit('updateItemFailed', err.message);
        });
    },
    updateAliasNumbers(context, data) {
        context.commit('updateItemRequesting', data.item);
        Promise.all([
            assignNumbers(data.add, data.item.id),
            assignNumbers(data.remove, context.getters.pilotId)
        ]).then(()=>{
            return context.dispatch('listGroups', true);
        }).then(()=>{
            context.commit('updateItemSucceeded');
        }).catch((err)=>{
            context.commit('updateItemFailed', err.message);
        });
    },
    updateSeats(context, group) {
        context.commit('updateItemRequesting', group);
        updateGroupSeats(group.id, group.seats).then(()=>{
            return context.dispatch('listGroups', true);
        }).then(() => {
            context.commit('updateItemSucceeded');
        }).catch((err) => {
            context.commit('updateItemFailed', err.message);
        });
    },
    removeGroup(context, group) {
        context.commit('removeItemRequesting', group);
        removeGroup(group.id).then(()=>{
            return context.dispatch('listGroups', true);
        }).then(()=>{
            context.commit('removeGroup', group);
            context.commit('removeItemSucceeded');
        }).catch((err)=>{
            context.commit('removeItemFailed', err.message);
        });
    },
    listSeats(context, silent) {
        return context.dispatch('listGroups', silent);
    },
    addSeat(context, seat) {
        seat.customerId = context.state.pilot.customer_id;
        seat.domainId = context.state.pilot.domain_id;
        context.commit('addItemRequesting', seat);
        addSeat(seat).then(()=>{
            return context.dispatch('listGroups', true);
        }).then(()=>{
            context.commit('addItemSucceeded');
        }).catch((err)=>{
            context.commit('addItemFailed', err.message);
        });
    },
    setSeatName(context, seat) {
        context.commit('updateItemRequesting', seat);
        setSeatName(seat.id, seat.name).then(() => {
            return context.dispatch('listGroups', true);
        }).then(()=>{
            context.commit('updateItemSucceeded');
        }).catch((err) => {
            context.commit('updateItemFailed', err.message);
        });
    },
    setSeatExtension(context, seat) {
        context.commit('updateItemRequesting', seat);
        setSeatExtension(seat.id, seat.extension).then(()=>{
            return context.dispatch('listGroups', true);
        }).then(() => {
            context.commit('updateItemSucceeded');
        }).catch((err) => {
            context.commit('updateItemFailed', err.message);
        });
    },
    updateGroups(context, seat) {
        context.commit('updateItemRequesting', seat);
        updateSeatGroups(seat.id, seat.groups).then(()=>{
            return context.dispatch('listGroups', true);
        }).then(() => {
            context.commit('updateItemSucceeded');
        }).catch((err) => {
            context.commit('updateItemFailed', err.message);
        });
    },
    removeSeat(context, seat) {
        context.commit('removeItemRequesting', seat);
        removeSeat(seat.id).then(()=>{
            return context.dispatch('listGroups', true);
        }).then(()=>{
            context.commit('removeItemSucceeded');
        }).catch((err)=>{
            context.commit('removeItemFailed', err.message);
        });
    }
}
