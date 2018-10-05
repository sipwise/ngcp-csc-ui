
import _ from 'lodash'
import Vue from 'vue';
import {
    get,
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

export function createBusyGreeting(options) {
    return new Promise((resolve, reject) => {
        var formData = new FormData();
        var fields = _.clone(options.data);
        delete fields.file;
        var json = JSON.stringify(fields);
        formData.append('json', json);
        if (options.data.file) {
            formData.append('greetingfile', options.data.file);
        }
        Vue.http.post('api/voicemailgreetings/', formData, {
            before(request) {
                Vue.previousRequest = request;
            },
            progress(e) {
                if (e.lengthComputable) {
                    options.onProgress((e.loaded / e.total ) * 100);
                }
            }
        }).then(() => {
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function abortPreviousRequest() {
    Vue.previousRequest.abort();
}
