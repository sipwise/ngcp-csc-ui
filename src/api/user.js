
import _ from 'lodash';
import Vue from 'vue';
import { LIST_ALL_ROWS } from './common'

export function login(username, password) {
    return new Promise((resolve, reject)=>{
        var jwt = null;
        var subscriberId = null;
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
            getCapabilities()
        ]).then((results)=>{
            resolve({
                subscriber: results[0],
                capabilities: results[1]
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getSubscriberById(id) {
    return new Promise((resolve, reject)=>{
        Vue.http.get('api/subscribers/' + id).then((result)=>{
            var body = JSON.parse(result.body);
            resolve(body);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getCapabilities() {
    return new Promise((resolve, reject)=>{
        Vue.http.get('api/capabilities/').then((result)=>{
            var capabilities = {};
            var body = JSON.parse(result.body);
            if(_.isArray(body["_embedded"]["ngcp:capabilities"])) {
                body['_embedded']['ngcp:capabilities'].forEach((capability)=>{
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
        var headers = {};
        headers['Content-Type'] = 'application/json-patch+json';
        Promise.resolve().then(() => {
            return Vue.http.patch('api/numbers/' + numberId, [{
                op: 'replace',
                path: '/subscriber_id',
                value: subscriberId
            }], {
                headers: headers
            });
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
        let params = {};
        let path = 'api/numbers/';
        Promise.resolve().then(()=>{
            return Vue.http.get(path, {
                params: _.assign(params, {
                    page: 1,
                    rows: LIST_ALL_ROWS,
                })
            });
        }).then((res)=>{
            let body = JSON.parse(res.body);
            if(body.total_count > LIST_ALL_ROWS) {
                return Vue.http.get(path, {
                    params: _.assign(params, {
                        page: 1,
                        rows: body.total_count,
                    })
                });
            }
            else {
                return Promise.resolve(res);
            }
        }).then((res)=>{
            let body = JSON.parse(res.body);
            let numbers = [];
            if(_.isArray(body["_embedded"]["ngcp:numbers"])) {
                body['_embedded']['ngcp:numbers'].forEach((number)=>{
                    numbers.push(number);
                });
            }
            resolve(numbers);
        }).catch((err)=>{
            reject(err);
        });
    });
}
