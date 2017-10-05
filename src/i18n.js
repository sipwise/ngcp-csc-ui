

import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n);

export const locales = {
    en: require('./locales/en')
};

export const i18n = new VueI18n({
    locale: localStorage.getItem('lang') || navigator.language || navigator.userLanguage,
    fallbackLocale: 'en',
    messages: locales
});

