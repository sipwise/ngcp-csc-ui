
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import localeEn from './locales/en'

Vue.use(VueI18n);

export const locales = {
    en: localeEn
};

export const i18n = new VueI18n({
    locale: localStorage.getItem('lang') || navigator.language || navigator.userLanguage,
    fallbackLocale: 'en',
    messages: locales
});

