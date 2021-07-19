<template>
    <q-btn
        icon="language"
        :color="iconColor"
        round
        small
        flat
    >
        <q-menu>
            <q-item
                v-close-popup
            >
                <q-item-section
                    class="text-weight-medium"
                >
                    {{ languageLabel }}
                </q-item-section>
            </q-item>
            <q-separator />
            <q-item
                v-for="(language, index) in options"
                :key="index"
                v-close-popup
                clickable
                @click="changeLanguage(language.value)"
            >
                <q-item-section>{{ language.label }}</q-item-section>
            </q-item>
        </q-menu>
    </q-btn>
</template>

<script>
import _ from 'lodash'
import { i18n } from 'boot/i18n'
import { getLanguageLabels, setLanguage } from 'src/i18n'
export default {
    name: 'CscSelectionLanguage',
    props: {
        iconColor: {
            type: String,
            default: 'primary'
        }
    },
    computed: {
        languageLabel () {
            const lang = _.first(this.options.filter(item => item.value === i18n.locale))
            return this.$t('Language') + ' (' + lang.label + ')'
        },
        options () {
            return getLanguageLabels()
        }
    },
    methods: {
        changeLanguage (lang) {
            setLanguage(lang)
        }
    }
}
</script>
