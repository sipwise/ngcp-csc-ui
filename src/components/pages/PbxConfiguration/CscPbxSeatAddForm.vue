<template>
    <div
        class="csc-form csc-pbx-seat-add-form"
    >
        <q-field
            :error-label="seatNameErrorMessage">
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
            />
        </q-field>
        <csc-change-password-form
            ref="changePasswordForm"
            :noSubmit="true"
            @validation-succeeded="webPassValidationSucceeded"
        />
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
                radio
                v-model="data.soundSet"
                :disable="loading"
                :readonly="loading"
                :stack-label="$t('pbxConfig.soundSet')"
                :options="soundSetOptions"
            />
        </q-field>
        <q-field>
            <q-toggle
                v-model="data.clirIntrapbx"
                dense
                :label="$t('pbxConfig.toggleIntraPbx')"
                :disable="loading"
            />
        </q-field>
        <div class="csc-form-actions row justify-center">
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
                icon="person"
                :disable="$v.data.$invalid"
                @click="save()"
            >
                {{ $t('pbxConfig.createSeat') }}
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
        QToggle,
        QIcon,
        QTooltip
    } from 'quasar-framework'
    import CscObjectSpinner from "../../CscObjectSpinner";
    import CscChangePasswordForm from "../../form/CscChangePasswordForm"
    export default {
        name: 'csc-pbx-seat-add-form',
        props: [
            'loading',
            'aliasNumberOptions',
            'groupOptions',
            'soundSetOptions'
        ],
        components: {
            CscObjectSpinner,
            CscChangePasswordForm,
            QBtn,
            QInnerLoading,
            QSpinnerDots,
            QField,
            QInput,
            QSelect,
            QToggle,
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
                },
                webPassword: {
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
            },
            webPasswordErrorMessage() {
                if (!this.$v.data.webPassword.required) {
                    return this.$t('validationErrors.fieldRequired', {
                        field: this.$t('pbxConfig.webPassword')
                    });
                }
                else if (!this.$v.data.webPassword.maxLength) {
                    return this.$t('validationErrors.maxLength', {
                        field: this.$t('pbxConfig.webPassword'),
                        maxLength: this.$v.data.webPassword.$params.maxLength.max
                    });
                }
            },
            seatModel() {
                return {
                    name: this.data.name,
                    extension: this.data.extension,
                    webPassword: this.data.webPassword,
                    aliasNumbers: this.data.aliasNumbers,
                    groups: this.data.groups,
                    soundSet: this.data.soundSet,
                    clirIntrapbx: this.data.clirIntrapbx
                }
            }
        },
        methods: {
            getDefaults() {
                return {
                    name: '',
                    extension: '',
                    webPassword: '',
                    aliasNumbers: [],
                    groups: [],
                    soundSet: null,
                    clirIntrapbx: false
                }
            },
            cancel() {
                this.$emit('cancel');
            },
            save() {
                this.$emit('save', this.seatModel);
                this.$refs.changePasswordForm.resetForm();
            },
            reset() {
                this.data = this.getDefaults();
                this.$v.$reset();
            },
            webPassValidationSucceeded(data){
                this.data.webPassword = data.password;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl';
            .Password__strength-meter
                margin-top 20px !important
			.Password__strength-meter:after,
            .Password__strength-meter:before
				border-color #3b3440 !important
			.Password
				max-width 100%
</style>
