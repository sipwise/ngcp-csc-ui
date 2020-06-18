import {
    createSubscriber,
    deleteSubscriber,
    getFullSubscribers,
    getSubscriberAndPreferences, getSubscribers,
    setDisplayName,
    setPbxExtension,
    setPbxWebPassword,
    setPbxGroupIds,
    setSubscriberNumbers
} from "./subscriber";
import _ from "lodash";
import {
    getAllSoundSets,
    getPilot,
    getSoundSet,
    createId,
    PBX_CONFIG_ORDER_BY,
    PBX_CONFIG_ORDER_DIRECTION,
    setSubscriberSoundSet
} from "./pbx-config";
import {
    assignNumbers,
    getNumbers
} from "./user";
import {
    getGroupsOnly
} from "./pbx-groups";

export function getSeats(options) {
    return new Promise((resolve, reject)=>{
        options = options || {};
        options = _.merge(options, {
            params: {
                is_pbx_group: 0,
                is_pbx_pilot: 0
            }
        });
        Promise.resolve().then(()=>{
            return Promise.all([
                getFullSubscribers(options),
                getAllSoundSets()
            ]);
        }).then((result)=> {
            resolve({
                subscribers: result[0].subscribers,
                preferences: {
                    items: result[0].preferences
                },
                soundSets: result[1]
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getSeatsOnly(options) {
    return new Promise((resolve, reject)=>{
        options = options || {};
        options = _.merge(options, {
            params: {
                is_pbx_group: 0,
                is_pbx_pilot: 0
            }
        });
        Promise.resolve().then(()=>{
            return getSubscribers(options);
        }).then((result)=> {
            resolve(result);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getSeatList(options) {
    return new Promise((resolve, reject)=>{
        let page = _.get(options, 'page', 1);
        Promise.all([
            getSeats({
                params: {
                    page: page,
                    order_by: PBX_CONFIG_ORDER_BY,
                    order_by_direction: PBX_CONFIG_ORDER_DIRECTION
                }
            }),
            getGroupsOnly({
                all: true
            }),
            getPilot(),
            getNumbers()
        ]).then((result) => {
            resolve({
                seats: result[0].subscribers,
                preferences: result[0].preferences,
                soundSets: result[0].soundSets,
                groups: result[1],
                pilot: result[2],
                numbers: result[3]
            });
        }).catch((err) => {
            reject(err);
        });
    });
}

export function createSeat(seat) {
    return new Promise((resolve, reject)=>{
        let subscriberId;
        Promise.resolve().then(()=>{
            return createSubscriber({
                username: _.kebabCase(seat.name),
                password: createId(),
                display_name: seat.name,
                webpassword: seat.webpassword,
                is_pbx_group: false,
                pbx_extension: seat.extension,
                pbx_group_ids: seat.groups
            });
        }).then(($subscriberId)=>{
            subscriberId = $subscriberId;
            if(seat.soundSet !== null && seat.soundSet !== void(0)) {
                return getSoundSet(seat.soundSet);
            }
            else {
                return Promise.resolve(null);
            }
        }).then((soundSet)=>{
            let promises = [
                assignNumbers(seat.aliasNumbers, subscriberId)
            ];
            if(soundSet !== null) {
                promises.push(setSubscriberSoundSet(subscriberId, soundSet.name));
            }
            return Promise.all(promises);
        }).then(()=>{
            resolve(subscriberId);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function removeSeat(id) {
    return deleteSubscriber(id);
}

/**
 * @param options
 * @param options.seatId
 * @param options.seatName
 */
export function setSeatName(options) {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
            return setDisplayName(options.seatId, options.seatName);
        }).then(()=>{
            return getSubscriberAndPreferences(options.seatId);
        }).then((result)=>{
            resolve({
                seat: result.subscriber,
                preferences: result.preferences
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

/**
 * @param options
 * @param options.seatId
 * @param options.seatExtension
 */
export function setSeatExtension(options) {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
            return setPbxExtension(options.seatId, options.seatExtension);
        }).then(()=>{
            return getSubscriberAndPreferences(options.seatId);
        }).then((result)=>{
            resolve({
                seat: result.subscriber,
                preferences: result.preferences
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

/**
 * @param options
 * @param options.seatId
 * @param options.seatWebPassword
 */
export function setSeatWebPassword(options) {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
            return setPbxWebPassword(options.seatId, options.seatWebPassword);
        }).then(()=>{
            return getSubscriberAndPreferences(options.seatId);
        }).then((result)=>{
            resolve({
                seat: result.subscriber,
                preferences: result.preferences
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

/**
 * @param options
 * @param options.seatId
 * @param options.groupIds
 */
export function setSeatGroups(options) {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
            return setPbxGroupIds(options.seatId, options.groupIds);
        }).then(()=>{
            return getSubscriberAndPreferences(options.seatId);
        }).then((result)=>{
            resolve({
                seat: result.subscriber,
                preferences: result.preferences
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

/**
 * @param options
 * @param options.seatId
 * @param options.pilotId
 * @param options.assignedNumbers
 * @param options.unassignedNumbers
 * @return {Promise<any>}
 */
export function setSeatNumbers(options) {
    return new Promise((resolve, reject)=>{
        setSubscriberNumbers({
            subscriberId: options.seatId,
            pilotId: options.pilotId,
            assignedNumbers: options.assignedNumbers,
            unassignedNumbers: options.unassignedNumbers
        }).then((result)=>{
            resolve(result);
        }).catch((err)=>{
            reject(err);
        });
    });
}

/**
 * @param options
 * @param options.seatId
 * @param options.soundSetId
 */
export function setSeatSoundSet(options) {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
            if(options.soundSetId !== null && options.soundSetId !== void(0)) {
                return getSoundSet(options.soundSetId);
            }
            else {
                return Promise.resolve(null);
            }
        }).then((soundSet)=>{
            let soundSetName = _.get(soundSet, 'name', null);
            return setSubscriberSoundSet(options.seatId, soundSetName);
        }).then(()=>{
            return getSubscriberAndPreferences(options.seatId);
        }).then((result)=>{
            resolve({
                seat: result.subscriber,
                preferences: result.preferences
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}
