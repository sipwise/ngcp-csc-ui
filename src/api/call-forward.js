
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
        }).then((result) => {
            let response = getJsonBody(result.body)._embedded || [];
            let timesets = response['ngcp:cftimesets'] || [];
            resolve(timesets);
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

export function loadEverybodyDestinations(options) {
    return new Promise((resolve, reject)=>{
        let cfuTimeset = null;
        let cfnaTimeset = null;
        let cfbTimeset = null;
        Promise.resolve().then(()=>{
            return getMappings(options.subscriberId);
        }).then((mappings)=>{
            let cfuPromises = [];
            let cfnaPromises = [];
            let cfbPromises = [];
            if(_.has(mappings, 'cfu') && _.isArray(mappings.cfu) && mappings.cfu.length > 0) {
                mappings.cfu.forEach((cfuMapping)=>{
                    if (cfuMapping.timeset === options.timeset && cfuMapping.sourceset_id === null) {
                        cfuTimeset = cfuMapping.timeset_id;
                        cfuPromises.push(getDestinationsetById(cfuMapping.destinationset_id));
                    }
                });
            }
            if(_.has(mappings, 'cfna') && _.isArray(mappings.cfna) && mappings.cfna.length > 0) {
                mappings.cfna.forEach((cfnaMapping)=>{
                    if (cfnaMapping.timeset === options.timeset && cfnaMapping.sourceset_id === null) {
                        cfnaTimeset = cfnaMapping.timeset_id;
                        cfnaPromises.push(getDestinationsetById(cfnaMapping.destinationset_id));
                    }
                });
            }
            if(_.has(mappings, 'cfb') && _.isArray(mappings.cfb) && mappings.cfb.length > 0) {
                mappings.cfb.forEach((cfbMapping)=>{
                    if (cfbMapping.timeset === options.timeset && cfbMapping.sourceset_id === null) {
                        cfbTimeset = cfbMapping.timeset_id;
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
            addGroupNamesAndTimeset({ group: res[0], groupName: 'cfu', timesetId: cfuTimeset });
            addGroupNamesAndTimeset({ group: res[1], groupName: 'cfna', timesetId: cfnaTimeset });
            addGroupNamesAndTimeset({ group: res[2], groupName: 'cfb', timesetId: cfbTimeset });
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

export function addGroupNamesAndTimeset(options) {
    options.group.forEach(destinationset => {
        destinationset.groupName = options.groupName;
        destinationset.timesetId = options.timesetId;
    });
    return options.group;
}

export function getDestinationsetById(id) {
    return new Promise((resolve, reject)=>{
        Vue.http.get('/api/cfdestinationsets/' + id).then((res)=>{
            let destinationset = getJsonBody(res.body);
            delete destinationset['_links'];
            destinationset.destinations.sort((a, b) => {
                return parseFloat(a.priority) - parseFloat(b.priority);
            });
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
        }).then(() => {
            return getMappings(options.subscriberId);
        }).then((mappings) => {
            let updatedMappings = mappings[options.groupName];
            updatedMappings.push({
                destinationset_id: destinationsetId,
                sourceset_id: null,
                timeset_id: options.timesetId
            });
            return addNewMapping({
                mappings: updatedMappings,
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
    let headers = { 'Content-Type': 'application/json-patch+json' };
    return new Promise((resolve, reject) => {
        Vue.http.patch('/api/cfmappings/' + options.subscriberId, [{
            op: 'replace',
            path: '/' + options.group,
            value: options.mappings
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
            path: '/destinations',
            value: options.destinations
        }], { headers: headers }).then(result => {
            resolve(result);
        }).catch(err => {
            reject(err);
        });
    });
}

export function moveDestinationUp(options) {
    return new Promise((resolve, reject)=> {
        Promise.resolve().then(() => {
            let getPromises = [];
            getPromises.push(getDestinationsetById(options.prevId));
            getPromises.push(getDestinationsetById(options.id));
            return Promise.all(getPromises);
        }).then((destinationsets) => {
            let updatePromises = [];
            let lastDestinationPrevId = _.findLast(destinationsets[0].destinations) || {};
            let lowestPriorityPrevId = lastDestinationPrevId.priority || 1;
            let prevDestinations = destinationsets[0].destinations;
            let currentDestinations = destinationsets[1].destinations;
            let prevDestinationsMoveToIndex = prevDestinations.length < 2 ?
                1 : prevDestinations.length-2;
            options.destination.priority = lowestPriorityPrevId;
            prevDestinations.splice(prevDestinationsMoveToIndex, 0, options.destination);
            currentDestinations.shift();
            updatePromises.push(addDestinationToDestinationset({
                id: options.prevId,
                data: prevDestinations
            }));
            updatePromises.push(deleteDestinationFromDestinationset({
                id: options.id,
                data: currentDestinations
            }));
            return Promise.all(updatePromises);
        }).then(() => {
            resolve();
        }).catch((err) => {
            reject(err);
        });
    });
}

export function moveDestinationDown(options) {
    return new Promise((resolve, reject)=> {
        Promise.resolve().then(() => {
            let getPromises = [];
            getPromises.push(getDestinationsetById(options.nextId));
            getPromises.push(getDestinationsetById(options.id));
            return Promise.all(getPromises);
        }).then((destinationsets) => {
            let updatePromises = [];
            let firstDestinationNextId = _.head(destinationsets[0].destinations) || {};
            let highestPriorityNextId = firstDestinationNextId.priority || 1;
            let nextDestinations = destinationsets[0].destinations;
            let currentDestinations = destinationsets[1].destinations;
            options.destination.priority = highestPriorityNextId;
            nextDestinations.splice(1, 0, options.destination);
            currentDestinations.pop();
            updatePromises.push(addDestinationToDestinationset({
                id: options.nextId,
                data: nextDestinations
            }));
            updatePromises.push(deleteDestinationFromDestinationset({
                id: options.id,
                data: currentDestinations
            }));
            return Promise.all(updatePromises);
        }).then(() => {
            resolve();
        }).catch((err) => {
            reject(err);
        });
    });
}

export function loadTimesetTimes(options) {
    return new Promise((resolve, reject)=> {
        Promise.resolve().then(() => {
            return getTimesets(options.subscriberId);
        }).then((timesets) => {
            let times = [];
            let timesByWdays = [];
            let counter = 0;
            let isCompatible = false;
            let hasTimeset = false;
            let wdayMap = {
                1: 'Sunday',
                2: 'Monday',
                3: 'Tuesday',
                4: 'Wednesday',
                5: 'Thursday',
                6: 'Friday',
                7: 'Saturday'
            };
            timesets.forEach((timeset) => {
                if (counter === 0 && timeset.name === options.timeset) {
                    timeset.times.forEach((time) => {
                        let wdays;
                        let days;
                        if (time.mday || time.minute ||
                            time.month || time.year ||
                            !time.wday || !time.hour) {
                                isCompatible = false;
                                return;
                        } else {
                            if (time.wday) {
                                wdays = time.wday.split('-');
                                let fromDay = parseInt(wdays[0]);
                                let toDay = parseInt(wdays[1]);
                                while (fromDay < toDay) {
                                    let newDay = fromDay.toString();
                                    wdays.push(newDay);
                                    fromDay++;
                                };
                                _.sortBy(_.uniq(wdays)).forEach(day => {
                                    times.push({
                                        weekday: wdayMap[parseInt(day)],
                                        from: time.hour.split('-')[0],
                                        to: time.hour.split('-')[1] || time.hour.split('-')[0]
                                    });
                                });
                            };
                            isCompatible = true;
                        }
                    });
                    hasTimeset = true;
                    counter++;
                } else if (timeset.name === options.timeset) {
                    isCompatible = false;
                    return;
                }
            });
            return {
                times: times,
                isCompatible: isCompatible,
                hasTimeset: hasTimeset
            };
        }).then((times) => {
            resolve(times);
        }).catch((err) => {
            reject(err);
        });
    });
}
