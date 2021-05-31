import _ from 'lodash'
import localeEn from './en.json'
import localeFr from './fr.json'
import localeIt from './it.json'
import localeEs from './es.json'
import localeDe from './de.json'
import localeRu from './ru.json'
import { i18n } from 'src/boot/i18n'

export const defaultLocale = 'en-US'

export const messages = {
    'en-US': patchKeysForFallback(localeEn),
    fr: patchKeysForFallback(localeFr),
    it: patchKeysForFallback(localeIt),
    es: patchKeysForFallback(localeEs),
    de: patchKeysForFallback(localeDe),
    ru: patchKeysForFallback(localeRu)
}

export function getLanguageLabels () {
    const languageLabels = []
    Object.keys(messages).forEach((locale) => {
        languageLabels.push([locale, messages[locale].English])
    })
    return languageLabels
}

export function getLanguageLabel (locale) {
    if (_.has(messages, locale)) {
        return messages[locale].English
    } else {
        return messages[defaultLocale].English
    }
}

function patchKeysForFallback (messages = {}) {
    // Note: not translated keys may be defined as keys with empty string value. We should delete or replace such keys
    // with null or undefined value to allow VueI18n language fallback mechanism works properly
    Object.entries(messages).forEach(([key, value]) => {
        if (typeof value === 'string' && value.trim() === '') {
            messages[key] = undefined
        }
    })
    return messages
}

/**
 * It converts language code from V2 (new CSC) to V1 UI (old Panel CSC) format
 * @param {string} lang
 * @returns {string}
 */
export function convertLangV2toV1 (lang) {
    return lang === 'en-US' ? 'en' : lang
}

/**
 * It converts language code from V1 (old Panel CSC) to V2 UI (new CSC) format
 * @param {string} lang
 * @returns {string}
 */
export function convertLangV1toV2 (lang) {
    return ['en', 'i-default'].includes(lang) ? 'en-US' : lang
}

export function getCurrentLangAsV1Format () {
    return convertLangV2toV1(i18n.locale)
}
