<template>
    <div
        class="csc-form csc-pbx-seat-add-form"
    >
        <q-field
            :error-label="groupNameErrorMessage"
        >
            <q-input
                dark
                clearable
                autofocus
                v-model="data.name"
                :error="$v.data.name.$error"
                :disable="loading"
                :readonly="loading"
                :float-label="$t('pbxConfig.groupName')"
                @input="$v.data.name.$touch"
            />
        </q-field>
        <q-field
            :error-label="extensionErrorMessage"
        >
            <q-input
                dark
                clearable
                v-model="data.extension"
                :error="$v.data.extension.$error"
                :disable="loading"
                :readonly="loading"
                :float-label="$t('pbxConfig.extension')"
                @input="$v.data.extension.$touch"
            />
        </q-field>
        <q-field>
            <q-select
                dark
                radio
                v-model="data.huntPolicy"
                :disable="loading"
                :readonly="loading"
                :float-label="$t('pbxConfig.huntPolicy')"
                :options="huntPolicyOptions"
            />
        </q-field>
        <q-field
            :error-label="huntTimeoutErrorMessage"
        >
            <q-input
                dark
                clearable
                v-model="data.huntTimeout"
                :error="$v.data.huntTimeout.$error"
                :disable="loading"
                :readonly="loading"
                :float-label="$t('pbxConfig.huntTimeout')"
                :suffix="$t('pbxConfig.seconds')"
                :min="1"
                :max="3600"
                @input="$v.data.huntTimeout.$touch"
            />
        </q-field>
        <q-field>
            <q-select
                dark
                multiple
                chips
                clearable
                v-model="data.aliasNumbers"
                :disable="loading"
                :readonly="loading"
                :float-label="$t('pbxConfig.aliasNumbers')"
                :options="aliasNumberOptions"
            />
        </q-field>
        <q-field>
            <q-select
                dark
                multiple
                chips
                clearable
                v-model="data.seats"
                :disable="loading"
                :readonly="loading"
                :float-label="$t('pbxConfig.seats')"
                :options="seatOptions"
            />
        </q-field>
        <q-field>
            <q-select
                dark
                radio
                v-model="data.soundSet"
                :disable="loading"
                :readonly="loading"
                :stack-label="$t('pbxConfig.soundSet')"
                :options="soundSetOptions"
            />
        </q-field>
        <div class="csc-form-actions row justify-center">
            <q-btn
                flat
                v-if="!loading"
                color="default"
                icon="clear"
                @mousedown.native="cancel()"
            >
                {{ $t('buttons.cancel') }}
            </q-btn>
            <q-btn
                flat
                v-if="!loading"
                color="primary"
                icon="group"
                :disable="$v.data.$invalid"
                @click="save()"
            >
                {{ $t('pbxConfig.createGroup') }}
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
        minValue,
        maxValue,
        maxLength,
        numeric
    } from 'vuelidate/lib/validators'
    import {
        QBtn,
        QInnerLoading,
        QSpinnerDots,
        QField,
        QInput,
        QSelect,
        QIcon,
        QTooltip
    } from 'quasar-framework'
    import CscObjectSpinner from "../../CscObjectSpinner";
    export default {
        name: 'csc-pbx-group-add-form',
        props: [
            'huntPolicyOptions',
            'aliasNumberOptions',
            'seatOptions',
            'soundSetOptions',
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
            QTooltip
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
                    numeric,
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
        created() {
            if (this.defaultSoundSet) {
                this.soundSet = this.defaultSoundSet;
            }
        },
        computed: {
            groupNameErrorMessage() {
                if (!this.$v.data.name.required) {
                    return this.$t('validationErrors.fieldRequired', {
                        field: this.$t('pbxConfig.groupName')
                    });
                }
                else if (!this.$v.data.name.maxLength) {
                    return this.$t('validationErrors.maxLength', {
                        field: this.$t('pbxConfig.groupName'),
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
                    return this.$t('validationErrors.numeric', {
                        field: this.$t('pbxConfig.extension'),
                    });
                }
            },
            huntTimeoutErrorMessage() {
                if (!this.$v.data.huntTimeout.required) {
                    return this.$t('validationErrors.fieldRequired', {
                        field: this.$t('pbxConfig.huntTimeoutSentence')
                    });
                }
                else if (!this.$v.data.huntTimeout.numeric) {
                    return this.$t('validationErrors.numeric', {
                        field: this.$t('pbxConfig.huntTimeoutSentence'),
                    });
                }
                else if (!this.$v.data.huntTimeout.minValue) {
                    return this.$t('validationErrors.minValueSecond', {
                        field: this.$t('pbxConfig.huntTimeoutSentence'),
                        minValue: this.$v.data.huntTimeout.$params.minValue.min
                    });
                }
                else if (!this.$v.data.huntTimeout.maxValue) {
                    return this.$t('validationErrors.maxValueSecond', {
                        field: this.$t('pbxConfig.huntTimeoutSentence'),
                        maxValue: this.$v.data.huntTimeout.$params.maxValue.max
                    });
                }
            },
            groupModel() {
                return {
                    name: this.data.name,
                    extension: this.data.extension,
                    huntPolicy: this.data.huntPolicy,
                    huntTimeout: this.data.huntTimeout,
                    aliasNumbers: this.data.aliasNumbers,
                    seats: this.data.seats,
                    soundSet: this.data.soundSet
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
                    seats: [],
                    soundSet: null
                }
            },
            cancel() {
                this.$emit('cancel');
            },
            save() {
                this.$emit('save', this.groupModel);
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
