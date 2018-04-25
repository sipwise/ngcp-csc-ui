
import _ from 'lodash';
import Vue from 'vue';
import { getJsonBody } from './utils';

export const LIST_DEFAULT_PAGE = 1;
export const LIST_DEFAULT_ROWS = 25;
export const LIST_ALL_ROWS = 1000;

export function getList(options) {
    return new Promise((resolve, reject)=>{
        options = options || {};
        options = _.merge({
            all: false,
            params: {
                page: LIST_DEFAULT_PAGE,
                rows: LIST_DEFAULT_ROWS
            }
        }, options);
        Promise.resolve().then(()=>{
            if(options.all === true) {
                options.params.rows = LIST_ALL_ROWS;
            }
            return Vue.http.get(options.path, {
                params: options.params
            });
        }).then((res)=>{
            let body = getJsonBody(res.body);
            if(options.all === true && body.total_count > LIST_ALL_ROWS) {
                return Vue.http.get(options.path, {
                    params: _.merge(options.params, {
                        rows: body.total_count
                    })
                });
            }
            else {
                return Promise.resolve(res);
            }
        }).then((res)=>{
            let body = getJsonBody(res.body);
            let lastPage = Math.ceil( body.total_count / options.params.rows );
            if(options.all === true) {
                lastPage = 1;
            }
            resolve({
                items: _.get(body, options.root, []),
                lastPage: lastPage
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}
