
import _ from 'lodash';
import Vue from 'vue';
import { getJsonBody } from './utils';

export const LIST_DEFAULT_PAGE = 1;
export const LIST_DEFAULT_ROWS = 25;
export const LIST_ALL_ROWS = 1000;

export function getList(options) {
    return new Promise((resolve, reject) => {
        options = options || {};
        options = _.merge({
            all: false,
            params: {
                page: LIST_DEFAULT_PAGE,
                rows: LIST_DEFAULT_ROWS
            },
            headers: {
                'Accept': 'application/json'
            }
        }, options);
        Promise.resolve().then(() => {
            if(options.all === true) {
                options.params.rows = LIST_ALL_ROWS;
            }
            return Vue.http.get(options.path, {
                params: options.params,
                headers: options.headers
            });
        }).then((res) => {
            let body = getJsonBody(res.body);
            if(options.all === true && body.total_count > LIST_ALL_ROWS) {
                return Vue.http.get(options.path, {
                    params: _.merge(options.params, {
                        rows: body.total_count
                    }),
                    headers: options.headers
                });
            }
            else {
                return Promise.resolve(res);
            }
        }).then((res) => {
            let body = getJsonBody(res.body);
            let totalCount = _.get(body, 'total_count', 0);
            let lastPage = Math.ceil( totalCount / options.params.rows );
            if(options.all === true) {
                lastPage = 1;
            }
            if(lastPage === 0) {
                lastPage = null;
            }
            resolve({
                items: _.get(body, options.root, []),
                lastPage: lastPage
            });
        }).catch((err) => {
            reject(err);
        });
    });
}

export function get(options) {
    return new Promise((resolve, reject) => {
        return Vue.http.get(options.path, {
            headers: {
                'Accept': 'application/json'
            }
        }).then((result) => {
            resolve(getJsonBody(result.body));
        }).catch((err) => {
            if(err.status && err.status >= 400) {
                reject(new Error(err.body.message));
            }
            else {
                reject(err);
            }
        });
    });
}

export function patchReplace(options) {
    return new Promise((resolve, reject) => {
        Vue.http.patch(options.path, [{
            op: 'replace',
            path: '/'+ options.fieldPath,
            value: options.value
        }], {
            headers: {
                'Content-Type': 'application/json-patch+json',
                'Prefer': 'return=minimal'
            }
        }).then((result) => {
            resolve(result);
        }).catch((err) => {
            if(err.status >= 400) {
                reject(new Error(err.body.message));
            }
            else {
                reject(err);
            }
        });
    });
}

export function patchAdd(options) {
    return new Promise((resolve, reject) => {
        Vue.http.patch(options.path, [{
            op: 'add',
            path: '/'+ options.fieldPath,
            value: options.value
        }], {
            headers: {
                'Content-Type': 'application/json-patch+json',
                'Prefer': 'return=minimal'
            }
        }).then((result) => {
            resolve(result);
        }).catch((err) => {
            if(err.status >= 400) {
                reject(new Error(err.body.message));
            }
            else {
                reject(err);
            }
        });
    });
}

export function getFieldList(options) {
    return new Promise((resolve, reject) => {
        options = options || {};
        options = _.merge({
            headers: {
                'Accept': 'application/json'
            }
        }, options);
        Vue.http.get(options.path, {
            headers: options.headers
        }).then((result) => {
            let fieldList = getJsonBody(result.body)[options.field];
            resolve(fieldList);
        }).catch((err) => {
            reject(err);
        });
    });
}
