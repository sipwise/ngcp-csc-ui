
import Vue from 'vue';

export function createFax(options, subscriberId) {
    let headers = {
        'Content-Type': 'application/json',
    };
    let mergedParams = Object.assign(options, subscriberId);
    let payload = JSON.stringify(mergedParams);
    return new Promise((resolve, reject) => {
        Vue.http.post('/api/faxes/', payload, { headers: headers }).then(() => {
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}
