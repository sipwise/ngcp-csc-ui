
import _ from 'lodash'
import Vue from 'vue';
import {
    get,
    getList,
    patchReplace
} from './common'

export function getVoiceboxSettings(subscriberId) {
    return new Promise((resolve, reject) => {
        get({
            path: `api/voicemailsettings/${subscriberId}`
        }).then((result)=>{
            let settings = _.clone(result);
            delete settings._links;
            resolve(settings);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function setVoiceboxDelete(options) {
    return patchReplace({
        path: `api/voicemailsettings/${options.subscriberId}`,
        fieldPath: 'delete',
        value: options.value
    });
}

export function setVoiceboxAttach(options) {
    return patchReplace({
        path: `api/voicemailsettings/${options.subscriberId}`,
        fieldPath: 'attach',
        value: options.value
    });
}

export function setVoiceboxPin(options) {
    return patchReplace({
        path: `api/voicemailsettings/${options.subscriberId}`,
        fieldPath: 'pin',
        value: options.value
    });
}

export function setVoiceboxEmail(options) {
    return patchReplace({
        path: `api/voicemailsettings/${options.subscriberId}`,
        fieldPath: 'email',
        value: options.value
    });
}

export function getVoiceboxGreetingByType(options) {
    return new Promise((resolve, reject) => {
        getList({
            path: 'api/voicemailgreetings/',
            root: '_embedded.ngcp:voicemailgreetings',
            params: { subscriber_id: options.id, type: options.type }
        }).then((result) => {
            resolve(result);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function deleteVoiceboxGreetingById(id) {
    return new Promise((resolve, reject) => {
        Vue.http.delete(`api/voicemailgreetings/${id}`).then(() => {
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function createNewGreeting(formData, onProgress, type) {
    return new Promise((resolve, reject) => {
        let requestKey = `previous${_.capitalize(type)}Request`;
        Vue.http.post('api/voicemailgreetings/', formData, {
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
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function uploadGreeting(options) {
    return new Promise((resolve, reject) => {
        var formData = new FormData();
        var fields = _.clone(options.data);
        delete fields.file;
        var json = JSON.stringify(fields);
        formData.append('json', json);
        if (options.data.file) {
            formData.append('greetingfile', options.data.file);
        }
        Promise.resolve().then(() => {
            return getVoiceboxGreetingByType({
                id: options.data.subscriber_id,
                type: options.data.type
            });
        }).then((greetings) => {
            if (_.some(greetings.items, { dir: options.data.dir })) {
                deleteVoiceboxGreetingById(greetings.items[0].id);
            }
            return createNewGreeting(formData, options.onProgress, options.data.dir);
        }).then(() => {
            resolve();
        }).catch((err) => {
            reject(err);
        });
    });
}

export function abortPreviousRequest(name) {
    let requestKey = `previous${_.capitalize(name)}Request`;
    Vue[requestKey].abort();
}
