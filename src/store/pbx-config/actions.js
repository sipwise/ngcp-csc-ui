'use strict';

import _ from 'lodash';
import { assignNumbers } from '../../api/user';
import { addGroup, removeGroup, addSeat, removeSeat, setGroupName,
    setGroupExtension, setGroupHuntPolicy, setGroupHuntTimeout,
    updateGroupSeats, setSeatName, setSeatExtension,
    updateSeatGroups, getGroupList, getSeatList, getDeviceList } from '../../api/pbx-config'

export default {
    listGroups(context, options) {
        let silent = _.get(options, 'silent', false);
        let page = _.get(options, 'page', 1);
        context.commit('listRequesting', {
            silent: silent,
            page: page
        });
        getGroupList(page).then((groups)=>{
            context.commit('listSucceeded', groups);
        }).catch((err)=>{
            context.commit('listFailed', err.message);
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
    listSeats(context, options) {
        let silent = _.get(options, 'silent', false);
        let page = _.get(options, 'page', 1);
        context.commit('listRequesting', {
            silent: silent,
            page: page
        });
        getSeatList(page).then((seats)=>{
            context.commit('listSucceeded', seats);
        }).catch((err)=>{
            context.commit('listFailed', err.message);
        });
    },
    addSeat(context, seat) {
        seat.customerId = context.state.pilot.customer_id;
        seat.domainId = context.state.pilot.domain_id;
        context.commit('addItemRequesting', seat);
        addSeat(seat).then(()=>{
            return context.dispatch('listSeats', true);
        }).then(()=>{
            context.commit('addItemSucceeded');
        }).catch((err)=>{
            context.commit('addItemFailed', err.message);
        });
    },
    setSeatName(context, seat) {
        context.commit('updateItemRequesting', seat);
        setSeatName(seat.id, seat.name).then(() => {
            return context.dispatch('listSeats', true);
        }).then(()=>{
            context.commit('updateItemSucceeded');
        }).catch((err) => {
            context.commit('updateItemFailed', err.message);
        });
    },
    setSeatExtension(context, seat) {
        context.commit('updateItemRequesting', seat);
        setSeatExtension(seat.id, seat.extension).then(()=>{
            return context.dispatch('listSeats', true);
        }).then(() => {
            context.commit('updateItemSucceeded');
        }).catch((err) => {
            context.commit('updateItemFailed', err.message);
        });
    },
    updateGroups(context, seat) {
        context.commit('updateItemRequesting', seat);
        updateSeatGroups(seat.id, seat.groups).then(()=>{
            return context.dispatch('listSeats', true);
        }).then(() => {
            context.commit('updateItemSucceeded');
        }).catch((err) => {
            context.commit('updateItemFailed', err.message);
        });
    },
    removeSeat(context, seat) {
        context.commit('removeItemRequesting', seat);
        removeSeat(seat.id).then(()=>{
            return context.dispatch('listSeats', true);
        }).then(()=>{
            context.commit('removeItemSucceeded');
        }).catch((err)=>{
            context.commit('removeItemFailed', err.message);
        });
    },
    listDevices(context, options) {
        return new Promise((resolve, reject)=>{
            let silent = _.get(options, 'silent', false);
            let page = _.get(options, 'page', 1);
            context.commit('deviceListRequesting', {
                silent: silent,
                page: page
            });
            getDeviceList(page).then((devices)=>{
                context.commit('deviceListSucceeded', devices);
                resolve();
            }).catch((err)=>{
                context.commit('deviceListFailed', err.message);
                reject(err);
            });
        });
    }
}
