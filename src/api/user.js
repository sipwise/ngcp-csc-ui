
import _ from 'lodash';
import Vue from 'vue';
import {
    get,
    getList,
    patchReplace
} from './common'

export function login(username, password) {
    return new Promise((resolve, reject)=>{
        let jwt = null;
        let subscriberId = null;
        Vue.http.post('login_jwt', {
            username: username,
            password: password
        }).then((result)=>{
            jwt = result.body.jwt;
            subscriberId = result.body.subscriber_id + "";
            resolve({
                jwt: jwt,
                subscriberId: subscriberId,
            });
        }).catch((err)=>{
            if(err.status && err.status >= 400) {
                reject(new Error(err.body.message));
            }
            else {
                reject(err);
            }
        });
    });
}

export function getUserData(id) {
    return new Promise((resolve, reject)=>{
        return Promise.all([
            getSubscriberById(id),
            getCapabilities(id),
            getFaxServerSettingsById(id)
        ]).then((results)=>{
            resolve({
                subscriber: results[0],
                capabilities: results[1],
                faxactive: results[2]
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getSubscriberById(id) {
    return new Promise((resolve, reject)=>{
        get({
            path: 'api/subscribers/' + id
        }).then((body)=>{
            resolve(body);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getCapabilities() {
    return new Promise((resolve, reject)=>{
        getList({
            path: 'api/capabilities/',
            root: '_embedded.ngcp:capabilities',
            all: true
        }).then((capabilityList)=>{
            let capabilities = {};
            if(_.isArray(capabilityList.items)) {
                capabilityList.items.forEach((capability)=>{
                    capabilities[capability.name] = capability.enabled;
                });
            }
            resolve(capabilities);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function assignNumber(numberId, subscriberId) {
    return new Promise((resolve, reject)=>{
        patchReplace({
            path: 'api/numbers/' + numberId,
            fieldPath: 'subscriber_id',
            value: subscriberId
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function assignNumbers(numberIds, subscriberId) {
    return new Promise((resolve, reject)=>{
        if(_.isArray(numberIds) && numberIds.length > 0) {
            let assignNumberRequests = [];
            numberIds.forEach((numberId)=>{
                assignNumberRequests.push(assignNumber(numberId, subscriberId));
            });
            Promise.all(assignNumberRequests).then(()=>{
                resolve();
            }).catch((err)=>{
                reject(err);
            });
        }
        else {
            resolve();
        }
    });
}

export function getNumbers() {
    return new Promise((resolve, reject)=>{
        getList({
            path: 'api/numbers/',
            root: '_embedded.ngcp:numbers',
            all: true
        }).then((numberList)=>{
            resolve(numberList);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getFaxServerSettingsById(id) {
    return new Promise((resolve, reject) => {
        get({
            path: 'api/faxserversettings/' + id
        }).then((body)=>{
            resolve(body.active);
        }).catch((err)=>{
            reject(err);
        });
    });
}
