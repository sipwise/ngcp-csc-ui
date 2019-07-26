
import _ from 'lodash';
import {
    addPreference,
    addPreferenceFull,
    getAllPreferences,
    getSubscriber,
} from "./subscriber";

export function getMsConfigs() {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
           return getAllPreferences({
               all: true
           });
        }).then((preferencesList)=>{
            resolve({
                items: _.get(preferencesList, 'items', []).filter((preferences)=>{
                    return _.get(preferences, 'manager_secretary', false)
                })
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getMsConfigList() {
    return new Promise((resolve, reject)=>{
        let msConfigs = [];
        Promise.resolve().then(()=>{
            return getMsConfigs();
        }).then(($msConfigs)=>{
            msConfigs = $msConfigs;
            let subscriberPromises = [];
            msConfigs.items.forEach((msConfig)=>{
                subscriberPromises.push(getSubscriber(msConfig.id));
            });
            return Promise.all(subscriberPromises);
        }).then((subscribers)=>{
            resolve({
                subscribers: {
                    items: subscribers
                },
                msConfigs: msConfigs
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function createMsConfig(options) {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
            return Promise.all([
                addPreference(options.subscriberId, 'manager_secretary', true),
                addPreference(options.subscriberId, 'secretary_numbers', options.secretaryNumbers)
            ]);
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function removeMsConfig(subscriberId) {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
            return Promise.all([
                addPreference(subscriberId, 'manager_secretary', false),
                addPreference(subscriberId, 'secretary_numbers', [])
            ]);
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function setSecretaryNumber(options) {
    return new Promise((resolve, reject)=>{
        let numbers = _.get(options, 'secretaryNumbers', []);
        Promise.resolve().then(()=>{
            return addPreferenceFull(options.msConfigId, 'secretary_numbers', numbers);
        }).then((prefs)=>{
            resolve(prefs);
        }).catch((err)=>{
            reject(err);
        });
    });
}

