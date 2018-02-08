
import Vue from 'vue';
import { getJsonBody } from './utils';
import { getNumbers, assignNumber, assignNumbers } from './user';
import { createSubscriber, deleteSubscriber } from './subscriber';
import uuid from 'uuid';

var createId = uuid.v4;
var assumedRows = 1000;

export function getAllPbxSubscribers() {
    return new Promise((resolve, reject)=>{
        var params = {};
        Promise.resolve().then(()=>{
            return Vue.http.get('/api/subscribers', {
                params: _.assign(params, {
                    page: 1,
                    rows: assumedRows
                })
            });
        }).then((res)=>{
            let body = getJsonBody(res.body);
            if(body.total_count > assumedRows) {
                return Vue.http.get('/api/subscribers', {
                    params: _.assign(params, {
                        page: 1,
                        rows: body.total_count,
                    })
                });
            } else {
                return Promise.resolve(body);
            }
        }).then(($subscribers)=>{
            let subscribers = _.get($subscribers, '_embedded.ngcp:subscribers', []);
            let pilot = null;
            let seats = [];
            let groups = [];
            subscribers.forEach((subscriber)=>{
                if(_.has(subscriber, 'is_pbx_pilot') && subscriber.is_pbx_pilot === true) {
                    pilot = subscriber;
                } else if(_.has(subscriber, 'is_pbx_group') && subscriber.is_pbx_group === true) {
                    groups.push(subscriber);
                } else if (_.has(subscriber, 'pbx_extension') && subscriber.pbx_extension !== null) {
                    seats.push(subscriber);
                }
            });
            resolve({
                pilot: pilot,
                groups: groups,
                seats: seats
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getPbxConfiguration() {
    return new Promise((resolve, reject)=>{
        Promise.all([
            getAllPbxSubscribers(),
            getNumbers()
        ]).then((result)=>{
            resolve({
                pilot: result[0].pilot,
                seats: result[0].seats,
                groups: result[0].groups,
                numbers: result[1]
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function addGroup(group) {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
            return createSubscriber({
                customer_id: group.customerId,
                domain_id: group.domainId,
                username: createId(),
                password: createId(),
                display_name: group.name,
                is_pbx_group: true,
                pbx_extension: group.extension,
                pbx_hunt_policy: group.huntPolicy,
                pbx_hunt_timeout: group.huntTimeout,
                pbx_groupmember_ids: group.seats
            });
        }).then((subscriberId)=>{
            assignNumbers(group.aliasNumbers, subscriberId);
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function removeGroup(id) {
    return deleteSubscriber(id);
}

export function addSeat(seat) {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
            return createSubscriber({
                customer_id: seat.customerId,
                domain_id: seat.domainId,
                username: createId(),
                password: createId(),
                display_name: seat.name,
                is_pbx_group: false,
                pbx_extension: seat.extension,
                pbx_group_ids: seat.groups
            });
        }).then((subscriberId)=>{
            assignNumbers(seat.aliasNumbers, subscriberId);
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function removeSeat(id) {
    return deleteSubscriber(id);
}
