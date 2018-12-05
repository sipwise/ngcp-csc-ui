<template>
    <div class="csc-form csc-pbx-seat-add-form">
        <q-field :error-label="seatNameErrorMessage">
            <q-input
                @input="$v.data.name.$touch"
                @blur="$v.data.name.$touch"
                :error="$v.data.name.$error"
                :disabled="loading"
                :readonly="loading"
                v-model="data.name"
                autofocus
                :float-label="$t('pbxConfig.name')"
                clearable
            />
        </q-field>
        <q-field :error-label="extensionErrorMessage">
            <q-input
                @input="$v.data.extension.$touch"
                @blur="$v.data.extension.$touch"
                :error="$v.data.extension.$error"
                :disabled="loading"
                :readonly="loading"
                v-model="data.extension"
                :float-label="$t('pbxConfig.extension')"
                clearable
            />
        </q-field>
        <q-field>
            <q-select
                :disabled="loading"
                :readonly="loading"
                v-model="data.aliasNumbers"
                multiple
                chips
                clearable
                :float-label="$t('pbxConfig.aliasNumbers')"
                :options="aliasNumberOptions"
            />
        </q-field>
        <q-field>
            <q-select
                :disabled="loading"
                :readonly="loading"
                v-model="data.groups"
                multiple
                chips
                clearable
                :float-label="$t('pbxConfig.groups')"
                :options="groupOptions"
            />
        </q-field>
        <div class="csc-form-actions row justify-center">
            <q-btn
                v-if="!loading"
                flat
                color="secondary"
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
                icon="person"
                @click="save()"
            >
                {{ $t('pbxConfig.createSeat') }}
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
        maxLength,
        numeric
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
        name: 'csc-pbx-seat-add-form',
        props: [
            'aliasNumberOptions',
            'groupOptions',
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
                extension: {
                    required,
                    numeric,
                    maxLength: maxLength(64)
                }
            }
        },
        data () {
            return {
                data: this.getDefaults()
            }
        },
        computed: {
            seatNameErrorMessage() {
                if (!this.$v.data.name.required) {
                    return this.$t('validationErrors.fieldRequired', {
                        field: this.$t('pbxConfig.seatName')
                    });
                }
                else if (!this.$v.data.name.maxLength) {
                    return this.$t('validationErrors.maxLength', {
                        field: this.$t('pbxConfig.seatName'),
                        maxLength: this.$v.data.name.$params.maxLength.max
                    });
                }
            },
            extensionErrorMessage() {
                if (!this.$v.data.extension.required) {
                    return this.$t('validationErrors.fieldRequired', {
                        field: this.$t('pbxConfig.extension')
                    });
                }
                else if (!this.$v.data.extension.maxLength) {
                    return this.$t('validationErrors.maxLength', {
                        field: this.$t('pbxConfig.extension'),
                        maxLength: this.$v.data.extension.$params.maxLength.max
                    });
                }
                else if (!this.$v.data.extension.numeric) {
                    return this.$t('validationErrors.alphaNum', {
                        field: this.$t('pbxConfig.extension'),
                    });
                }
            }
        },
        methods: {
            getDefaults() {
                return {
                    name: '',
                    extension: '',
                    aliasNumbers: [],
                    groups: []
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
    @import '../../../themes/app.common.styl';
</style>
