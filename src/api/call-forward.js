
import Vue from 'vue';
import { getJsonBody } from './utils'

export function getMappings(id) {
    return new Promise((resolve, reject) => {
        Vue.http.get('/api/cfmappings/' + id).then(result => {
            resolve(getJsonBody(result.body));
        }).catch(err => {
            reject(err);
        });
    });
}

export function getDestinationsetsCount(id) {
    return new Promise((resolve, reject) => {
        Vue.http.get('/api/cfdestinationsets/?subscriber_id=' + id)
            .then(result => {
            resolve(getJsonBody(result.body).total_count);
        }).catch(err => {
            reject(err);
        });
    });
}

export function getSourcesetsCount(id) {
    return new Promise((resolve, reject) => {
        Vue.http.get('/api/cfsourcesets/?subscriber_id=' + id)
            .then(result => {
            resolve(getJsonBody(result.body).total_count);
        }).catch(err => {
            reject(err);
        });
    });
}

export function getTimesetsCount(id) {
    return new Promise((resolve, reject) => {
        Vue.http.get('/api/cftimesets/?subscriber_id=' + id)
            .then(result => {
            resolve(getJsonBody(result.body).total_count);
        }).catch(err => {
            reject(err);
        });
    });
}

export function getDestinationsets(id, rows) {
    let params = { page: 1, rows: rows };
    return new Promise((resolve, reject) => {
        Vue.http.get('/api/cfdestinationsets/?subscriber_id=' + id, { params: params })
            .then(result => {
                resolve(getJsonBody(result.body));
            }).catch(err => {
                reject(err);
            });
    });
}

export function getSourcesets(id, rows) {
    let params = { page: 1, rows: rows };
    return new Promise((resolve, reject) => {
        Vue.http.get('/api/cfsourcesets/?subscriber_id=' + id, { params: params })
            .then(result => {
                resolve(getJsonBody(result.body));
            }).catch(err => {
                reject(err);
            });
    });
}

export function getTimesets(id, rows) {
    let params = { page: 1, rows: rows };
    return new Promise((resolve, reject) => {
        Vue.http.get('/api/cftimesets/' + id, { params: params })
            .then(result => {
                resolve(getJsonBody(result.body));
            }).catch(err => {
                reject(err);
            });
    });
}
