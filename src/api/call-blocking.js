
import Vue from 'vue';
import { enableBlockIn, disableBlockIn,
    getPreferences, addToBlockInList, removeFromBlockInList } from './subscriber';

export function enableIncomingCallBlocking(id) {
    return enableBlockIn(id);
}

export function disableIncomingCallBlocking(id) {
    return disableBlockIn(id);
}

export function getIncomingCallBlocking(id) {
    return new Promise((resolve, reject)=>{
        getPreferences(id).then((result)=>{
            resolve({
                enabled: result.block_in_mode,
                list: result.block_in_list
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function addNumberToIncomingList(id, number) {
    return new Promise((resolve, reject)=>{
        if(_.isEmpty(number)) {
            reject(new Error('Number may not be empty'));
        } else {
            addToBlockInList(id, number).then(()=>{
                resolve();
            }).catch((err)=>{
                reject(err);
            });
        }
    });
}

export function removeNumberFromIncomingList(id, index) {
    return new Promise((resolve, reject)=>{
        removeFromBlockInList(id, index).then(()=>{
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}
