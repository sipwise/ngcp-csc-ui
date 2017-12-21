
import Vue from 'vue';
import { getJsonBody } from './utils'

let rowCountAssumption = 1000;

export function getMappings(id) {
    return new Promise((resolve, reject) => {
        Vue.http.get('/api/cfmappings/' + id).then(result => {
            let jsonBody = getJsonBody(result.body);
            delete jsonBody._links;
            delete jsonBody.cfs;
            resolve(getJsonBody(result.body));
        }).catch(err => {
            reject(err);
        });
    });
}

export function getSourcesets(id) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return Vue.http.get('/api/cfsourcesets/',
                { params: { subscriber_id: id, page: 1, rows: rowCountAssumption } })
        }).then(result => {
            let totalCount = getJsonBody(result.body).total_count;
            if (totalCount > rowCountAssumption) {
                return Vue.http.get('/api/cfsourcesets/',
                    { params: { subscriber_id: id, page: 1,
                        rows: totalCount } })
            } else {
                return Promise.resolve(result);
            }
        }).then(result => {
            resolve(getJsonBody(result.body)._embedded['ngcp:cfsourcesets']);
        }).catch(err => {
            reject(err);
        });
    });
}

export function getTimesets(id) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return Vue.http.get('/api/cftimesets/',
                { params: { subscriber_id: id, page: 1, rows: rowCountAssumption } })
        }).then(result => {
            let totalCount = getJsonBody(result.body).total_count;
            if (totalCount > rowCountAssumption) {
                return Vue.http.get('/api/cftimesets/',
                    { params: { subscriber_id: id, page: 1,
                        rows: totalCount } })
            } else {
                return Promise.resolve(result);
            }
        }).then(result => {
            resolve(getJsonBody(result.body)._embedded['ngcp:cftimesets']);
        }).catch(err => {
            reject(err);
        });
    });
}

export function getDestinationsets(id) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return Vue.http.get('/api/cfdestinationsets/',
                { params: { subscriber_id: id, page: 1, rows: rowCountAssumption } })
        }).then(result => {
            let totalCount = getJsonBody(result.body).total_count;
            if (totalCount > rowCountAssumption) {
                return Vue.http.get('/api/cfdestinationsets/',
                    { params: { subscriber_id: id, page: 1,
                        rows: totalCount } })
            } else {
                return Promise.resolve(result);
            }
        }).then(result => {
            resolve(getJsonBody(result.body)._embedded['ngcp:cfdestinationsets']);
        }).catch(err => {
            reject(err);
        });
    });
}

export function loadAlwaysEverybodyDestinations(subscriberId) {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
            return getMappings(subscriberId);
        }).then((mappings)=>{
            let cfuPromises = [];
            let cfnaPromises = [];
            let cfbPromises = [];
            if(_.has(mappings, 'cfu') && _.isArray(mappings.cfu) && mappings.cfu.length > 0) {
                mappings.cfu.forEach((cfuMapping)=>{
                    if (cfuMapping.timeset_id === null && cfuMapping.sourceset_id === null) {
                        cfuPromises.push(getDestinationSetById(cfuMapping.destinationset_id));
                    }
                });
            }
            if(_.has(mappings, 'cfna') && _.isArray(mappings.cfna) && mappings.cfna.length > 0) {
                mappings.cfna.forEach((cfnaMapping)=>{
                    if (cfnaMapping.timeset_id === null && cfnaMapping.sourceset_id === null) {
                        cfnaPromises.push(getDestinationSetById(cfnaMapping.destinationset_id));
                    }
                });
            }
            if(_.has(mappings, 'cfb') && _.isArray(mappings.cfb) && mappings.cfb.length > 0) {
                mappings.cfb.forEach((cfbMapping)=>{
                    if (cfbMapping.timeset_id === null && cfbMapping.sourceset_id === null) {
                        cfbPromises.push(getDestinationSetById(cfbMapping.destinationset_id));
                    }
                });
            }
            return Promise.all([
                Promise.all(cfuPromises),
                Promise.all(cfnaPromises),
                Promise.all(cfbPromises)
            ]);
        }).then((res)=>{
            resolve({
                online: res[0],
                offline: res[1],
                busy: res[2]
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getDestinationSetById(id) {
    return new Promise((resolve, reject)=>{
        Vue.http.get('/api/cfdestinationsets/' + id).then((res)=>{
            let destinationset = getJsonBody(res.body);
            delete destinationset['_links'];
            resolve(destinationset);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function deleteDestinationFromDestinationset(options) {
    let headers = {
        'Content-Type': 'application/json-patch+json'
    };
    return new Promise((resolve, reject) => {
        Vue.http.patch('/api/cfdestinationsets/' + options.id, [{
            op: 'replace',
            path: '/destinations',
            value: options.data
        }], { headers: headers }).then(result => {
            if (options.deleteDestinationset) {
                deleteDestinationsetById(options.id).then((res) => {
                    resolve(res);
                }).catch((err) => {
                    console.log(err);
                });
            } else {
                resolve(result);
            };
        }).catch(err => {
            reject(err);
        });
    });
}

export function deleteDestinationsetById(id) {
    return new Promise((resolve, reject) => {
        Vue.http.delete('/api/cfdestinationsets/' + id).then(result => {
            resolve(result);
        }).catch(err => {
            reject(err);
        });
    });
}
