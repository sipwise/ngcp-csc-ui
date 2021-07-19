<template>
    <q-list
        no-border
    >
        <q-expansion-item
            ref="languageCollapsible"
            v-model="expanded"
            :label="languageLabel"
        >
            <q-list
                no-border
            >
                <q-item
                    v-for="(language, index) in options"
                    :key="index"
                    v-close-popup
                    clickable
                    @click="changeLanguage(language.value)"
                >
                    <q-item-section>
                        <q-item-label>{{ language.label }}</q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
        </q-expansion-item>
    </q-list>
</template>

<script>
import _ from 'lodash'
import { i18n } from 'boot/i18n'
import { getLanguageLabels, setLanguage } from 'src/i18n'

export default {
    // TODO: this component has some duplicated code with "CscSelectionLanguage" component. Please recheck do we still need to have a separate UI for Mobile users
    name: 'CscSelectionLanguageMobile',
    data () {
        return {
            expanded: false
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
