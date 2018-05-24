
import { saveAs } from 'file-saver'
import Vue from 'vue'
import _ from 'lodash'
import crypto from 'crypto-browserify'
import { getJsonBody } from './utils'

export function getConversations(id, page, rows) {
    return new Promise((resolve, reject) => {
        let params = { subscriber_id: id, page: page, rows: rows,
            order_by: 'timestamp', order_by_direction: 'desc' };
        Vue.http.get('api/conversations/', { params: params })
            .then(result => {
                let jsonBody = getJsonBody(result.body);
                if (_.has(jsonBody, "_embedded.ngcp:conversations")) {
                    let list = [];
                    _.forEach(jsonBody._embedded['ngcp:conversations'], function(item) {
                        let inputString = `${item.type}${item.call_type}${item.id}`;
                        let id = crypto.createHash('sha256').update(inputString).digest('base64');
                        item._id = id;
                        delete item._links;
                        if (item.type == 'call') {
                            item.type = item.call_type != 'call' ? 'callforward'
                                : item.type;
                        }
                        list.push(item);
                    });
                    resolve(list);
                }
                else {
                    reject(new Error('No items returned for this page.'))
                }
            }).catch((err) => {
                reject(err);
            });
    });
}

export function downloadVoiceMail(id) {
    return new Promise((resolve, reject)=>{
        Vue.http.get('api/voicemailrecordings/' + id, { responseType: 'blob' })
            .then((res) => {
                return res.blob();
            }).then(voicemail => {
                saveAs((voicemail), "voicemail-" + id + '.wav');
                resolve();
            }).catch((err)=>{
                reject(err);
            });
    });
}

export function downloadFax(id) {
    return new Promise((resolve, reject)=>{
        Vue.http.get('api/faxrecordings/' + id, { responseType: 'blob' })
            .then((res) => {
                return res.blob();
            }).then(fax => {
                saveAs((fax), "fax-" + id + '.tif');
                resolve();
            }).catch((err)=>{
                reject(err);
            });
    });
}
