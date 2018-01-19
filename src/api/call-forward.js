
import _ from 'lodash';
import Vue from 'vue';
import { getJsonBody } from './utils';

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
        }).then((mappings) => {
            let cfuPromises = [];
            let cfnaPromises = [];
            let cfbPromises = [];
            if(_.has(mappings, 'cfu') && _.isArray(mappings.cfu) && mappings.cfu.length > 0) {
                mappings.cfu.forEach((cfuMapping)=>{
                    if (cfuMapping.timeset_id === null && cfuMapping.sourceset_id === null) {
                        cfuPromises.push(getDestinationsetById(cfuMapping.destinationset_id));
                    }
                });
            }
            if(_.has(mappings, 'cfna') && _.isArray(mappings.cfna) && mappings.cfna.length > 0) {
                mappings.cfna.forEach((cfnaMapping)=>{
                    if (cfnaMapping.timeset_id === null && cfnaMapping.sourceset_id === null) {
                        cfnaPromises.push(getDestinationsetById(cfnaMapping.destinationset_id));
                    }
                });
            }
            if(_.has(mappings, 'cfb') && _.isArray(mappings.cfb) && mappings.cfb.length > 0) {
                mappings.cfb.forEach((cfbMapping)=>{
                    if (cfbMapping.timeset_id === null && cfbMapping.sourceset_id === null) {
                        cfbPromises.push(getDestinationsetById(cfbMapping.destinationset_id));
                    }
                });
            }
            return Promise.all([
                Promise.all(cfuPromises),
                Promise.all(cfnaPromises),
                Promise.all(cfbPromises)
            ]);
        }).then((res)=>{
			sortDestinationsByPriority(res[0], 'cfu');
			addGroupNames(res[0], 'cfu');
			sortDestinationsByPriority(res[1], 'cfna');
			addGroupNames(res[1], 'cfna');
			sortDestinationsByPriority(res[2], 'cfb');
			addGroupNames(res[2], 'cfb');
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

export function sortDestinationsByPriority(group) {
    group.forEach(destinationset => {
		destinationset.destinations.sort((a, b) => {
			return parseFloat(a.priority) - parseFloat(b.priority);
		});
    });
    return group;
}

export function addGroupNames(group, groupName) {
    group.forEach(destinationset => {
        destinationset.groupName = groupName;
    });
    return group;
}

export function getDestinationsetById(id) {
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

export function addDestinationToDestinationset(options) {
    let headers = {
        'Content-Type': 'application/json-patch+json'
    };
    return new Promise((resolve, reject) => {
        Vue.http.patch('/api/cfdestinationsets/' + options.id, [{
            op: 'replace',
            path: '/destinations',
            value: options.data
        }], { headers: headers }).then(result => {
                resolve(result);
        }).catch(err => {
            reject(err);
        });
    });
}

export function addNewDestinationset() {
    let destinationsetName = `csc-${Date.now()}`;
    return new Promise((resolve, reject) => {
        Vue.http.post('/api/cfdestinationsets/', { name: destinationsetName  })
            .then(response => {
                resolve(_.last(_.split(response.headers.get('Location'), '/')));
            }).catch(err => {
                reject(err);
            });
    });
}

export function addDestinationToExistingGroup(options) {
    return new Promise((resolve, reject)=> {
        Promise.resolve().then(() => {
            return getDestinationsetById(options.id);
        }).then((destinationset) => {
            let data = destinationset.destinations;
            data.push(options.data);
            return addDestinationToDestinationset({
                id: options.id, data: data
            });
        }).then(() => {
            resolve();
        }).catch((err) => {
            reject(err);
        });
    });
}

export function addDestinationToEmptyGroup(options) {
    return new Promise((resolve, reject)=> {
        let destinationsetId;
        Promise.resolve().then(() => {
            return addNewDestinationset();
        }).then((id) => {
            destinationsetId = id;
            return addDestinationToDestinationset({
                id: id, data: [options.data]
            });
        //}).then(() => {
        //    return getMappings(subscriberId);
        //}).then((mappings) => {
        //    return addNewMapping({
        //        destinationsetId: destinationsetId,
        //        group: options.groupName,
        //        subscriberId: options.subscriberId,
        //        mappings: mappings
        //    });
        }).then(() => {
            return addNewMapping({
                destinationsetId: destinationsetId,
                group: options.groupName,
                subscriberId: options.subscriberId
            });
        }).then(() => {
            resolve();
        }).catch((err) => {
            reject(err);
        });
    });
}

export function addNewMapping(options) {
    let headers = {
        'Content-Type': 'application/json-patch+json'
    };
    return new Promise((resolve, reject) => {
        let mappingsToSend = [{
            destinationset_id: options.destinationsetId,
            sourceset_id: null,
            timeset_id: null
        }];
        Vue.http.patch('/api/cfmappings/' + options.subscriberId, [{
            op: 'replace',
            path: '/' + options.group,
            value: mappingsToSend
        }], { headers: headers }).then(result => {
            resolve(result);
        }).catch(err => {
            reject(err);
        });
    });
}

export function changePositionOfDestination(options) {
    let headers = {
        'Content-Type': 'application/json-patch+json'
    };
    return new Promise((resolve, reject) => {
        Vue.http.patch('/api/cfdestinationsets/' + options.id, [{
            op: 'replace',
            path: '/' + options.group,
            value: options.destinations
        }], { headers: headers }).then(result => {
            resolve(result);
        }).catch(err => {
            reject(err);
        });
    });
}
