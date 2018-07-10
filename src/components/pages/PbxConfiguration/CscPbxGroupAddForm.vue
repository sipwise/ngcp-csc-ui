<template>
    <div class="csc-form csc-pbx-seat-add-form">
        <q-field :error-label="groupNameErrorMessage">
            <q-input
                @input="$v.data.name.$touch"
                :error="$v.data.name.$error"
                :disabled="loading"
                :readonly="loading"
                v-model="data.name"
                autofocus
                :float-label="$t('pbxConfig.groupName')"
                clearable
            />
        </q-field>
        <q-field :error-label="extensionErrorMessage">
            <q-input
                @input="$v.data.extension.$touch"
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
                v-model="data.huntPolicy"
                :float-label="$t('pbxConfig.huntPolicy')"
                :options="huntPolicyOptions"
                radio
            />
        </q-field>
        <q-field :error-label="huntTimeoutErrorMessage">
            <q-input
                @input="$v.data.huntTimeout.$touch"
                :error="$v.data.huntTimeout.$error"
                :disabled="loading"
                :readonly="loading"
                type="number"
                v-model="data.huntTimeout"
                clearable
                :float-label="$t('pbxConfig.huntTimeout')"
                suffix="seconds"
                :min="1"
                :max="3600"
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
                v-model="data.seats"
                multiple
                chips
                clearable
                :float-label="$t('pbxConfig.seats')"
                :options="seatOptions"
            />
        </q-field>
        <div class="csc-form-actions row justify-center">
            <q-btn
                v-if="!loading"
                flat
                color="secondary"
                icon="clear"
                @click="cancel()"
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
                {{ $t('buttons.save') }}
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
        minValue,
        maxValue,
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
        name: 'csc-pbx-group-add-form',
        props: [
            'huntPolicyOptions',
            'aliasNumberOptions',
            'seatOptions',
            'loading',
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
                    maxLength: maxLength(64),
                    numeric
                },
                huntTimeout: {
                    required,
                    minValue: minValue(1),
                    maxValue: maxValue(3600)
                }
            }
        },
        data () {
            return {
                data: this.getDefaults()
            }
        },
        computed: {
            groupNameErrorMessage() {
                if (!this.$v.data.name.required) {
                    return this.$t('pbxConfig.requiredGroupName');
                }
                else if (!this.$v.data.name.maxLength) {
                    return this.$t('pbxConfig.groupNameMaxLength', {
                        maxLength: this.$v.data.name.$params.maxLength.max
                    });
                }
            },
            extensionErrorMessage() {
                if (!this.$v.data.extension.required) {
                    return this.$t('pbxConfig.requiredExtension');
                }
                else if (!this.$v.data.name.maxLength) {
                    return this.$t('pbxConfig.extensionMaxLength', {
                        maxLength: this.$v.data.extension.$params.maxLength.max
                    });
                }
                else if (!this.$v.data.name.numeric) {
                    return this.$t('pbxConfig.extensionAlphaNum');
                }
            },
            huntTimeoutErrorMessage() {
                if (!this.$v.data.huntTimeout.required) {
                    return this.$t('pbxConfig.requiredHuntTimeout');
                }
                else if (!this.$v.data.huntTimeout.minValue) {
                    return this.$t('pbxConfig.huntTimeoutMinValue', {
                        minValue: this.$v.data.huntTimeout.$params.minValue.min
                    });
                }
                else if (!this.$v.data.huntTimeout.maxValue) {
                    return this.$t('pbxConfig.huntTimeoutMaxValue', {
                        maxValue: this.$v.data.huntTimeout.$params.maxValue.max
                    });
                }
            }
        },
        methods: {
            getDefaults() {
                return {
                    name: '',
                    extension: '',
                    huntPolicy: 'serial',
                    huntTimeout: 10,
                    aliasNumbers: [],
                    seats: []
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
