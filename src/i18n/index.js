import localeEn from './en.json'
import localeFr from './fr.json'
import localeIt from './it.json'
import localeEs from './es.json'
import localeDe from './de.json'
import localeRu from './ru.json'
import { i18n } from 'src/boot/i18n'
import { setSession } from 'src/storage'
import Quasar from 'quasar'

export const defaultLocale = 'en-US'

export const messages = {
    'en-US': patchKeysForFallback(localeEn),
    de: patchKeysForFallback(localeDe),
    es: patchKeysForFallback(localeEs),
    fr: patchKeysForFallback(localeFr),
    it: patchKeysForFallback(localeIt),
    ru: patchKeysForFallback(localeRu)
}

export function getLanguageLabels () {
    return [
        {
            value: 'en-US',
            label: i18n.t('English', 'en-US')
        },
        {
            value: 'de',
            label: i18n.t('German', 'de')
        },
        {
            value: 'es',
            label: i18n.t('Spanish', 'es')
        },
        {
            value: 'fr',
            label: i18n.t('French', 'fr')
        },
        {
            value: 'it',
            label: i18n.t('Italian', 'it')
        },
        {
            value: 'ru',
            label: i18n.t('Russian', 'ru')
        }
    ]
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

export function setLanguage (lang) {
    setSession('locale', lang)
    i18n.locale = lang

    const quasarLangCode = lang.toLowerCase()
    import(
        /* webpackInclude: /(en-us|de|es|fr|it|ru)\.js$/ */
        'quasar/lang/' + quasarLangCode
    ).then(lang => {
        Quasar.lang.set(lang.default)
    })

    // Note: please extend "reloadLanguageRelatedData" action in the store if you are using language related API endpoints
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

export function normalizeLocaleCode (locale) {
    const shortLangCode = String(locale || defaultLocale).substr(0, 2).toLowerCase()
    const langCodeInV2Format = (shortLangCode === 'en') ? 'en-US' : shortLangCode
    const langCode = Object.keys(messages).filter(l => l === langCodeInV2Format)[0]
    return langCode || defaultLocale
}

export function getLangFromBrowserDefaults () {
    const browserLanguage = navigator?.language
    return normalizeLocaleCode(browserLanguage)
}
