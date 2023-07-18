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
import { setLanguage } from 'src/i18n'
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
            const lang = _.first(this.options.filter(item => item.value === i18n.global.locale))
            return this.$t('Language') + ' (' + lang.label + ')'
        },
        options () {
            return [
                {
                    value: 'en-US',
                    label: this.$t('English', 'en-US')
                },
                {
                    value: 'de',
                    label: this.$t('German', 'de')
                },
                {
                    value: 'es',
                    label: this.$t('Spanish', 'es')
                },
                {
                    value: 'fr',
                    label: this.$t('French', 'fr')
                },
                {
                    value: 'it',
                    label: this.$t('Italian', 'it')
                }
            ]
        }
    },
    methods: {
        async changeLanguage (lang) {
            await setLanguage(lang)
        }
    }
}
</script>
