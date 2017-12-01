
import Vue from 'vue'
import _ from 'lodash'
import crypto from 'crypto-browserify'
import { getJsonBody } from './utils'

export function getConversations(id, page, rows) {
    let params = { subscriber_id: id, page: page, rows: rows,
        order_by: 'timestamp', order_by_direction: 'desc' };
    return new Promise((resolve, reject) => {
        Vue.http.get('/api/conversations/', { params: params })
            .then(result => {
                let jsonBody = getJsonBody(result.body);
                if (_.has(jsonBody, "_embedded.ngcp:conversations")) {
                    let list = [];
                    _.forEach(jsonBody._embedded['ngcp:conversations'], function(item) {
                        let inputString = `${item.type}${item.call_type}${item.id}`;
                        let id = crypto.createHash('sha256').update(inputString).digest('base64');
                        item._id = id;
                        if (item._links['ngcp:voicemailrecordings']) {
                            item.voicemail = window.location.origin +
                                item._links['ngcp:voicemailrecordings'].href;
                        };
                        delete item._links;
                        if (item.type == 'call') {
                            item.type = item.call_type != 'call' ? 'callforward'
                                : item.type;
                        };
                        list.push(item);
                    });
                    console.log(list);
                    resolve(list);
                } else {
                    reject(new Error('No items returned for this page.'))
                };
            }).catch(err => {
                reject(err);
            });
    });
}
