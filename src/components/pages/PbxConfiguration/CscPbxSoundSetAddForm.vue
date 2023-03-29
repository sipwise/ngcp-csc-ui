<template>
    <div>
        <q-input
            v-model="data.name"
            :error="$v.data.name.$error"
            :error-message="nameErrorMessage"
            :disable="loading"
            :readonly="loading"
            :label="$t('Name')"
            hide-bottom-space
            @input="$v.data.name.$touch"
        />
        <q-input
            v-model="data.description"
            :error="$v.data.description.$error"
            :error-message="descriptionErrorMessage"
            :disable="loading"
            :readonly="loading"
            :label="$t('Description')"
            hide-bottom-space
            @input="$v.data.description.$touch"
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
                @input="toggleLoadFiles"
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
                :disable="$v.data.$invalid || !data.language"
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
import {
    mapState
} from 'vuex'
import {
    required,
    maxLength
} from 'vuelidate/lib/validators'
import CscObjectSpinner from '../../CscObjectSpinner'

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
                }
            ]
        }
    },
    computed: {
        ...mapState('pbxSoundSets', [
            'soundSetList'
        ]),
        nameErrorMessage () {
            if (!this.$v.data.name.required) {
                return this.$t('{field} is required', {
                    field: this.$t('Name')
                })
            } else if (!this.$v.data.name.maxLength) {
                return this.$t('{field} must have at most {maxLength} letters', {
                    field: this.$t('Name'),
                    maxLength: this.$v.data.name.$params.maxLength.max
                })
            } else {
                return ''
            }
        },
        descriptionErrorMessage () {
            if (!this.$v.data.description.required) {
                return this.$t('{field} is required', {
                    field: this.$t('Description')
                })
            } else if (!this.$v.data.description.maxLength) {
                return this.$t('{field} must have at most {maxLength} letters', {
                    field: this.$t('Description'),
                    maxLength: this.$v.data.description.$params.maxLength.max
                })
            } else {
                return ''
            }
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
            let parentOptions = [
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
            this.$v.$reset()
        },
        toggleLoadFiles () {
            this.data.language = 'en'
            this.data.loopplay = false
        }
    }
}
</script>
