
import Vue from 'vue';

export function getGroups(options) {
    return new Promise((resolve, reject)=>{
        Promise.props({
            numbers: Vue.http.get('/api/numbers'),
            subscribers: Vue.http.get('/api/subscribers', {
                params: {
                    is_pbx_group: true
                }
            })
        }).then((result)=>{

        }).then(()=>{
            resolve();
        }).catch((err)=>{
            reject(err)
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

