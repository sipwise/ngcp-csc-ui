
import Vue from 'vue';

export function getGroups(options) {
    return new Promise((resolve, reject)=>{
        Vue.http.get('/api/subscribers', {
            params: {
                is_pbx_group: true
            }
        }).then((result)=>{
            var groups = [];
            var body = JSON.parse(result.body);
            if(_.isArray(body["_embedded"]["ngcp:subscribers"])) {
                body['_embedded']['ngcp:subscribers'].forEach((group)=>{
                    groups.push(group);
                });
            }
            resolve(groups);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function createGroup(options) {

}

export function saveGroup(options) {

}

export function getSeats() {

}

export function createSeat() {

}

export function saveSeat() {

}

export function getDevices() {

}

export function createDevice() {

}

export function saveDevice() {

}

