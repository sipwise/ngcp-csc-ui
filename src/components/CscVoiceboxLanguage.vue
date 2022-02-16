<template>
    <q-item>
        <q-item-section>
            <q-select
                v-model="selectedLanguage"
                emit-value
                map-options
                :disable="loading"
                :readonly="loading"
                :label="$t('Language for voicemail and app server')"
                :title="$t('Voice prompts language for voicemail, conference and application server')"
                :options="languageOptions"
                v-on="$listeners"
            >
                <template
                    #prepend
                >
                    <q-icon
                        name="language"
                    />
                </template>
                <template
                    #append
                >
                    <csc-spinner
                        v-if="loading"
                        class="self-center"
                    />
                </template>
            </q-select>
        </q-item-section>
    </q-item>
</template>

<script>
import CscSpinner from 'components/CscSpinner'
export default {
    components: { CscSpinner },
    props: {
        defaultLanguageOption: {
            type: Object,
            default: null
        },
        languageOptions: {
            type: Array,
            default: null
        },
        value: {
            type: String,
            default: null
        },
        loading: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            selectedLanguage: null
        }
    },
    watch: {
        value (newLanguage) {
            if (this.defaultLanguageOption && newLanguage === undefined) {
                this.selectedLanguage = this.defaultLanguageOption.value
            } else {
                this.selectedLanguage = newLanguage
            }
        }
    }
}
</script>
