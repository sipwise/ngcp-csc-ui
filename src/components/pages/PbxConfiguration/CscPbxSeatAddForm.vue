<template>
    <div class="csc-form csc-pbx-seat-add-form">
        <q-field :error-label="seatNameErrorMessage">
            <q-input
                dark
                clearable
                autofocus
                v-model="data.name"
                :error="$v.data.name.$error"
                :disable="loading"
                :readonly="loading"
                :float-label="$t('pbxConfig.name')"
                @input="$v.data.name.$touch"
                @blur="$v.data.name.$touch"
            />
        </q-field>
        <q-field :error-label="extensionErrorMessage">
            <q-input
                dark
                clearable
                v-model="data.extension"
                :error="$v.data.extension.$error"
                :disable="loading"
                :readonly="loading"
                :float-label="$t('pbxConfig.extension')"
                @input="$v.data.extension.$touch"
                @blur="$v.data.extension.$touch"
            />
        </q-field>
        <q-field>
            <q-select
                dark
                chips
                clearable
                multiple
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
                chips
                clearable
                multiple
                v-model="data.groups"
                :disable="loading"
                :readonly="loading"
                :float-label="$t('pbxConfig.groups')"
                :options="groupOptions"
            />
        </q-field>
        <q-field>
            <q-select
                dark
                clearable
                v-model="data.soundSet"
                :disable="loading || !defaultSoundSet"
                :readonly="loading"
                :float-label="$t('pbxConfig.soundSet')"
                :options="soundSetOptions"
            />
            <q-tooltip
                v-if="!defaultSoundSet"
            >
                {{ $t('pbxConfig.defaultNotSet') }}
            </q-tooltip>
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
                icon="person"
                :disable="$v.data.$invalid"
                @click="save()"
            >
                {{ $t('pbxConfig.createSeat') }}
            </q-btn>
        </div>
        <q-inner-loading :visible="loading">
            <q-spinner-dots size="60px" color="primary" />
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
        QBtn,
        QInnerLoading,
        QSpinnerDots,
        QField,
        QInput,
        QSelect,
        QIcon,
        QTooltip
    } from 'quasar-framework'

    export default {
        name: 'csc-pbx-seat-add-form',
        props: [
            'aliasNumberOptions',
            'groupOptions',
            'loading',
            'soundSetOptions',
            'soundSetLabel',
            'defaultSoundSet'
        ],
        components: {
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
        created() {
            if (this.defaultSoundSet) {
                this.soundSet = this.defaultSoundSet;
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
                    return this.$t('validationErrors.numeric', {
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
                    groups: [],
                    soundSet: null
                }
            },
            seatModel() {
                return {
                    name: this.data.name,
                    extension: this.data.extension,
                    aliasNumbers: this.data.aliasNumbers,
                    groups: this.data.groups,
                    soundSet: this.soundSetLabel(this.data.soundSet)
                }
            },
            cancel() {
                this.$emit('cancel');
            },
            save() {
                this.$emit('save', this.seatModel);
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
