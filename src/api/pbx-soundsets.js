import _ from "lodash";
import {
    getList,
    patchReplaceFull
} from "./common";
import {
    PBX_CONFIG_ORDER_BY,
    PBX_CONFIG_ORDER_DIRECTION
} from "./pbx-config";
import Vue from "vue";


export function getSoundSets(options) {
    return new Promise((resolve, reject)=>{
        options = options || {};
        options = _.merge(options, {
            path: 'api/soundsets/',
            root: '_embedded.ngcp:soundsets'
        });
        getList(options).then((list)=>{
            resolve(list);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getSoundSetList(options) {
    return new Promise((resolve, reject)=>{
        let params = {
            page: options.page,
            order_by: PBX_CONFIG_ORDER_BY,
            order_by_direction: PBX_CONFIG_ORDER_DIRECTION
        };
        getSoundSets({
            params: params
        }).then((soundSets)=>{
            resolve({
                soundSets: soundSets
            });
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

export function removeSoundSet(soundSetId) {
    return new Promise((resolve, reject)=>{
        Vue.http.delete('api/soundsets/' + soundSetId).then(()=>{
            resolve();
        }).catch((err)=>{
            if (err.status >= 400) {
                reject(new Error(err.body.message));
            }
            else {
                reject(err);
            }
        });
    });
}

export function setSoundSetProperty(soundSetId, property, value) {
    return new Promise((resolve, reject)=>{
        patchReplaceFull({
            path: 'api/soundsets/' + soundSetId,
            fieldPath: property,
            value: value
        }).then((soundSet)=>{
            resolve(soundSet);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function setAsDefault(soundSetId) {
    return setSoundSetProperty(soundSetId, 'contract_default', true);
}

export function setSoundSetName(soundSetId, name) {
    return setSoundSetProperty(soundSetId, 'name', name);
}

export function setSoundSetDescription(soundSetId, description) {
    return setSoundSetProperty(soundSetId, 'description', description);
}

export function loadSoundFile() {

}
