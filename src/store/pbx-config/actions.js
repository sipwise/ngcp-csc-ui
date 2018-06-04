
import _ from 'lodash';
import { assignNumbers } from '../../api/user';
import { addGroup, removeGroup, addSeat, removeSeat, setGroupName,
    setGroupExtension, setGroupHuntPolicy, setGroupHuntTimeout, updateDeviceKeys,
    updateGroupSeats, setSeatName, setSeatExtension, removeDevice,
    getAllGroupsAndSeats, updateSeatGroups, getGroupList, getSeatList,
    getDeviceList, getDevice, setStationName } from '../../api/pbx-config'

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
        context.commit('lastAddedGroup', group.name);
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
        context.commit('lastUpdatedField', {name: group.name, type: 'group name'});
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
        context.commit('lastUpdatedField', {name: group.extension, type: 'group extension'});
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
        context.commit('lastUpdatedField', {name: group.huntPolicy + " ringing", type: 'group hunt policy'});
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
        context.commit('lastUpdatedField', {name: group.huntTimeout + " seconds", type: 'group hunt timeout'});
        setGroupHuntTimeout(group.id, group.huntTimeout).then(()=>{
            return context.dispatch('listGroups', true);
        }).then(() => {
            context.commit('updateItemSucceeded');
        }).catch((err) => {
            context.commit('updateItemFailed', err.message);
        });
    },
    updateAliasNumbers(context, data) {
        context.commit('updateAliasNumbersRequesting', data.item);
        Promise.all([
            assignNumbers(data.add, data.item.id),
            assignNumbers(data.remove, context.getters.pilotId)
        ]).then(()=>{
            return context.dispatch('listGroups', true);
        }).then(()=>{
            context.commit('updateAliasNumbersSucceeded');
        }).catch((err)=>{
            context.commit('updateAliasNumbersFailed', err.message);
        });
    },
    updateSeats(context, group) {
        context.commit('updateGroupsAndSeatsRequesting', group);
        updateGroupSeats(group.id, group.seats).then(()=>{
            return context.dispatch('listGroups', true);
        }).then(() => {
            context.commit('updateGroupsAndSeatsSucceeded');
        }).catch((err) => {
            context.commit('updateGroupsAndSeatsFailed', err.message);
        });
    },
    removeGroup(context, group) {
        context.commit('removeItemRequesting', group);
        context.commit('lastRemovedGroup', group.name);
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
        context.commit('lastAddedSeat', seat.name);
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
        context.commit('lastUpdatedField', {name: seat.name, type: 'seat name'});
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
        context.commit('lastUpdatedField', {name: seat.extension, type: 'seat extension'});
        setSeatExtension(seat.id, seat.extension).then(()=>{
            return context.dispatch('listSeats', true);
        }).then(() => {
            context.commit('updateItemSucceeded');
        }).catch((err) => {
            context.commit('updateItemFailed', err.message);
        });
    },
    updateGroups(context, seat) {
        context.commit('updateGroupsAndSeatsRequesting', seat);
        updateSeatGroups(seat.id, seat.groups).then(()=>{
            return context.dispatch('listSeats', true);
        }).then(() => {
            context.commit('updateGroupsAndSeatsSucceeded');
        }).catch((err) => {
            context.commit('updateGroupsAndSeatsFailed', err.message);
        });
    },
    removeSeat(context, seat) {
        context.commit('removeItemRequesting', seat);
        context.commit('lastRemovedSeat', seat.name);
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
                devices.items.forEach((device)=>{
                    context.dispatch('loadDevice', device.id);
                });
                resolve();
            }).catch((err)=>{
                context.commit('deviceListFailed', err.message);
                reject(err);
            });
        });
    },
    loadDevice(context, deviceId) {
        context.commit('deviceRequesting', deviceId);
        getDevice(deviceId, {
            join: true,
            joinLines: false,
        }).then((device)=>{
            context.commit('deviceSucceeded', device);
        }).catch((err)=>{
            context.commit('deviceFailed', deviceId, err.message);
        });
    },
    removeDevice(context, device) {
        context.commit('deviceRequesting', device.id);
        removeDevice(device.id).then(()=>{
            context.commit('deviceRemoved', device);
            context.dispatch('listDevices');
        }).catch((err)=>{
            context.commit('deviceFailed', device.id, err.message);
        });
    },
    getAllGroupsAndSeats(context) {
        context.commit('groupsAndSeatsRequesting');
        getAllGroupsAndSeats().then((list)=>{
            context.commit('groupsAndSeatsSucceeded', list);
        }).catch((err)=>{
            context.commit('groupsAndSeatsError', err.message);
        });
    },
    updateDeviceKeys(context, data) {
        context.commit('updateDeviceKeyRequesting', data.device.id);
        updateDeviceKeys(data.device.id, data.keys).then(()=>{
            context.commit('updateDeviceKeySucceeded', data);
            context.dispatch('loadDevice', data.device.id);
        }).catch((err)=>{
            context.commit('updateDeviceKeyFailed', data.device.id, err);
        });
    },
    setStationName(context, device) {
        setStationName(device).then(() => {
            //return context.dispatch('listDevices', true);
        }).then(()=>{
           console.log('setStationName succeeded');
            //context.commit('updateItemSucceeded');
        }).catch((err) => {
            console.log('setStationName failed', err.message);
            //context.commit('updateItemFailed', err.message);
        });
    }
}
