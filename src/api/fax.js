import { i18n } from 'boot/i18n'
import _ from 'lodash'
import {
    get,
    patchReplaceFull
} from 'src/api/common'

export async function getFaxServerSettings (subscriberId) {
    const result = await get({
        path: `api/faxserversettings/${subscriberId}`
    })
    const settings = _.clone(result)
    delete settings._links
    return settings
}

export async function setFaxServerField (options) {
    if (!['name', 'active', 'ecm', 't38', 'destinations'].includes(options.field)) {
        throw Error(`setFaxServerField: unknown field name ${options.field}`)
    }
    if (options.field === 'destinations') {
        // searching for duplicates
        const destinationsIds = options.value.map((d) => d.destination)
        if ((new Set(destinationsIds)).size !== destinationsIds.length) {
            throw Error(i18n.global.tc('The Destination Email is already used'))
        }
    }
    return patchReplaceFull({
        path: `api/faxserversettings/${options.subscriberId}`,
        fieldPath: options.field,
        value: options.value
    })
}

export async function getMailToFaxSettings (subscriberId) {
    const result = await get({
        path: `api/mailtofaxsettings/${subscriberId}`
    })
    const settings = _.clone(result)
    delete settings._links
    return settings
}

export async function setMailToFaxSettingField (options) {
    if (!['active', 'secret_key', 'secret_key_renew', 'secret_renew_notify', 'acl'].includes(options.field)) {
        throw Error(`setMailToFaxSettingField: unknown field name ${options.field}`)
    }
    if (options.field === 'secret_renew_notify') {
        // searching for duplicates
        const destinationsIds = options.value.map((d) => d.destination)
        if ((new Set(destinationsIds)).size !== destinationsIds.length) {
            throw Error(i18n.global.tc('The Notify Email is already used'))
        }
    }
    return patchReplaceFull({
        path: `api/mailtofaxsettings/${options.subscriberId}`,
        fieldPath: options.field,
        value: options.value
    })
}
