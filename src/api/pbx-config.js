
import Vue from 'vue';
import { getJsonBody } from './utils';
import { getNumbers } from './user';

var assumedRows = 1000;

export function getAllPbxSubscribers() {
    return new Promise((resolve, reject)=>{
        var params = {};
        Promise.resolve().then(()=>{
            return Vue.http.get('/api/subscribers', {
                params: _.assign(params, {
                    page: 1,
                    rows: assumedRows,
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
                if(subscriber.is_pbx_group) {
                    groups.push(subscriber);
                } else if(subscriber.is_pbx_pilot) {
                    pilot = subscriber;
                } else {
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
