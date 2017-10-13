
import _ from 'lodash';
import Vue from 'vue';
import { getJsonBody } from './utils'

export function getPreferences(id) {
    return new Promise((resolve, reject)=>{
        Vue.http.get('/api/subscriberpreferences/' + id).then((result)=>{
            resolve(getJsonBody(result.body));
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function setPreference(id, field, value) {
    return new Promise((resolve, reject)=>{
        var headers = {};
        headers['Content-Type'] = 'application/json-patch+json';
        Promise.resolve().then((result)=>{
            return Vue.http.patch('/api/subscriberpreferences/' + id, [{
                    op: 'replace',
                    path: '/'+ field,
                    value: value
            }], { headers: headers });
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            if(err.status === 422) {
                Vue.http.patch('/api/subscriberpreferences/' + id, [{
                    op: 'add',
                    path: '/'+ field,
                    value: value
                }], { headers: headers }).then(()=>{
                    resolve();
                }).catch((err)=>{
                    reject(err);
                });
            } else {
                reject(err);
            }
        });
    });
}

export function prependItemToArrayPreference(id, field, value) {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
            return getPreferences(id);
        }).then((result)=>{
            var prefs = _.cloneDeep(result);
            delete prefs._links;
            prefs[field] = _.get(prefs, field, []);
            prefs[field] = [value].concat(prefs[field]);
            return Vue.http.put('/api/subscriberpreferences/' + id, prefs);
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function appendItemToArrayPreference(id, field, value) {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
            return getPreferences(id);
        }).then((result)=>{
            var prefs = _.cloneDeep(result);
            delete prefs._links;
            prefs[field] = _.get(prefs, field, []);
            prefs[field].push(value);
            return Vue.http.put('/api/subscriberpreferences/' + id, prefs);
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            reject();
        });
    });
}

export function editItemInArrayPreference(id, field, itemIndex, value) {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
            return getPreferences(id);
        }).then((result)=>{
            var prefs = _.cloneDeep(result);
            delete prefs._links;
            if(_.isArray(prefs[field]) && itemIndex < prefs[field].length) {
                prefs[field][itemIndex] = value;
                return Vue.http.put('/api/subscriberpreferences/' + id, prefs);
            } else {
                return Promise.reject(new Error('Array index does not exists'));
            }
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function removeItemFromArrayPreference(id, field, itemIndex) {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
            return getPreferences(id);
        }).then((result)=>{
            var prefs = _.cloneDeep(result);
            delete prefs._links;
            prefs[field] = _.get(prefs, field, []);
            _.remove(prefs[field], (value, index)=>{
                return index === itemIndex;
            });
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
    return prependItemToArrayPreference(id, 'block_in_list', number);
}

export function editBlockInList(id, index, number) {
    return editItemInArrayPreference(id, 'block_in_list', index, number);
}

export function removeFromBlockInList(id, index) {
    return removeItemFromArrayPreference(id, 'block_in_list', index);
}

export function setBlockOutMode(id, value) {
    return setPreference(id, 'block_out_mode', value);
}

export function enableBlockOut(id) {
    return setBlockOutMode(id, true);
}

export function disableBlockOut(id) {
    return setBlockOutMode(id, false);
}

export function addToBlockOutList(id, number) {
    return prependItemToArrayPreference(id, 'block_out_list', number);
}

export function editBlockOutList(id, index, number) {
    return editItemInArrayPreference(id, 'block_out_list', index, number);
}

export function removeFromBlockOutList(id, index) {
    return removeItemFromArrayPreference(id, 'block_out_list', index);
}

export function setPrivacy(id, value) {
    return setPreference(id, 'clir', value);
}

export function enablePrivacy(id) {
    return setPrivacy(id, true);
}

export function disablePrivacy(id) {
    return setPrivacy(id, false);
}
