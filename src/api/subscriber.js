
import Vue from 'vue';

export function getPreferences(id) {
    return new Promise((resolve, reject)=>{
        Vue.http.get('/api/subscriberpreferences/' + id).then((result)=>{
            resolve(JSON.parse(result.body));
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function setPreference(id, field, value) {
    return new Promise((resolve, reject)=>{
        var pref = {};
        pref[field] = value;
        Vue.http.put('/api/subscriberpreferences/' + id, pref).then((result)=>{
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function setBlockInMode(id, value) {
    return setPreference(id, 'block_in_mode', value);
}

export function enableBlockIn(id) {
    return setBlockInMode(id, true);
}

export function disableBlockIn(id) {
    return setBlockInMode(id, false);
}
