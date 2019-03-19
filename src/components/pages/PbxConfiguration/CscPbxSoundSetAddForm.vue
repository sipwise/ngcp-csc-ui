<template>
    <div class="csc-form csc-pbx-seat-add-form">
        <q-field :error-label="nameErrorMessage">
            <q-input
                dark
                @input="$v.data.name.$touch"
                @blur="$v.data.name.$touch"
                :error="$v.data.name.$error"
                :disabled="loading"
                :readonly="loading"
                v-model="data.name"
                autofocus
                :float-label="$t('pbxConfig.groupName')"
                clearable
            />
        </q-field>
        <q-field :error-label="descriptionErrorMessage">
            <q-input
                dark
                @input="$v.data.description.$touch"
                @blur="$v.data.description.$touch"
                :error="$v.data.description.$error"
                :disabled="loading"
                :readonly="loading"
                v-model="data.description"
                :float-label="$t('pbxConfig.description')"
                clearable
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
        QCard,
        QCardTitle,
        QCardMain,
        QCardActions,
        QCardSeparator,
        QBtn,
        QInnerLoading,
        QSpinnerMat,
        QField,
        QInput,
        QSelect,
        QIcon
    } from 'quasar-framework'

    export default {
        name: 'csc-pbx-sound-set-add-form',
        props: [
            'loading'
        ],
        components: {
            QCard,
            QCardTitle,
            QCardMain,
            QCardActions,
            QCardSeparator,
            QBtn,
            QInnerLoading,
            QSpinnerMat,
            QField,
            QInput,
            QSelect,
            QIcon
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
                data: this.getDefaults()
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
            }
        },
        methods: {
            getDefaults() {
                return {
                    name: '',
                    description: '',
                    default: false,
                    loadFiles: false
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
