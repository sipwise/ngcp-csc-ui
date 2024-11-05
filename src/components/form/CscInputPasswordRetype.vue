<template>
    <div
        class="csc-input-password-retype"
    >
        <q-tooltip v-if="messages.length > 0">
            <div class="tooltip-message q-pa-md text-body2">
                Password requirements:
                <q-item
                    v-for="(message, index) in messages"
                    :key="index"
                    dense
                >
                    <q-item-section>
                        <span>
                            <q-icon
                                name="lock"
                                size="1em"
                                class="q-pa-xs"
                            /> {{ message }}
                        </span>
                    </q-item-section>
                </q-item>
            </div>
        </q-tooltip>
        <csc-input-password
            ref="password"
            v-model="password"
            v-bind="$attrs"
            generate
            clearable
            :error="v$.password.$errors.length > 0"
            :error-message="$errMsg(v$.password.$errors)"
            :label="passwordLabel"
            @update:model-value="inputPassword"
            @blur="v$.password.$touch()"
            @generated="passwordGenerated"
            @clear="passwordClear"
        />
        <password-meter
            v-show="false"
            :password="password"
            @score="strengthMeterScoreUpdate"
        />
        <q-linear-progress
            v-model="passwordScoreMappedValue"
            :color="passwordScoreColor"
            size="8px"
        />
        <csc-input-password
            ref="passwordRetype"
            v-model="passwordRetype"
            v-bind="$attrs"
            :label="passwordConfirmLabel"
            :error="v$.passwordRetype.$errors.length > 0"
            :error-message="$errMsg(v$.passwordRetype.$errors)"
            clearable
            :disable="$attrs.disable"
            @clear="v$.passwordRetype.$reset()"
            @blur="passwordRetypeBlur"
            @update:model-value="inputRetypePassword"
        />
    </div>
</template>
<script>

import useValidate from '@vuelidate/core'
import {
    maxLength,
    minLength,
    required,
    sameAs
} from '@vuelidate/validators'
import CscInputPassword from 'components/form/CscInputPassword'
import PasswordMeter from 'vue-simple-password-meter'
import { mapGetters } from 'vuex'
export default {
    name: 'CscInputPasswordRetype',
    components: {
        CscInputPassword,
        PasswordMeter
    },
    props: {
        modelValue: {
            type: Object,
            default () {
                return {
                    password: '',
                    passwordRetype: ''
                }
            }
        },
        passwordLabel: {
            type: String,
            default () {
                return this.$t('Password')
            }
        },
        passwordConfirmLabel: {
            type: String,
            default () {
                return this.$t('Password Retype')
            }
        },
        passwordType: {
            type: String,
            default () {
                return 'web'
            }
        }
    },
    emits: ['validation-failed', 'validation-succeeded', 'update:modelValue', 'score'],
    data () {
        return {
            password: this.modelValue.password,
            passwordRetype: this.modelValue.passwordRetype,
            passwordScore: null,
            v$: useValidate(),
            messages: []
        }
    },
    validations () {
        return {
            password: { ...this.getPasswordValidations() },
            passwordRetype: {
                required,
                sameAsPassword: sameAs(this.password)
            }
        }
    },
    computed: {
        ...mapGetters('user', [
            'passwordRequirements'
        ]),
        areValidationsActive () {
            const webValidate = this.passwordRequirements?.web_validate || false
            const sipValidate = this.passwordRequirements?.sip_validate || false

            return this.passwordType === 'web' ? webValidate : sipValidate
        },
        passwordScoreMappedValue () {
            if (this.passwordScore === null || this.passwordScore === undefined) {
                return 0
            }
            return (this.passwordScore + 1) / 5
        },
        passwordScoreColor () {
            if (this.passwordScore < 2) {
                return 'negative'
            } else if (this.passwordScore === 2) {
                return 'warning'
            }
            return 'primary'
        }
    },
    watch: {
        modelValue (value) {
            this.password = value.password
            this.passwordRetype = value.passwordRetype
        },
        passwordScore (score) {
            if (score < 2) {
                this.$refs.passwordRetype.clear()
                this.v$.$reset()
            }
        }
    },
    mounted () {
        this.v$.$reset()
        this.$refs.passwordRetype.clear()
        this.$refs.password.clear()
        this.messages = this.getPasswordRequirementsMessages()
    },
    methods: {
        strengthMeterScoreUpdate (evt) {
            this.passwordScore = evt.score
            this.$emit('score', evt.score)
        },
        getPasswordRequirementsMessages () {
            if (!this.areValidationsActive) {
                return []
            }

            const lengthMessage = this.passwordRequirements.minLength > 0
                ? `must be between ${this.passwordRequirements.min_length} and ${this.passwordRequirements.max_length} characters long`
                : null
            const digitsMessage = this.passwordRequirements.musthave_digit > 0
                ? `must contain at least ${this.passwordRequirements.musthave_digit} digits`
                : null
            const lowercaseMessage = this.passwordRequirements.musthave_lowercase > 0
                ? `must contain at least ${this.passwordRequirements.musthave_lowercase} lowercase`
                : null
            const uppercaseReq = this.passwordRequirements.musthave_uppercase > 0
                ? `must contain at least ${this.passwordRequirements.musthave_uppercase} uppercase`
                : null
            const specialCharReq = this.passwordRequirements.musthave_specialchar > 0
                ? `must contain at least ${this.passwordRequirements.musthave_specialchar} special characters`
                : null

            return [lengthMessage, digitsMessage, lowercaseMessage, uppercaseReq, specialCharReq].filter((message) => message !== null)
        },
        getPasswordValidations () {
            if (this.areValidationsActive) {
                return {
                    required,
                    passwordMaxLength: maxLength(this.passwordRequirements.max_length),
                    passwordMinLength: minLength(this.passwordRequirements.min_length),
                    passwordDigits () {
                        const digitPattern = /\d/g
                        return (this.password.match(digitPattern) || []).length >= this.passwordRequirements.musthave_digit
                    },
                    passwordLowercase () {
                        const lowercasePattern = /[a-z]/g
                        return (this.password.match(lowercasePattern) || []).length >= this.passwordRequirements.musthave_lowercase
                    },
                    passwordUppercase () {
                        const uppercasePattern = /[A-Z]/g
                        return (this.password.match(uppercasePattern) || []).length >= this.passwordRequirements.musthave_uppercase
                    },
                    passwordChars () {
                        const specialCharPattern = /[\W_]/g
                        return (this.password.match(specialCharPattern) || []).length >= this.passwordRequirements.musthave_specialchar
                    },
                    passwordStrength () {
                        return this.passwordScore >= 2
                    }
                }
            }

            return { required }
        },
        inputPassword () {
            this.$emit('update:modelValue', {
                password: this.password,
                passwordRetype: this.passwordRetype
            })
        },
        inputRetypePassword () {
            this.inputPassword()
        },
        passwordGenerated (password) {
            this.$emit('update:modelValue', {
                password,
                passwordRetype: password
            })
            this.$nextTick(() => {
                this.validate()
            })
        },
        passwordClear () {
            this.$refs.passwordRetype.clear()
            this.validate()
            this.v$.$reset()
        },
        passwordRetypeBlur () {
            this.validate()
        },
        validate () {
            this.v$.$touch()
            if (!this.v$.$invalid) {
                this.$emit('validation-succeeded')
            } else {
                this.$emit('validation-failed')
            }
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">
.csc-input-password-retype
    .po-password-strength-bar
        border-radius: 2px
        transition: all 0.2s linear
        height: 6px
        margin-bottom: 16px !important
        margin-top: 16px !important
        background-color: #ddd
</style>
