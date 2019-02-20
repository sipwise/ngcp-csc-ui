
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import localeEn from './locales/en'
import localeFr from './locales/fr'
import { SessionStorage } from 'quasar-framework'

Vue.use(VueI18n);

export const locales = {
    en: localeEn,
    fr: localeFr
};

export const i18n = new VueI18n({
    locale: SessionStorage.get.item('locale') || navigator.language || navigator.userLanguage,
    fallbackLocale: 'en',
    messages: locales
});

