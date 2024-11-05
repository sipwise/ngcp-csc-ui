<template>
    <div>
        <q-input
            v-model="data.name"
            :error="v$.data.name.$errors.length > 0"
            :error-message="nameErrorMessage"
            :disable="loading"
            :readonly="loading"
            :label="$t('Name')"
            hide-bottom-space
            @update:model-value="v$.data.name.$touch()"
        />
        <q-input
            v-model="data.description"
            :error="v$.data.description.$errors.length > 0"
            :error-message="descriptionErrorMessage"
            :disable="loading"
            :readonly="loading"
            :label="$t('Description')"
            hide-bottom-space
            @update:model-value="v$.data.description.$touch()"
        />
        <q-select
            v-model="data.parent_id"
            emit-value
            map-options
            :disable="loading"
            :readonly="loading"
            :options="getParentOptions"
            :label="$t('Parent')"
        />
        <div
            class="q-mb-sm q-mt-sm"
        >
            <q-checkbox
                v-model="data.contract_default"
                :disable="loading"
                :label="$t('Use as default for all seats and groups')"
            />
        </div>
        <div>
            <q-checkbox
                v-model="data.copy_from_default"
                :disable="loading"
                :label="$t('Use language specific preset')"
                @update:model-value="toggleLoadFiles"
            />
        </div>
        <q-select
            v-if="data.copy_from_default"
            v-model="data.language"
            emit-value
            map-options
            radio
            :disable="loading || !data.copy_from_default"
            :readonly="loading"
            :label="$t('Language')"
            :options="languageOptions"
        />
        <div
            v-if="data.copy_from_default"
            class="q-mb-sm q-mt-sm"
        >
            <q-checkbox
                v-model="data.loopplay"
                class="col-auto"
                :disable="loading || !data.copy_from_default"
                :label="$t('Play all files in loop')"
            />
        </div>
        <div
            class="csc-form-actions row justify-center"
        >
            <q-btn
                v-if="!loading"
                flat
                color="default"
                icon="clear"
                @click="cancel()"
            >
                {{ $t('Cancel') }}
            </q-btn>
            <q-btn
                v-if="!loading"
                flat
                color="primary"
                icon="queue_music"
                :disable="v$.data.$invalid || !data.language"
                @click="save()"
            >
                {{ $t('Create sound set') }}
            </q-btn>
        </div>
        <csc-object-spinner
            v-if="loading"
            :loading="loading"
        />
    </div>
</template>

<script>
import useValidate from '@vuelidate/core'
import {
    maxLength,
    required
} from '@vuelidate/validators'
import CscObjectSpinner from 'components/CscObjectSpinner'
import { mapState } from 'vuex'

export default {
    name: 'CscPbxSoundSetAddForm',
    components: {
        CscObjectSpinner
    },
    props: {
        loading: {
            type: Boolean,
            default: false
        }
    },
    emits: ['save', 'cancel'],
    validations: {
        data: {
            name: {
                required,
                maxLength: maxLength(64)
            },
            description: {
                required,
                maxLength: maxLength(255)
            }
        }
    },
    data () {
        return {
            data: this.getDefaults(),
            languageOptions: [
                {
                    value: 'en',
                    label: 'English'
                },
                {
                    value: 'es',
                    label: 'Spanish'
                },
                {
                    value: 'it',
                    label: 'Italian'
                },
                {
                    value: 'ro',
                    label: 'Romanian'
                },
                {
                    value: 'de',
                    label: 'German'
                },
                {
                    value: 'fr',
                    label: 'French'
                },
                {
                    value: 'ar',
                    label: 'Arabic'
                },
                {
                    value: 'nl',
                    label: 'Dutch'
                },
                {
                    value: 'he',
                    label: 'Hebrew'
                },
                {
                    value: 'pt_br',
                    label: 'Brazialian'
                }
            ],
            v$: useValidate()
        }
    },
    computed: {
        ...mapState('pbxSoundSets', [
            'soundSetList'
        ]),
        nameErrorMessage () {
            const errorsTab = this.v$.data.name.$errors
            if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'required') {
                return this.$t('{field} is required', {
                    field: this.$t('Name')
                })
            } else if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'maxLength') {
                return this.$t('{field} must have at most {maxLength} letters', {
                    field: this.$t('Name'),
                    maxLength: this.v$.data.name.maxLength.$params.max
                })
            }
            return ''
        },
        descriptionErrorMessage () {
            const errorsTab = this.v$.data.description.$errors
            if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'required') {
                return this.$t('{field} is required', {
                    field: this.$t('Description')
                })
            } else if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'maxLength') {
                return this.$t('{field} must have at most {maxLength} letters', {
                    field: this.$t('Description'),
                    maxLength: this.v$.data.description.maxLength.$params.max
                })
            }
            return ''
        },
        contractDefaultClasses () {
            const classes = []
            if (this.contract_default) {
                classes.push('csc-toggle-enabled')
            } else {
                classes.push('csc-toggle-disabled')
            }
            return classes
        },
        loadFilesClasses () {
            const classes = []
            if (this.copy_from_default) {
                classes.push('csc-toggle-enabled')
            } else {
                classes.push('csc-toggle-disabled')
            }
            return classes
        },
        loopplayClasses () {
            const classes = []
            if (this.loopplay) {
                classes.push('csc-toggle-enabled')
            } else {
                classes.push('csc-toggle-disabled')
            }
            return classes
        },
        getParentOptions () {
            const parentOptions = [
                {
                    label: this.$t('Unassigned'),
                    value: null
                }
            ]
            this.soundSetList.map((soundSet) => {
                parentOptions.push({
                    label: soundSet.name,
                    value: soundSet.id
                })
                return soundSet
            })
            return parentOptions
        }
    },
    methods: {
        getDefaults () {
            return {
                name: '',
                loopplay: false,
                replace_existing: false,
                language: 'en',
                contract_default: false,
                copy_from_default: false,
                description: '',
                parent_id: null
            }
        },
        cancel () {
            this.$emit('cancel')
        },
        save () {
            this.$emit('save', this.data)
        },
        reset () {
            this.data = this.getDefaults()
            this.v$.$reset()
        },
        toggleLoadFiles () {
            this.data.language = 'en'
            this.data.loopplay = false
        }
    }
}
</script>
