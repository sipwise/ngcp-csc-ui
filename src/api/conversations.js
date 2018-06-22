
import _ from 'lodash'
import { saveAs } from 'file-saver'
import Vue from 'vue'
import { getList } from './common'


export function getConversations(options) {
    return new Promise((resolve, reject)=>{
        let type = _.get(options, 'type', null);
        let params ={
            subscriber_id: _.get(options, 'subscriberId'),
            page: _.get(options, 'page', 1),
            rows: _.get(options, 'rows', 25),
            order_by: _.get(options, 'order_by', 'timestamp'),
            order_by_direction: 'desc'
        };
        if(type !== null) {
            params.type = type;
        }
        getList({
            path: 'api/conversations/',
            root: '_embedded.ngcp:conversations',
            params: params
        }).then((list)=>{
            resolve(list);
        }).catch((err)=>{
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

export function playVoiceMail(options) {
    return new Promise((resolve, reject)=>{
        let params = { format: options.format };
        Vue.http.get(`api/voicemailrecordings/${options.id}`, { params: params, responseType: 'blob' })
            .then((res) => {
                resolve(URL.createObjectURL(res.body));
            }).catch((err)=>{
                reject(err);
            });
    });
}
