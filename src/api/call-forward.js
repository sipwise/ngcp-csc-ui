
import _ from 'lodash';
import Vue from 'vue';
import { i18n } from '../i18n';
import { getJsonBody } from './utils';
import { normalizeDestination } from '../filters/number-format'

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
            }
            else {
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
            }
            else {
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
            }
            else {
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
            addNameIdAndTerminating({ group: res[0], groupName: 'cfu', timesetId: cfuTimeset });
            addNameIdAndTerminating({ group: res[1], groupName: 'cfna', timesetId: cfnaTimeset });
            addNameIdAndTerminating({ group: res[2], groupName: 'cfb', timesetId: cfbTimeset });
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

export function addNameIdAndTerminating(options) {
    let terminatingFlag = false;
    options.group.forEach(destinationset => {
        destinationset.groupName = options.groupName;
        destinationset.timesetId = options.timesetId;
        destinationset.destinations.forEach(destination => {
            let normalized = normalizeDestination(destination.destination);
            if (!terminatingFlag && _.includes(['Voicemail', 'Fax2Mail', 'Manager Secretary',
                'Custom Announcement', 'Conference'], normalized)) {
                    terminatingFlag = true;
                    destination.terminated = false;
                }
                else if (terminatingFlag) {
                    destination.terminated = true;
                }
                else {
                    destination.terminated = false;
                }
        });
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
            }
            else {
                resolve(result);
            }
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
    }
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
        }
    }
    else {
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
                }
                else  {
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
                    }
                    else {
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
        }
        else if (timesetNameMatches) {
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

export function resetTimesetByName(options) {
    return new Promise((resolve, reject)=> {
        Promise.resolve().then(() => {
            return getTimesets(options.id);
        }).then((timesets) => {
            let deleteTimesetPromises = [];
            _.filter(timesets, { 'name': options.name }).forEach((timeset) => {
                deleteTimesetPromises.push(deleteTimesetById(timeset.id));
            });
            return Promise.all(deleteTimesetPromises);
        }).then(() => {
            resolve();
        }).catch((err) => {
            reject(err);
        });
    });
}

export function addTimeToTimeset(options) {
    let headers = {
        'Content-Type': 'application/json-patch+json'
    };
    return new Promise((resolve, reject) => {
        Vue.http.patch('/api/cftimesets/' + options.id, [{
            op: 'replace',
            path: '/times',
            value: options.time
        }], { headers: headers }).then(() => {
            resolve();
        }).catch(err => {
            reject(err);
        });
    });
}

export function addNewTimeset(timesetName) {
    return new Promise((resolve, reject) => {
        Vue.http.post('/api/cftimesets/', { name: timesetName  })
            .then(response => {
                resolve(_.last(_.split(response.headers.get('Location'), '/')));
            }).catch(err => {
                reject(err);
            });
    });
}

export function convertAddTime(options) {
    let time = options.time;
    let weekday = options.weekday;
    let convertedTime = [];
    let fromHour = time.from.split(':')[0];
    let toHour = time.to.split(':')[0];
    let fromMinute = time.from.split(':')[1];
    let toMinute = time.to.split(':')[1];
    let bothHasFullHour = fromMinute  === '00' && toMinute  === '00';
    let bothHasSameHour = fromHour  === toHour;
    let fromMinuteNotZero = time.from.split(':')[1] !== '00';
    let toMinuteNotZero = time.to.split(':')[1] !== '00';
    let bothMinutesNotZeroAndNextHourPlusOne = fromMinuteNotZero && toMinuteNotZero && parseInt(toHour) === parseInt(fromHour) + 1;
    let bothMinutesNotZero = time.from.split(':')[1] !== '00' &&
        time.to.split(':')[1] !== '00';
    let startNotZeroAndEndNextFullHour =
        (parseInt(fromHour) === (parseInt(toHour) - 1) && toMinute === '00');
    if (bothHasFullHour) {
        convertedTime.push({ wday: weekday, hour: `${parseInt(fromHour)}-${parseInt(toHour)-1}` });
    }
    else if (bothHasSameHour) {
        convertedTime.push({ wday: weekday, hour: `${parseInt(fromHour)}`, minute: `${parseInt(fromMinute)}-${parseInt(toMinute)-1}`});
    }
    else if (startNotZeroAndEndNextFullHour) {
        convertedTime.push({ wday: weekday, hour: `${parseInt(fromHour)}`, minute: `${parseInt(fromMinute)}-59` });
    }
    else if (bothMinutesNotZeroAndNextHourPlusOne) {
        convertedTime.push(
            { wday: weekday, hour: `${parseInt(fromHour)}`, minute: `${parseInt(fromMinute)}-59` },
            { wday: weekday, hour: `${parseInt(toHour)}`, minute: `0-${parseInt(toMinute)-1}` }
        );
    }
    else if (bothMinutesNotZero) {
        convertedTime.push(
            { wday: weekday, hour: `${parseInt(fromHour)}`, minute: `${parseInt(fromMinute)}-59` },
            { wday: weekday, hour: `${parseInt(fromHour)+1}-${parseInt(toHour)-1}` },
            { wday: weekday, hour: `${parseInt(toHour)}`, minute: `0-${parseInt(toMinute)-1}` }
        );
    }
    // From minute not zero and to minute zero
    else if (fromMinuteNotZero) {
        convertedTime.push(
            { wday: weekday, hour: `${parseInt(fromHour)}`, minute: `${parseInt(fromMinute)}-59` },
            { wday: weekday, hour: `${parseInt(fromHour)+1}-${parseInt(toHour)-1}` }
        );
    }
    // From minute zero and to minute not zero
    else if (toMinuteNotZero) {
        convertedTime.push(
            { wday: weekday, hour: `${parseInt(fromHour)+1}-${parseInt(toHour)-1}` },
            { wday: weekday, hour: `${parseInt(toHour)}`, minute: `0-${parseInt(toMinute)-1}` }
        );
    }
    return convertedTime;
}

export function createTimesetWithTime(options) {
    let convertedTime = convertAddTime({ time: options.time[0], weekday: options.weekday });
    return new Promise((resolve, reject)=> {
        Promise.resolve().then(() => {
            return addNewTimeset(options.name);
        }).then((timesetId) => {
            return addTimeToTimeset({ id: timesetId, time: convertedTime });
        }).then(() => {
            resolve();
        }).catch((err) => {
            reject(err);
        });
    });
}

export function getTimesByTimesetId(id) {
    return new Promise((resolve, reject)=>{
        Vue.http.get('/api/cftimesets/' + id).then((res)=>{
            let timeset = getJsonBody(res.body);
            delete timeset['_links'];
            resolve(timeset.times);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function appendTimeToTimeset(options) {
    let convertedTime = convertAddTime({ time: options.time[0], weekday: options.weekday });
    return new Promise((resolve, reject)=> {
        Promise.resolve().then(() => {
            return getTimesByTimesetId(options.id);
        }).then((times) => {
            let concatTimes = times.concat(convertedTime);
            return addTimeToTimeset({ id: options.id, time: concatTimes });
        }).then(() => {
            resolve();
        }).catch((err) => {
            reject(err);
        });
    });
}
