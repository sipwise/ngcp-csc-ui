<template>
    <q-item>
        <q-item-section>
            <q-select
                :model-value="value"
                emit-value
                map-options
                :disable="disabled || loading"
                :readonly="disabled || loading"
                :label="$t('Language for voicemail and app server')"
                data-cy="voicebox-change-language"
                :title="$t('Voice prompts language for voicemail, conference and application server')"
                :options="languageOptions"
                @update:model-value="$emit('input', $event)"
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
    name: 'CscVoiceboxLanguage',
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
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    emits: ['input']
}
</script>
