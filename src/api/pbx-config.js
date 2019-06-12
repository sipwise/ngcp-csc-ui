
import _ from 'lodash';
import Vue from 'vue';
import {
    getSubscribers,
    getSubscriber,
    getSubscribersByCallQueueEnabled,
    addNewCallQueueConfig,
    setQueueLength,
    setWrapUpTime,
    getPreferences,
    removeCallQueueConfig
} from './subscriber';
import uuid from 'uuid';
import {
    getList,
    get,
    patchReplace,
    patchAdd,
    patchRemove
} from './common'

export const createId = uuid.v4;
export const PBX_CONFIG_ORDER_BY = 'create_timestamp';
export const PBX_CONFIG_ORDER_DIRECTION = 'desc';

export function getGroup(groupId) {
    return new Promise((resolve, reject) => {
        let subscriber = {};
        let soundSets = {};
        let preferences = {};
        Promise.resolve().then(() => {
            return getSubscriber(groupId);
        }).then(($subscriber) => {
            subscriber = $subscriber;
            return getAllSoundSets();
        }).then(($soundSets) => {
            soundSets = _.keyBy($soundSets.items, 'name');
            return getPreferences(groupId);
        }).then(($preferences) => {
            preferences = $preferences;
            delete preferences._links;
            delete subscriber._links;
            Object.assign(subscriber, preferences);
            if (preferences && preferences.contract_sound_set) {
                subscriber.contract_sound_set_id = soundSets[preferences.contract_sound_set].id;
            }
            else {
                subscriber.contract_sound_set = null;
                subscriber.contract_sound_set_id = null;
            }
            resolve(subscriber);
        }).catch((err) => {
            reject(err);
        });
    });
}

export function getSeat(seatId) {
    return new Promise((resolve, reject) => {
        let subscriber = {};
        let soundSets = {};
        let preferences = {};
        Promise.resolve().then(() => {
            return getSubscriber(seatId);
        }).then(($subscriber) => {
            subscriber = $subscriber;
            return getAllSoundSets();
        }).then(($soundSets) => {
            soundSets = _.keyBy($soundSets.items, 'name');
            return getPreferences(seatId);
        }).then(($preferences) => {
            preferences = $preferences;
            delete preferences._links;
            delete subscriber._links;
            Object.assign(subscriber, preferences);
            if (preferences && preferences.contract_sound_set) {
                subscriber.contract_sound_set_id = soundSets[preferences.contract_sound_set].id;
            }
            else {
                subscriber.contract_sound_set = null;
                subscriber.contract_sound_set_id = null;
            }
            resolve(subscriber);
        }).catch((err) => {
            reject(err);
        });
    });
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
                is_pbx_pilot: 1,
                rows: 1
            }
        });
        getSubscribers(options).then((subscribers)=>{
            if (subscribers.items.length === 1) {
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

export function getAllProfiles() {
    return getProfiles({
        all: true
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

export function getModelsFull(options) {
    return new Promise((resolve, reject)=>{
        let models = [];
        Promise.resolve().then(()=>{
            return getModels(options);
        }).then((models)=>{
            let modelImages = [];
            models.items.forEach((model)=>{
                modelImages.push(getModelFrontImage(model.id));
            });
            return Promise.all(modelImages);
        }).then((modelImages)=>{
            let images = {};
            modelImages.forEach((modelImage)=>{
                images[modelImage.id] = modelImage;
            });
            resolve({
                models: models,
                images: images
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getAllModelsFull() {
    return getModelsFull({
        all: true
    });
}

export function normalizeSubscribers(all) {
    let pilot = all.pilot;
    let groups = {};
    let seats = {};
    let numbersMap = {};
    let numbers= [];
    all.groups.items.forEach((group)=>{
        groups[group.id] = group;
    });
    all.seats.items.forEach((seat)=>{
        seat.pbx_group_ids.forEach((groupId)=>{
            let group = groups[groupId];
            let $seats = _.get(group, 'seats', []);
            $seats.push(seat);
            _.set(group, 'seats', $seats);
            let $groups = _.get(seat, 'groups', []);
            $groups.push(group);
            _.set(seat, 'groups', $groups);
        });
        seats[seat.id] = seat;
    });
    if (_.isArray(all.numbers) && all.numbers.length > 0) {
        all.numbers.forEach((number)=>{
            if (_.has(groups, number.subscriber_id)) {
                number.subscriber = groups[number.subscriber_id];
            }
            else if (_.has(seats, number.subscriber_id)) {
                number.subscriber = seats[number.subscriber_id];
            }
            else if (pilot.id === number.subscriber_id) {
                number.subscriber = pilot;
            }
            else {
                number.subscriber = null;
            }
            numbersMap[number.id] = number;
        });
        numbers = all.numbers;
    }
    return {
        seats: seats,
        groups: groups,
        pilot: pilot,
        numbers: numbers,
        numbersMap: numbersMap,
        lastPage: all.lastPage
    };
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
            if (join === true) {
                let requests = [
                    getProfile(device.profile_id, join)
                ];
                if (joinLines === true && _.isArray(device.lines) && device.lines.length > 0) {
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
            if (results.length > 1) {
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
            if (join === true) {
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
    return new Promise((resolve)=>{
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
        }).catch(()=>{
            resolve({
                id: id,
                url: null,
                blob: null
            });
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

export function getCallQueueConfigurations() {
    return new Promise((resolve, reject)=>{
        getSubscribersByCallQueueEnabled().then((subscribers)=>{
            let callQueues = subscribers.map((subscriber)=>{
                return {
                    id: _.get(subscriber, 'id', null),
                    display_name: _.get(subscriber, 'display_name', null),
                    is_pbx_group: _.get(subscriber, 'is_pbx_group', null),
                    max_queue_length: _.get(subscriber, 'prefs.max_queue_length', 5),
                    queue_wrap_up_time: _.get(subscriber, 'prefs.queue_wrap_up_time', 10)
                };
            });
            resolve({
                items: callQueues
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function addCallQueueConfig(id, config) {
    return new Promise((resolve, reject) => {
        addNewCallQueueConfig(id, config).then(() => {
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getConfig(id) {
    return new Promise((resolve, reject) => {
        let $subscriber = {};
        Promise.resolve().then(() => {
            return getSubscriber(id);
        }).then((subscriber) => {
            $subscriber = subscriber;
            return getPreferences(id);
        }).then((prefs) => {
            resolve({
                id: _.get($subscriber, 'id', null),
                display_name: _.get($subscriber, 'display_name', null),
                is_pbx_group: _.get($subscriber, 'is_pbx_group', null),
                max_queue_length: _.get(prefs, 'max_queue_length', 5),
                queue_wrap_up_time: _.get(prefs, 'queue_wrap_up_time', 10)
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function removeCallQueue(subscriberId) {
    return new Promise((resolve, reject) => {
        removeCallQueueConfig(subscriberId).then(() => {
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function setQueueLengthConfig(id, queueLength) {
    return setQueueLength(id, queueLength);
}

export function setWrapUpTimeConfig(id, wrapUpTime) {
    return setWrapUpTime(id, wrapUpTime);
}

export function getAllSoundSets(options) {
    return new Promise((resolve, reject)=>{
        options = options || {};
        options = _.merge(options, {
            path: 'api/soundsets/',
            root: '_embedded.ngcp:soundsets',
            all: true
        });
        getList(options).then((list)=>{
            resolve(list);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getSoundHandles(options) {
    return new Promise((resolve, reject)=>{
        options = options || {};
        options = _.merge(options, {
            path: 'api/soundhandles/',
            root: '_embedded.ngcp:soundhandles',
            all: true,
            params: {
                order_by: 'name',
                order_by_direction: 'asc'
            }
        });
        getList(options).then((list) => {
            resolve(list.items);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getSoundFilesBySet(options) {
    return new Promise((resolve, reject)=>{
        options = options || {};
        options = _.merge(options, {
            path: 'api/soundfiles/',
            root: '_embedded.ngcp:soundfiles',
            all: true
        });
        getList(options).then((result)=>{
            let list = result.items.map((file) => {
                return {
                    filename: file.filename,
                    handle: file.handle,
                    loopplay: file.loopplay,
                    id: file.id
                };
            });
            resolve(list);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getSoundFilesGrouped(options) {
    let handles = [];
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return getSoundHandles();
        }).then((soundHandles) => {
            handles = soundHandles.map((handle) => {
                return {
                    group: handle.group,
                    handle: handle.handle,
                    filename: '',
                    id: null,
                    loopplay: null
                };
            });
            return getSoundFilesBySet(options);
        }).then((files) => {
            files.forEach((file) => {
                handles.forEach((handle) => {
                    if (file.handle === handle.handle) {
                        handle.filename = file.filename;
                        handle.id = file.id;
                        handle.loopplay = file.loopplay
                    }
                });
            });
            return handles;
        }).then((merged) => {
            let groupedFiles = {
                groups: _.sortBy(
                    _(merged)
                    .groupBy('group')
                    .map((items, group) => {
                        return {
                            name: group,
                            handles: items
                        };
                    }).value(), 'name')
            };
            resolve(groupedFiles);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function removeSoundSet(id) {
    return Vue.http.delete('api/soundsets/' + id);
}

export function getSoundSet(id) {
    return new Promise((resolve, reject)=>{
        get({
            path: 'api/soundsets/' + id
        }).then((soundSet)=>{
            resolve(soundSet);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function editSoundSetFields(id, fields) {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
            return getSoundSet(id);
        }).then((result)=>{
            let prefs = Object.assign(result, fields);
            delete fields._links;
            return Vue.http.put('api/soundsets/' + id, prefs);
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}
export function createSoundSet(soundSet) {
    return new Promise((resolve, reject)=>{
        Vue.http.post('api/soundsets/', soundSet).then(() => {
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function setSoundSetName(id, value) {
    return editSoundSetFields(id, { name: value });
}

export function setSoundSetDescription(id, value) {
    return editSoundSetFields(id, { description: value });
}

export function setSoundSetContractDefault(id, value) {
    return editSoundSetFields(id, { contract_default: value });
}

export function getSoundSetWithFiles(id) {
    return new Promise((resolve, reject)=>{
        let soundSet;
        Promise.resolve().then(()=>{
            return getSoundSet(id);
        }).then((result)=>{
            delete result._links;
            soundSet = result;
            return getSoundFilesGrouped({
                params: {
                    set_id: id
                }
            });
        }).then((data)=>{
            Object.assign(soundSet, data);
            resolve(soundSet);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function playSoundFile(options) {
    return new Promise((resolve, reject)=>{
        let params = { format: options.format };
        Vue.http.get(`api/soundfilerecordings/${options.id}`, { params: params, responseType: 'blob' })
            .then((res) => {
                resolve(URL.createObjectURL(res.body));
            }).catch((err) => {
                reject(err);
            });
    });
}

export function removeSoundFile(id) {
    return Vue.http.delete('api/soundfiles/' + id);
}

export function uploadSoundFile(options, onProgress) {
    return new Promise((resolve, reject) => {
        let formData = new FormData();
        let loopplay = options.item.loopplay ? 1 : 2;
        let fields = {
            loopplay: loopplay,
            filename: options.file.name,
            set_id: options.item.set_id,
            handle: options.item.handle,
        };
        let json = JSON.stringify(fields);
        let requestKey = `previous-${options.item.handle}-request`;
        formData.append('json', json);
        if (options.file) {
            formData.append('soundfile', options.file);
        }
        Vue.http.post('api/soundfiles/', formData, {
            before(request) {
                Vue[requestKey] = request;
            },
            progress(e) {
                if (e.lengthComputable) {
                    onProgress(Math.ceil((e.loaded / e.total ) * 100));
                }
            }
        }).then(() => {
            resolve();
        }).catch((err) => {
            reject(err);
        });
    });
}

export function abortPreviousSoundFileUpload(handle) {
    return new Promise((resolve) => {
        let requestKey = `previous-${handle}-request`;
        Vue[requestKey].abort();
        resolve();
    });
}

export function setSoundSetItemLoopplay(id, loopplay) {
    let loopflag = !loopplay ? 'true' : 'false';
    return patchReplace({
        path: 'api/soundfiles/' + id,
        fieldPath: 'loopplay',
        value: loopflag
    });
}

export function setSubscriberSoundSet(id, soundSet) {
    return new Promise((resolve, reject)=>{
        let promise;
        let path = 'api/subscriberpreferences/' + id;
        let fieldPath = 'contract_sound_set';
        if(soundSet === null || soundSet === void(0)) {
            promise = patchRemove({
                path: path,
                fieldPath: 'contract_sound_set'
            });
        }
        else {
            promise = patchAdd({
                path: path,
                fieldPath: fieldPath,
                value: soundSet
            });
        }
        promise.then(()=>{
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getDefaultSoundSet() {
    return new Promise((resolve, reject) => {
        getAllSoundSets().then((result) => {
            let defaultSoundSets = result.items.filter((soundSet) => {
                return _.get(soundSet, 'contract_default', false);
            });
            let defaultSoundSet = defaultSoundSets[0] ? defaultSoundSets[0].id : null;
            resolve(defaultSoundSet);
        }).catch((err) => {
            reject(err);
        });
    });
}
