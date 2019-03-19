<template>
    <div class="csc-form csc-pbx-seat-add-form">
        <q-field
            :error-label="nameErrorMessage"
            class="csc-form-field"
        >
            <q-input
                dark
                @input="$v.data.name.$touch"
                @blur="$v.data.name.$touch"
                :error="$v.data.name.$error"
                :disable="loading"
                :readonly="loading"
                v-model="data.name"
                autofocus
                :float-label="$t('pbxConfig.name')"
                clearable
            />
        </q-field>
        <q-field
            :error-label="descriptionErrorMessage"
            class="csc-form-field"
        >
            <q-input
                dark
                @input="$v.data.description.$touch"
                @blur="$v.data.description.$touch"
                :error="$v.data.description.$error"
                :disable="loading"
                :readonly="loading"
                v-model="data.description"
                :float-label="$t('pbxConfig.description')"
                clearable
            />
        </q-field>
        <q-field
            class="csc-form-field"
        >
            <q-toggle
                :class="contractDefaultClasses"
                :disable="loading"
                :label="$t('pbxConfig.defaultForSubscribers')"
                v-model="data.contract_default"
                @input="toggleContractDefault"
                checked-icon="check_circle"
                unchecked-icon="check_circle"
            />
        </q-field>
        <q-field
            class="csc-form-field"
        >
            <q-toggle
                :class="loadFilesClasses"
                :disable="loading"
                :label="$t('pbxConfig.loadFiles')"
                v-model="data.copy_from_default"
                @input="toggleLoadFiles"
                checked-icon="move_to_inbox"
                unchecked-icon="move_to_inbox"
            />
        </q-field>
        <q-field
            class="csc-form-field"
        >
            <q-toggle
                :class="loopplayClasses"
                :disable="loading || !data.copy_from_default"
                :label="$t('pbxConfig.playingInLoop')"
                v-model="data.loopplay"
                @input="toggleLoopplay"
                checked-icon="loop"
                unchecked-icon="loop"
            />
        </q-field>
        <q-field
            class="csc-form-field"
        >
            <q-select
                dark
                chips
                clearable
                :disabled="loading || !data.copy_from_default"
                :readonly="loading"
                v-model="data.language"
                :float-label="$t('pbxConfig.language')"
                :options="languageOptions"
            />
        </q-field>
        <div class="csc-form-actions row justify-center">
            <q-btn
                v-if="!loading"
                flat
                color="default"
                icon="clear"
                @mousedown.native="cancel()"
            >
                {{ $t('buttons.cancel') }}
            </q-btn>
            <q-btn
                v-if="!loading"
                :disabled="$v.data.$invalid"
                flat
                color="primary"
                icon="group"
                @click="save()"
            >
                {{ $t('pbxConfig.createSoundSet') }}
            </q-btn>
        </div>
        <q-inner-loading :visible="loading">
            <q-spinner-mat size="60px" color="primary" />
        </q-inner-loading>
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
        QSpinnerMat,
        QField,
        QInput,
        QSelect,
        QIcon,
        QToggle
    } from 'quasar-framework'

    export default {
        name: 'csc-pbx-sound-set-add-form',
        props: [
            'loading'
        ],
        components: {
            QBtn,
            QInnerLoading,
            QSpinnerMat,
            QField,
            QInput,
            QSelect,
            QIcon,
            QToggle
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
                if(this.contract_default) {
                    classes.push('csc-toggle-enabled');
                }
                else {
                    classes.push('csc-toggle-disabled');
                }
                return classes;
            },
            loadFilesClasses() {
                let classes = [];
                if(this.copy_from_default) {
                    classes.push('csc-toggle-enabled');
                }
                else {
                    classes.push('csc-toggle-disabled');
                }
                return classes;
            },
            loopplayClasses() {
                let classes = [];
                if(this.loopplay) {
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
                    language: 'en', // [ en, es, ru, it, ro, de ]
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
            toggleContractDefault() {
                console.log('toggleContractDefault()', this.data);
            },
            toggleLoadFiles() {
                console.log('toggleLoadFiles()', this.data);
                this.data.language = 'en';
                this.data.loopplay = false;
            },
            toggleLoopplay() {
                console.log('toggleLoopplay()', this.data);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
    .csc-pbx-group-add-form
        position: relative
    .csc-pbx-group-add-form
        .q-field:last-child
            margin-bottom: 36px
</style>
