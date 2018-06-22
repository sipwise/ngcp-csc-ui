
import { saveAs } from 'file-saver'
import Vue from 'vue'
import { getList } from './common'


export function getConversations(id, page, rows, type) {
    return getList({
        path: 'api/conversations/',
        root: '_embedded.ngcp:conversations',
        params: {
            subscriber_id: id,
            page: page,
            rows: rows,
            type: type,
            order_by: 'timestamp',
            order_by_direction: 'desc'          
        }
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
