
import Vue from 'vue';
import { getJsonBody } from './utils'

export function getConversations(id) {
    return new Promise((resolve, reject)=>{
        // TODO Issue with subscriber not having access to conversations
        // endpoint unless logged in to ngcp-panel as admin
        Vue.http.get('/api/conversations/?subscriber_id=' + id).then((result)=>{
            resolve(getJsonBody(result.body));
        }).catch((err)=>{
            reject(err);
        });
    });
}
