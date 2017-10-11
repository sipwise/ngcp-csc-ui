
import _ from 'lodash';
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
        Promise.resolve().then(()=>{
            return getPreferences(id);
        }).then((result)=>{
            var prefs = _.cloneDeep(result);
            delete prefs._links;
            prefs[field] = value;
            return Vue.http.put('/api/subscriberpreferences/' + id, prefs);
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            reject();
        });
    });
}

export function addItemToArrayPreference(id, field, value) {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
            return getPreferences(id);
        }).then((result)=>{
            var prefs = _.cloneDeep(result);
            delete prefs._links;
            prefs[field] = _.get(prefs, field, []);
            // prefs[field].push(value);
            prefs[field] = [value].concat(prefs[field]);
            return Vue.http.put('/api/subscriberpreferences/' + id, prefs);
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            reject();
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

export function addToBlockInList(id, number) {
    return addItemToArrayPreference(id, 'block_in_list', number);
}
