
//import _ from 'lodash'
import Vue from 'vue'
import { getJsonBody } from './utils'

export function getSpeedDials(id) {
    return new Promise((resolve, reject) => {
        Vue.http.get('api/speeddials/' + id).then((result) => {
            resolve(getJsonBody(result.body));
        }).catch((err)=>{
            reject(err);
        });
    });
}
