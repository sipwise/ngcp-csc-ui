
import _ from 'lodash'
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
