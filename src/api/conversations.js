
import Vue from 'vue';
import _ from 'lodash';
import { getJsonBody } from './utils'

export function getConversations(id, page, rows) {
    let params = { subscriber_id: id, page: page, rows: rows };
    return new Promise((resolve, reject) => {
        Vue.http.get('/api/conversations/', { params: params })
            .then(result => {
                let jsonBody = getJsonBody(result.body);
                if (_.has(jsonBody, "_embedded.ngcp:conversations")) {
                    resolve(jsonBody._embedded['ngcp:conversations']);
                } else {
                    reject(new Error('No items returned for this page.'))
                };
            }).catch(err => {
                reject(err);
            });
    });
}
