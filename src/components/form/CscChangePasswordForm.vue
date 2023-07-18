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
            :error-message="errorMessagePass"
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
            :error-message="errorMessagePassRetype"
            @blur="v$.passwordRetype.$touch();onRetypeBlur()"
        />
    </div>
</template>

<script>
import PasswordMeter from 'vue-simple-password-meter'
import {
    required
} from '@vuelidate/validators'
import CscInputPassword from 'components/form/CscInputPassword'
import useValidate from '@vuelidate/core'
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
            v$: useValidate()
        }
    },
    validations: {
        password: {
            required,
            passwordStrength () {
                return this.passwordStrengthScore >= 2
            }
        },
        passwordRetype: {
            required,
            sameAsPassword (val) {
                return val === this.password
            }
        }
    },
    computed: {
        errorMessagePass () {
            const errorsTab = this.v$.password.$errors
            if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'passwordStrength') {
                return this.$t('Password is not strong enough')
            } else {
                return ''
            }
        },
        errorMessagePassRetype () {
            const errorsTab = this.v$.passwordRetype.$errors
            if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'sameAsPassword') {
                return this.$t('Passwords must be equal')
            } else {
                return ''
            }
        }
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
    methods: {
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
