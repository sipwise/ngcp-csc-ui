
import Vue from 'vue';
import { enableBlockIn, disableBlockIn, getPreferences } from './subscriber';

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
                enabled: result.block_in_mode
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}
