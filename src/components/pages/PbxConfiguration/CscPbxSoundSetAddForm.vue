<template>
    <div
        class="csc-form csc-pbx-sound-set-add-form"
    >
        <q-field
            :error-label="nameErrorMessage"
        >
            <q-input
                dark
                v-model="data.name"
                :error="$v.data.name.$error"
                :disable="loading"
                :readonly="loading"
                :float-label="$t('pbxConfig.name')"
                @input="$v.data.name.$touch"
            />
        </q-field>
        <q-field
            :error-label="descriptionErrorMessage"
        >
            <q-input
                dark
                v-model="data.description"
                :error="$v.data.description.$error"
                :disable="loading"
                :readonly="loading"
                :float-label="$t('pbxConfig.description')"
                @input="$v.data.description.$touch"
            />
        </q-field>
        <q-field
        >
            <q-checkbox
                v-model="data.contract_default"
                :disable="loading"
                :label="$t('pbxConfig.soundSetUseAsDefault')"
            />
        </q-field>
        <q-field
        >
            <q-checkbox
                v-model="data.copy_from_default"
                :disable="loading"
                :label="$t('pbxConfig.soundSetUseLanguagePreset')"
                @input="toggleLoadFiles"
            />
        </q-field>
        <q-field
            v-if="data.copy_from_default"
        >
            <div
                class="row items-baseline md-gutter no-vert-gutter"
            >
                <div
                    class="column inline col-6"
                >
                    <q-select
                        dark
                        radio
                        v-model="data.language"
                        :disable="loading || !data.copy_from_default"
                        :readonly="loading"
                        :float-label="$t('pbxConfig.language')"
                        :options="languageOptions"
                    />
                </div>
                <div
                    class="column inline col-grow"
                >

                    <q-checkbox
                        class="col-auto"
                        v-model="data.loopplay"
                        :disable="loading || !data.copy_from_default"
                        :label="$t('pbxConfig.soundSetPlayAllLoop')"
                    />
                </div>
            </div>
        </q-field>
        <div
            class="csc-form-actions row justify-center">
            <q-btn
                flat
                v-if="!loading"
                color="default"
                icon="clear"
                @click="cancel()"
            >
                {{ $t('buttons.cancel') }}
            </q-btn>
            <q-btn
                flat
                v-if="!loading"
                color="primary"
                icon="queue_music"
                :disable="$v.data.$invalid || !data.language"
                @click="save()"
            >
                {{ $t('pbxConfig.createSoundSet') }}
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
        required,
        maxLength
    } from 'vuelidate/lib/validators'
    import {
        QBtn,
        QInnerLoading,
        QSpinnerDots,
        QField,
        QInput,
        QSelect,
        QIcon,
        QToggle,
        QCheckbox
    } from 'quasar-framework'
    import CscObjectSpinner from "../../CscObjectSpinner";
    export default {
        name: 'csc-pbx-sound-set-add-form',
        props: [
            'loading'
        ],
        components: {
            CscObjectSpinner,
            QBtn,
            QInnerLoading,
            QSpinnerDots,
            QField,
            QInput,
            QSelect,
            QIcon,
            QToggle,
            QCheckbox
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
                        value: 'ru',
                        label: 'Russian'
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
            nameErrorMessage() {
                if (!this.$v.data.name.required) {
                    return this.$t('validationErrors.fieldRequired', {
                        field: this.$t('pbxConfig.name')
                    });
                }
                else if (!this.$v.data.name.maxLength) {
                    return this.$t('validationErrors.maxLength', {
                        field: this.$t('pbxConfig.name'),
                        maxLength: this.$v.data.name.$params.maxLength.max
                    });
                }
            },
            descriptionErrorMessage() {
                if (!this.$v.data.description.required) {
                    return this.$t('validationErrors.fieldRequired', {
                        field: this.$t('pbxConfig.description')
                    });
                }
                else if (!this.$v.data.description.maxLength) {
                    return this.$t('validationErrors.maxLength', {
                        field: this.$t('pbxConfig.description'),
                        maxLength: this.$v.data.description.$params.maxLength.max
                    });
                }
            },
            contractDefaultClasses() {
                let classes = [];
                if (this.contract_default) {
                    classes.push('csc-toggle-enabled');
                }
                else {
                    classes.push('csc-toggle-disabled');
                }
                return classes;
            },
            loadFilesClasses() {
                let classes = [];
                if (this.copy_from_default) {
                    classes.push('csc-toggle-enabled');
                }
                else {
                    classes.push('csc-toggle-disabled');
                }
                return classes;
            },
            loopplayClasses() {
                let classes = [];
                if (this.loopplay) {
                    classes.push('csc-toggle-enabled');
                }
                else {
                    classes.push('csc-toggle-disabled');
                }
                return classes;
            }
        },
        methods: {
            getDefaults() {
                return {
                    name: '',
                    loopplay: false,
                    replace_existing: false,
                    language: 'en',
                    contract_default: false,
                    copy_from_default: false,
                    description: ''
                }
            },
            cancel() {
                this.$emit('cancel');
            },
            save() {
                this.$emit('save', this.data);
            },
            reset() {
                this.data = this.getDefaults();
                this.$v.$reset();
            },
            toggleLoadFiles() {
                this.data.language = 'en';
                this.data.loopplay = false;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>
