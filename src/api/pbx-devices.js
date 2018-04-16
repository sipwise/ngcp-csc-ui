'use strict';

import _ from 'lodash';
import Vue from 'vue';
import { getJsonBody } from './utils'

export function getAllDevices(options) {
    return new Promise((resolve, reject)=>{
        let rows = _.get(options, 'rows', 25);
        let page = _.get(options, 'page', 1);
        Vue.http.get('/api/pbxdevices/', null, {
            params: {
                rows: rows,
                page: page
            }
        }).then((result)=>{
            let body = getJsonBody(result.body);
            let totalCount = body.totalCount;
            let lastPage = Math.ceil(totalCount / rows);
            let items = _.get(body, '_embedded.ngcp:pbxdevices');
            resolve({
                lastPage: lastPage,
                items: items
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getAllProfiles() {
    return new Promise((resolve, reject)=>{
        Vue.http.get('/api/pbxdeviceprofiles/').then((result)=>{
            let body = getJsonBody(result.body);
            resolve(_.get(body, '_embedded.ngcp:pbxdeviceprofiles'));
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getAllModels() {
    return new Promise((resolve, reject)=>{
        Vue.http.get('/api/pbxdevicemodels/').then((result)=>{
            let body = getJsonBody(result.body);
            resolve(_.get(body, '_embedded.ngcp:pbxdevicemodels'));
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getDeviceList() {
    return new Promise((resolve, reject)=>{
        Promise.all([
            getAllDevices(),
            getAllProfiles(),
            getAllModels()
        ]).then((results)=>{
            resolve({
                devices: results[0],
                profiles: results[1],
                models: results[2]
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}
