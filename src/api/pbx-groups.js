import _ from 'lodash'
import {
    PBX_CONFIG_ORDER_BY,
    PBX_CONFIG_ORDER_DIRECTION,
    getAllSoundSets,
    getPilot,
    getSoundSet,
    setSubscriberSoundSet
} from 'src/api/pbx-config'
import { getSeatsOnly } from 'src/api/pbx-seats'
import {
    createSubscriber,
    deleteSubscriber,
    generateGeneralPassword,
    getFullSubscribers,
    getSubscriberAndPreferences,
    getSubscribers,
    setDisplayName,
    setPbxExtension, setPbxGroupMemberIds,
    setPbxHuntCancelMode,
    setPbxHuntPolicy,
    setPbxHuntTimeout,
    setPreferenceAnnouncementCallSetup,
    setPreferenceAnnouncementCfu,
    setSubscriberNumbers
} from 'src/api/subscriber'
import {
    assignNumbers,
    getNumbers
} from 'src/api/user'

export function getGroups (options) {
    return new Promise((resolve, reject) => {
        const result = {
            subscribers: {
                items: []
            },
            preferences: {
                items: []
            },
            soundSets: {
                items: []
            }
        }
        const mergedOptions = _.merge(options || {}, {
            params: {
                is_pbx_group: 1,
                is_pbx_pilot: 0
            }
        })
        Promise.resolve().then(() => {
            return Promise.all([
                getFullSubscribers(mergedOptions),
                getAllSoundSets()
            ])
        }).then(($result) => {
            result.groups = $result[0].subscribers
            result.preferences.items = $result[0].preferences
            result.soundSets = $result[1]
            resolve(result)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function getGroupsOnly (options) {
    return new Promise((resolve, reject) => {
        const mergedOptions = _.merge(options || {}, {
            params: {
                is_pbx_group: 1,
                is_pbx_pilot: 0
            }
        })
        Promise.resolve().then(() => {
            return getSubscribers(mergedOptions)
        }).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function getGroupList (options) {
    return new Promise((resolve, reject) => {
        const page = _.get(options, 'page', 1)
        const filters = _.get(options, 'filters', {})
        Promise.all([
            getGroups({
                params: {
                    page,
                    ...filters,
                    order_by: PBX_CONFIG_ORDER_BY,
                    order_by_direction: PBX_CONFIG_ORDER_DIRECTION
                }
            }),
            getSeatsOnly({
                all: true
            }),
            getPilot(),
            getNumbers()
        ]).then((result) => {
            resolve({
                groups: result[0].groups,
                preferences: result[0].preferences,
                soundSets: result[0].soundSets,
                seats: result[1],
                pilot: result[2],
                numbers: result[3]
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

export async function createGroup (group) {
    const generatePassword = await generateGeneralPassword()
    return new Promise((resolve, reject) => {
        let subscriberId
        Promise.resolve().then(() => {
            return createSubscriber({
                username: createUsername(group.name),
                password: generatePassword,
                is_pbx_group: true,
                display_name: group.name,
                pbx_extension: group.extension,
                pbx_hunt_policy: group.huntPolicy,
                pbx_hunt_timeout: group.huntTimeout,
                pbx_hunt_cancel_mode: group.huntCancelMode,
                pbx_groupmember_ids: group.seats
            }, {})
        }).then(($subscriberId) => {
            subscriberId = $subscriberId
            if (group.soundSet !== null && group.soundSet !== undefined) {
                return getSoundSet(group.soundSet)
            }
            return Promise.resolve(null)
        }).then((soundSet) => {
            const promises = [
                assignNumbers(group.aliasNumbers, subscriberId)
            ]
            if (soundSet !== null) {
                promises.push(setSubscriberSoundSet(subscriberId, soundSet.name))
            }
            return Promise.all(promises)
        }).then(() => {
            resolve(subscriberId)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function removeGroup (id) {
    return deleteSubscriber(id)
}

export function setGroupName (options) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return setDisplayName(options.groupId, options.groupName)
        }).then(() => {
            return getSubscriberAndPreferences(options.groupId)
        }).then((result) => {
            resolve({
                group: result.subscriber,
                preferences: result.preferences
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

export function setGroupExtension (options) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return setPbxExtension(options.groupId, options.groupExtension)
        }).then(() => {
            return getSubscriberAndPreferences(options.groupId)
        }).then((result) => {
            resolve({
                group: result.subscriber,
                preferences: result.preferences
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

export function setGroupHuntPolicy (options) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return setPbxHuntPolicy(options.groupId, options.groupHuntPolicy)
        }).then(() => {
            return getSubscriberAndPreferences(options.groupId)
        }).then((result) => {
            resolve({
                group: result.subscriber,
                preferences: result.preferences
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

export function setGroupHuntTimeout (options) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return setPbxHuntTimeout(options.groupId, options.groupHuntTimeout)
        }).then(() => {
            return getSubscriberAndPreferences(options.groupId)
        }).then((result) => {
            resolve({
                group: result.subscriber,
                preferences: result.preferences
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

export function setGroupHuntCancelMode (options) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return setPbxHuntCancelMode(options.groupId, options.groupHuntCancelMode)
        }).then(() => {
            return getSubscriberAndPreferences(options.groupId)
        }).then((result) => {
            resolve({
                group: result.subscriber,
                preferences: result.preferences
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

export function setGroupNumbers (options) {
    return new Promise((resolve, reject) => {
        setSubscriberNumbers({
            subscriberId: options.groupId,
            pilotId: options.pilotId,
            assignedNumbers: options.assignedNumbers,
            unassignedNumbers: options.unassignedNumbers
        }).then((result) => {
            if (result.subscriber !== null && result.preferences !== null) {
                return result
            }
            return getSubscriberAndPreferences(options.groupId)
        }).then((result) => {
            resolve({
                group: result.subscriber,
                preferences: result.preferences
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

export function setGroupSeats (options) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return setPbxGroupMemberIds(options.groupId, options.seatIds)
        }).then(() => {
            return getSubscriberAndPreferences(options.groupId)
        }).then((result) => {
            resolve({
                group: result.subscriber,
                preferences: result.preferences
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

export function setGroupSoundSet (options) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            if (options.soundSetId !== null && options.soundSetId !== undefined) {
                return getSoundSet(options.soundSetId)
            }
            return Promise.resolve(null)
        }).then((soundSet) => {
            const soundSetName = _.get(soundSet, 'name', null)
            return setSubscriberSoundSet(options.groupId, soundSetName)
        }).then(() => {
            return getSubscriberAndPreferences(options.groupId)
        }).then((result) => {
            resolve({
                group: result.subscriber,
                preferences: result.preferences
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

/**
 * @param groupId
 * @param announcementCfu
 */
export function setGroupAnnouncementCfu (groupId, announcementCfu) {
    return setPreferenceAnnouncementCfu(groupId, announcementCfu)
}

/**
 * @param groupId
 * @param announcementCallSetup
 */
export function setGroupAnnouncementCallSetup (groupId, announcementCallSetup) {
    return setPreferenceAnnouncementCallSetup(groupId, announcementCallSetup)
}

// This mirrors the logic we use in ngcp-admin to handle the pbx groups creation
// If you change the logic below make sure you make the same changes in ngcp-admin too
function createUsername (name) {
    return name.trim().replaceAll(' ', '-').replace(/[^a-zA-Z0-9\-_ ]/g, '')
}
