
import _ from 'lodash';

import { enableBlockIn, disableBlockIn,
    getPreferences, addToBlockInList,
    editBlockInList, removeFromBlockInList,
    enableBlockOut, disableBlockOut,
    addToBlockOutList, editBlockOutList,
    removeFromBlockOutList,
    enablePrivacy, disablePrivacy
} from './subscriber';

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
        }
        else {
            addToBlockInList(id, number).then(()=>{
                resolve();
            }).catch((err)=>{
                reject(err);
            });
        }
    });
}

export function editNumberFromIncomingList(id, index, number) {
    return new Promise((resolve, reject)=>{
        editBlockInList(id, index, number).then(()=>{
            resolve();
        }).catch((err)=>{
            reject(err);
        });
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

export function enableOutgoingCallBlocking(id) {
    return enableBlockOut(id);
}

export function disableOutgoingCallBlocking(id) {
    return disableBlockOut(id);
}

export function getOutgoingCallBlocking(id) {
    return new Promise((resolve, reject)=>{
        getPreferences(id).then((result)=>{
            resolve({
                enabled: result.block_out_mode,
                list: result.block_out_list
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function addNumberToOutgoingList(id, number) {
    return new Promise((resolve, reject)=>{
        if(_.isEmpty(number)) {
            reject(new Error('Number may not be empty'));
        }
        else {
            addToBlockOutList(id, number).then(()=>{
                resolve();
            }).catch((err)=>{
                reject(err);
            });
        }
    });
}

export function editNumberFromOutgoingList(id, index, number) {
    return new Promise((resolve, reject)=>{
        editBlockOutList(id, index, number).then(()=>{
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function removeNumberFromOutgoingList(id, index) {
    return new Promise((resolve, reject)=>{
        removeFromBlockOutList(id, index).then(()=>{
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function enablePrivacyCallBlocking(id) {
    return enablePrivacy(id);
}

export function disablePrivacyCallBlocking(id) {
    return disablePrivacy(id);
}

export function getPrivacyCallBlocking(id) {
    return new Promise((resolve, reject)=>{
        getPreferences(id).then((result)=>{
            resolve({
                enabled: result.clir
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}
