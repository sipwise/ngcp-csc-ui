
import Vue from 'vue';
import { enableBlockIn, disableBlockIn,
    getPreferences, addToBlockInList } from './subscriber';

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
    return addToBlockInList(id, number);
}
