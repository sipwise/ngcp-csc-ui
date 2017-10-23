
import Vue from 'vue';
import { getJsonBody } from './utils'

export function getConversations(id) {
    return new Promise((resolve, reject) => {
        Vue.http.get('/api/conversations/?subscriber_id=' + id).then((result)=>{
            resolve(getJsonBody(result.body)._embedded['ngcp:conversations']);
        }).catch((err)=>{
            reject(err);
        });
    });
}
