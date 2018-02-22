
import _ from 'lodash';
import Vue from 'vue';
import { i18n } from '../i18n';
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

export function getDaysFromRange(options) {
    let fromDay = options.fromDay;
    let toDay = options.toDay + 1;
    let wdayMap = {
        1: i18n.t('pages.callForward.times.sunday'),
        2: i18n.t('pages.callForward.times.monday'),
        3: i18n.t('pages.callForward.times.tuesday'),
        4: i18n.t('pages.callForward.times.wednesday'),
        5: i18n.t('pages.callForward.times.thursday'),
        6: i18n.t('pages.callForward.times.friday'),
        7: i18n.t('pages.callForward.times.saturday')
    };
    let days = [];
    while (fromDay < toDay) {
        days.push({ name: wdayMap[fromDay], number: fromDay.toString() });
        fromDay++;
    };
    return days;
}

export function getHoursFromRange(options) {
    let toHour = options.toHour + 1;
    let fromMinute = options.hasMinute ? options.fromMinute : '00';
    let toMinute = options.hasMinute ? options.toMinute + 1 : '00';
    toMinute = !toMinute ? fromMinute + 1 : toMinute;
    let hours = [];
    if (options.hasMinute) {
        while (options.fromHour < toHour) {
            hours.push({
                from: `${options.fromHour}:${fromMinute}`,
                to: `${options.fromHour}:${toMinute}`,
                hour: options.fromHour.toString()
            });
            options.fromHour++;
        };
    } else {
        hours.push({
            from: `${options.fromHour}:${fromMinute}`,
            to: `${toHour}:${toMinute}`
        });
    }
    return hours;
}

export function convertTimesetToWeekdays(options) {
    let times = [];
    let counter = 0;
    let timesetIsCompatible = true;
    let timesetHasDuplicate = false;
    let timesetExists = false;
    let timesetHasReverse = false;
    let timesetId = null;
    options.timesets.forEach((timeset) => {
        let timesetNameMatches = timeset.name === options.timesetName;
        if (counter === 0 && timesetNameMatches) {
            timeset.times.forEach((time) => {
                let isIncompatible = time.mday || time.month || time.year || !time.wday || !time.hour;
                if (isIncompatible) {
                    timesetIsCompatible = false;
                    return;
                } else  {
                    let days = [];
                    let hours = [];
                    let fromDay = parseInt(time.wday.split('-')[0]);
                    let toDay = time.wday.split('-')[1] ? parseInt(time.wday.split('-')[1]) : fromDay;
                    let fromHour = parseInt(time.hour.split('-')[0]);
                    let toHour = time.hour.split('-')[1] ? parseInt(time.hour.split('-')[1]) : fromHour;
                    let fromMinute = time.minute ? parseInt(time.minute.split('-')[0]) : undefined;
                    let toMinute = (time.minute && time.minute.split('-')[1]) ? parseInt(time.minute.split('-')[1]) : undefined;
                    let isReverse = fromDay > toDay || fromHour > toHour || fromMinute > toMinute;
                    let timesHour;
                    if (isReverse) {
                        timesetHasReverse = true;
                        return;
                    } else {
                        hours = getHoursFromRange({ hasMinute: !!time.minute,
                            fromHour: fromHour, toHour: toHour,
                            fromMinute: fromMinute, toMinute: toMinute });
                        days = getDaysFromRange({ fromDay: fromDay, toDay: toDay });
                        days.forEach(day => {
                            hours.forEach(hour => {
                                timesHour = time.minute ? hour.hour : time.hour;
                                times.push({
                                    weekday: day.name,
                                    from: hour.from,
                                    to: hour.to,
                                    wday: day.number,
                                    hour: timesHour,
                                    minute: time.minute
                                });
                            });
                        });
                        timesetId = timeset.id;
                        timesetIsCompatible = true;
                    }
                }
            });
            timesetExists = true;
            counter++;
        } else if (timesetNameMatches) {
            timesetHasDuplicate = true;
            return;
        }
    });
    return {
        times: times,
        timesetIsCompatible: timesetIsCompatible,
        timesetExists: timesetExists,
        timesetHasReverse: timesetHasReverse,
        timesetHasDuplicate: timesetHasDuplicate,
        timesetId: timesetId
    };
}

export function loadTimesetTimes(options) {
    return new Promise((resolve, reject)=> {
        Promise.resolve().then(() => {
            return getTimesets(options.subscriberId);
        }).then((timesets) => {
            let times = convertTimesetToWeekdays({ timesets: timesets, timesetName: options.timeset});
            return times;
        }).then((times) => {
            resolve(times);
        }).catch((err) => {
            reject(err);
        });
    });
}

export function deleteTimeFromTimeset(options) {
    let headers = {
        'Content-Type': 'application/json-patch+json'
    };
    return new Promise((resolve, reject) => {
        Vue.http.patch('/api/cftimesets/' + options.timesetId, [{
            op: 'replace',
            path: '/times',
            value: options.times
        }], { headers: headers }).then((result) => {
            resolve(result);
        }).catch(err => {
            reject(err);
        });
    });
}

export function deleteTimesetById(id) {
    return new Promise((resolve, reject) => {
        Vue.http.delete('/api/cftimesets/' + id).then(() => {
            resolve();
        }).catch(err => {
            reject(err);
        });
    });
}
