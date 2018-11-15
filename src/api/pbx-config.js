
import _ from 'lodash';
import Vue from 'vue';
import {
    getNumbers,
    assignNumbers
} from './user';
import {
    createSubscriber,
    deleteSubscriber,
    setDisplayName,
    setPbxExtension,
    setPbxHuntPolicy,
    setPbxHuntTimeout,
    setPbxGroupMemberIds,
    setPbxGroupIds,
    getSubscribers,
    getSubscriber,
	getAllSubscriberIdsWithCallQueue
} from './subscriber';
import uuid from 'uuid';
import { getList, get, patchReplace } from './common'

var createId = uuid.v4;

export const PBX_CONFIG_ORDER_BY = 'create_timestamp';
export const PBX_CONFIG_ORDER_DIRECTION = 'desc';

export function getGroups(options) {
    return new Promise((resolve, reject)=>{
        options = options || {};
        options = _.merge(options, {
            params: {
                is_pbx_group: 1
            }
        });
        getSubscribers(options).then((res)=>{
            resolve(res);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getGroup(groupId) {
    return getSubscriber(groupId);
}

export function getSeats(options) {
    return new Promise((resolve, reject)=>{
        options = options || {};
        options = _.merge(options, {
            params: {
                is_pbx_group: 0,
                is_pbx_pilot: 0
            }
        });
        getSubscribers(options).then((res)=>{
            resolve(res);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getSeat(seatId) {
    return getSubscriber(seatId);
}

export function getAllGroupsAndSeats(options) {
    return new Promise((resolve, reject)=>{
        options = options || {};
        options = _.merge(options, {
            params: {
                all: true
            }
        });
        getSubscribers(options).then((res)=>{
            resolve(res);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getPilot(options) {
    return new Promise((resolve, reject)=>{
        options = options || {};
        options = _.merge(options, {
            params: {
                is_pbx_group: 0,
                is_pbx_pilot: 1
            }
        });
        getSubscribers(options).then((subscribers)=>{
            if(subscribers.items.length === 1) {
                resolve(subscribers.items[0]);
            }
            else {
                resolve(null);
            }
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getDevices(options) {
    return new Promise((resolve, reject)=>{
        options = options || {};
        options = _.merge(options, {
            path: 'api/pbxdevices/',
            root: '_embedded.ngcp:pbxdevices'
        });
        getList(options).then((list)=>{
            resolve(list);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getProfiles(options) {
    return new Promise((resolve, reject)=>{
        options = options || {};
        options = _.merge(options, {
            path: 'api/pbxdeviceprofiles/',
            root: '_embedded.ngcp:pbxdeviceprofiles'
        });
        getList(options).then((list)=>{
            resolve(list);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getModels(options) {
    return new Promise((resolve, reject)=>{
        options = options || {};
        options = _.merge(options, {
            path: 'api/pbxdevicemodels/',
            root: '_embedded.ngcp:pbxdevicemodels'
        });
        getList(options).then((list)=>{
            resolve(list);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getGroupList(page) {
    return new Promise((resolve, reject)=>{
        Promise.all([
            getGroups({
                params: {
                    page: page,
                    order_by: PBX_CONFIG_ORDER_BY,
                    order_by_direction: PBX_CONFIG_ORDER_DIRECTION
                }
            }),
            getSeats({
                all: true
            }),
            getPilot(),
            getNumbers()
        ]).then((result)=>{
            resolve({
                groups: result[0],
                seats: result[1],
                pilot: result[2],
                numbers: result[3],
                lastPage: result[0].lastPage
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getSeatList(page) {
    return new Promise((resolve, reject)=>{
        Promise.all([
            getSeats({
                params: {
                    page: page,
                    order_by: PBX_CONFIG_ORDER_BY,
                    order_by_direction: PBX_CONFIG_ORDER_DIRECTION
                }
            }),
            getGroups({
                all: true
            }),
            getPilot(),
            getNumbers()
        ]).then((result)=>{
            resolve({
                seats: result[0],
                groups: result[1],
                pilot: result[2],
                numbers: result[3],
                lastPage: result[0].lastPage
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getDeviceList(options) {
    return new Promise((resolve, reject)=>{
        let params = {
            page: options.page,
            profile_id: options.profile_id,
            identifier: options.identifier,
            station_name: options.station_name,
            order_by: PBX_CONFIG_ORDER_BY,
            order_by_direction: PBX_CONFIG_ORDER_DIRECTION
        };
        if(params.profile_id === null) {
            delete params['profile_id'];
        }
        if(params.identifier === null) {
            delete params['identifier'];
        }
        if(params.station_name === null) {
            delete params['station_name'];
        }
        return getDevices({
            params: params
        }).then((devices)=>{
            resolve(devices);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function addGroup(group) {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
            return createSubscriber({
                customer_id: group.customerId,
                domain_id: group.domainId,
                username: createId(),
                password: createId(),
                display_name: group.name,
                is_pbx_group: true,
                pbx_extension: group.extension,
                pbx_hunt_policy: group.huntPolicy,
                pbx_hunt_timeout: group.huntTimeout,
                pbx_groupmember_ids: group.seats
            });
        }).then((subscriberId)=>{
            assignNumbers(group.aliasNumbers, subscriberId);
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function removeGroup(id) {
    return deleteSubscriber(id);
}

export function addSeat(seat) {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
            return createSubscriber({
                customer_id: seat.customerId,
                domain_id: seat.domainId,
                username: createId(),
                password: createId(),
                display_name: seat.name,
                is_pbx_group: false,
                pbx_extension: seat.extension,
                pbx_group_ids: seat.groups
            });
        }).then((subscriberId)=>{
            assignNumbers(seat.aliasNumbers, subscriberId);
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function removeSeat(id) {
    return deleteSubscriber(id);
}

export function setGroupName(id, groupName) {
    return setDisplayName(id, groupName);
}

export function setGroupExtension(id, groupExtension) {
    return setPbxExtension(id, groupExtension);
}

export function setGroupHuntPolicy(id, huntPolicy) {
    return setPbxHuntPolicy(id, huntPolicy);
}

export function setGroupHuntTimeout(id, huntTimeout) {
    return setPbxHuntTimeout(id, huntTimeout);
}

export function updateGroupSeats(id, seatIds) {
    return setPbxGroupMemberIds(id, seatIds);
}

export function setSeatName(id, seatName) {
    return setDisplayName(id, seatName);
}

export function setSeatExtension(id, seatExtension) {
    return setPbxExtension(id, seatExtension);
}

export function updateSeatGroups(id, seatIds) {
    return setPbxGroupIds(id, seatIds);
}

export function getDeviceFull(id, options) {
    options = options || {};
    options.join = true;
    options.joinLines = true;
    return getDevice(id, options);
}

export function getDevice(id, options) {
    return new Promise((resolve, reject)=>{
        options = options || {};
        let device = null;
        let join = _.get(options, 'join', false);
        let joinLines = _.get(options, 'joinLines', false);
        Promise.resolve().then(()=>{
            return get({
                path: 'api/pbxdevices/' + id
            });
        }).then(($device)=> {
            device = $device;
            if(join === true) {
                let requests = [
                    getProfile(device.profile_id, join)
                ];
                if(joinLines === true && _.isArray(device.lines) && device.lines.length > 0) {
                    device.lines.forEach((line)=>{
                        requests.push(getSubscriber(line.subscriber_id));
                    });
                }
                return Promise.all(requests);
            }
            else {
                resolve(device);
            }
        }).then((results)=>{
            device.profile = results[0];
            if(results.length > 1) {
                for(let i = 1; i < results.length; i++) {
                    device.lines[i - 1].subscriber = results[i];
                }
            }
            resolve(device);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getProfile(id, join) {
    return new Promise((resolve, reject)=>{
        let profile;
        Promise.resolve().then(()=>{
            return get({
                path: 'api/pbxdeviceprofiles/' + id
            });
        }).then(($profile)=> {
            profile = $profile;
            if(join === true) {
                return getModelFull(profile.device_id);
            }
            else {
                resolve(profile);
            }
        }).then((model)=>{
            profile.model = model;
            profile.modelFrontImage = model.frontImageBlob;
            profile.modelFrontImageUrl = model.frontImageUrl;
            resolve(profile);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getModel(id) {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
            return get({
                path: 'api/pbxdevicemodels/' + id
            });
        }).then((model)=> {
            resolve(model);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getModelFrontImage(id) {
    return new Promise((resolve, reject)=>{
        Vue.http.get('api/pbxdevicemodelimages/' + id, {
            responseType: 'blob',
            params: {
                type: 'front'
            }
        }).then((res)=>{
            resolve({
                id: id,
                url: URL.createObjectURL(res.body),
                blob: res.body
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getModelFull(id) {
    return new Promise((resolve, reject)=>{
        Promise.all([
            getModel(id),
            getModelFrontImage(id)
        ]).then((res)=>{
            let model = res[0];
            model.frontImageBlob = res[1].blob;
            model.frontImageUrl = res[1].url;
            resolve(model);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function createDevice(device) {
    return new Promise((resolve, reject)=>{
        Vue.http.post('api/pbxdevices/', device).then((res)=>{
            resolve(res);
        }).catch((err)=>{
            if(err.status >= 400) {
                reject(new Error(err.body.message));
            }
            else {
                reject(err);
            }
        });
    });
}

export function removeDevice(id) {
    return new Promise((resolve, reject)=>{
        Vue.http.delete('api/pbxdevices/' + id).then(()=>{
            resolve();
        }).catch((err)=>{
            if(err.status >= 400) {
                reject(new Error(err.body.message));
            }
            else {
                reject(err);
            }
        });
    });
}

export function updateDeviceKeys(deviceId, keys) {
    return patchReplace({
        path: 'api/pbxdevices/' + deviceId,
        fieldPath: 'lines',
        value: keys
    });
}

export function setStationName(options) {
    return patchReplace({
        path: 'api/pbxdevices/' + options.id,
        fieldPath: 'station_name',
        value: options.station_name
    });
}

export function setIdentifier(deviceId, identifier) {
    return patchReplace({
        path: 'api/pbxdevices/' + deviceId,
        fieldPath: 'identifier',
        value: identifier
    });
}

export function setProfile(deviceId, profileId) {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
            return patchReplace({
                path: 'api/pbxdevices/' + deviceId,
                fieldPath: 'lines',
                value: []
            });
        }).then(()=>{
            return patchReplace({
                path: 'api/pbxdevices/' + deviceId,
                fieldPath: 'profile_id',
                value: profileId
            });
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getCallQueueGroupsAndSeats(options) {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(() => {
            return getAllSubscriberIdsWithCallQueue(options);
        }).then((ids) => {
            let subscriberPromises = [];
            ids.forEach((id) => {
                subscriberPromises.push(getSubscriber(id));
            });
            return Promise.all(subscriberPromises);
        }).then((subscribersWithCallQueue) => {
            resolve(subscribersWithCallQueue);
        }).catch((err) => {
            reject(err);
        });
    });
}
