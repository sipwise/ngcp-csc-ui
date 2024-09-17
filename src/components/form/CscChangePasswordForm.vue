<template>
    <div
        class="csc-form"
    >
        <csc-input-password
            ref="passwordInput"
            v-model.trim="password"
            clearable
            type="password"
            hide-bottom-space
            :label="$t('Password')"
            :disable="loading"
            :error="v$.password.$errors.length > 0"
            :error-message="$errMsg(v$.password.$errors)"
            @blur="v$.password.$touch()"
        />
        <password-meter
            v-model="passwordScored"
            class="full-width"
            style="max-width: none;"
            :strength-meter-only="true"
            @score="strengthMeterScoreUpdate"
        />
        <csc-input-password
            ref="passwordRetypeInput"
            v-model.trim="passwordRetype"
            clearable
            type="password"
            hide-bottom-space
            :label="$t('Password Retype')"
            :disable="loading"
            :error="v$.passwordRetype.$errors.length > 0"
            :error-message="$errMsg(v$.passwordRetype.$errors)"
            @blur="v$.passwordRetype.$touch();onRetypeBlur()"
        />
    </div>
</template>

<script>
import PasswordMeter from 'vue-simple-password-meter'
import { maxLength, minLength, required } from '@vuelidate/validators'
import CscInputPassword from 'components/form/CscInputPassword'
import useValidate from '@vuelidate/core'
import { mapGetters } from 'vuex'
export default {
    name: 'CscChangePasswordForm',
    components: {
        CscInputPassword,
        PasswordMeter
    },
    props: {
        noSubmit: {
            type: Boolean,
            default: false
        },
        loading: {
            type: Boolean,
            default: false
        }
    },
    emits: ['validation-succeeded', 'validation-failed'],
    data () {
        return {
            password: '',
            passwordRetype: '',
            passwordScored: '',
            passwordStrengthScore: null,
            v$: useValidate(),
            messages: []
        }
    },
    validations () {
        return {
            password: { ...this.getPasswordValidations() },
            passwordRetype: {
                required,
                sameAsPassword (val) {
                    return val === this.password
                }
            }
        }
    },
    computed: {
        ...mapGetters('user', [
            'passwordRequirements'
        ])
    },
    watch: {
        password (value) {
            if (value === null || value === undefined) {
                this.passwordScored = ''
            } else {
                this.passwordScored = value
            }
        }
    },
    mounted () {
        this.messages = this.getPasswordRequirementsMessages()
    },
    methods: {
        getPasswordRequirementsMessages () {
            if (!this.passwordRequirements?.web_validate) {
                return
            }

            const lengthMessage = this.passwordRequirements.min_length > 0
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
            if (this.passwordRequirements?.web_validate) {
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
        strengthMeterScoreUpdate (evt) {
            this.passwordStrengthScore = evt.score
        },
        resetForm () {
            this.password = this.passwordRetype = this.passwordScored = ''
            this.passwordStrengthScore = null
            this.v$.$reset()
        },
        submit () {
            this.v$.$touch()
            if (this.v$.$invalid) {
                this.$emit('validation-failed')
            } else {
                this.$emit('validation-succeeded', {
                    password: this.password,
                    strengthScore: this.passwordStrengthScore
                })
            }
        },
        onRetypeBlur () {
            if (this.noSubmit && !this.v$.$invalid) {
                this.$emit('validation-succeeded', {
                    password: this.password,
                    strengthScore: this.passwordStrengthScore
                })
            }
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">
.po-password-strength-bar
    border-radius: 2px
    transition: all 0.2s linear
    height: 6px
    margin-bottom: 12px
    margin-top: 3px
    background-color: #ddd
    max-width: none
</style>
