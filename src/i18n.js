
import _ from 'lodash'
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import localeEn from './locales/en'
import localeFr from './locales/fr'
import localeIt from './locales/it'
import localeEs from './locales/es'
import {
    SessionStorage
} from 'quasar-framework'

Vue.use(VueI18n);

export const defaultLocale = 'en-US';

if(!SessionStorage.has('locale')) {
    SessionStorage.set('locale', navigator.language);
}

export const i18n = new VueI18n({
    locale: SessionStorage.get.item('locale'),
    fallbackLocale: defaultLocale,
    messages: {
        'en-US': localeEn,
        'fr': localeFr,
        'it': localeIt,
        'es': localeEs
    }
});

export function getLanguageLabels() {
    let languageLabels = [];
    Object.keys(i18n.messages).forEach((locale)=>{
        languageLabels.push([locale, i18n.messages[locale].languageLabel]);
    });
    return languageLabels;
}

export function getLanguageLabel(locale) {
    if(_.has(i18n.messages, locale)) {
        return i18n.messages[locale].languageLabel;
    }
    else {
        return i18n.messages[defaultLocale].languageLabel;
    }
}

