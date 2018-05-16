
import Vue from 'vue';

export function createFax(options, subscriberId) {
    return new Promise((resolve, reject) => {
        let headers = {
            'Content-Type': 'application/json',
        };
        let mergedParams = Object.assign(options, subscriberId);
        let payload = JSON.stringify(mergedParams);
        Vue.http.post('api/faxes/', payload, { headers: headers }).then(() => {
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}
