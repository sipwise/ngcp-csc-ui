<template>
    <div
        class="csc-input-password-retype"
    >
        <csc-input-password
            ref="password"
            v-model="password"
            v-bind="$attrs"
            generate
            clearable
            :label="passwordLabel"
            @update:model-value="inputPassword"
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
            :error-message="errorMessagePasswordRetype"
            clearable
            :disable="passwordScore < 2 || $attrs.disable"
            @clear="v$.passwordRetype.$reset()"
            @blur="passwordRetypeBlur"
            @update:model-value="inputRetypePassword"
        />
    </div>
</template>
<script>
import {
    sameAs,
    required
} from '@vuelidate/validators'
import CscInputPassword from 'components/form/CscInputPassword'
import PasswordMeter from 'vue-simple-password-meter'
import useValidate from '@vuelidate/core'
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
                // eslint-disable-next-line vue/no-deprecated-props-default-this
                return this.$t('Password')
            }
        },
        passwordConfirmLabel: {
            type: String,
            default () {
                // eslint-disable-next-line vue/no-deprecated-props-default-this
                return this.$t('Password Retype')
            }
        }
    },
    emits: ['validation-failed', 'validation-succeeded', 'update:modelValue', 'score'],
    data () {
        return {
            password: this.modelValue.password,
            passwordRetype: this.modelValue.passwordRetype,
            passwordScore: null,
            v$: useValidate()
        }
    },
    validations () {
        return {
            password: {
                required
            },
            passwordRetype: {
                required,
                sameAsPassword: sameAs(this.password)
            }
        }
    },
    computed: {
        errorMessagePasswordRetype () {
            const errorsTab = this.v$.passwordRetype.$errors
            if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'sameAsPassword') {
                return this.$t('Passwords must be equal')
            } else {
                return ''
            }
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
            } else {
                return 'primary'
            }
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
    },
    methods: {
        strengthMeterScoreUpdate (evt) {
            this.passwordScore = evt.score
            this.$emit('score', evt.score)
        },
        inputPassword () {
            this.$emit('update:modelValue', {
                password: this.password,
                passwordRetype: this.passwordRetype
            })
        },
        inputRetypePassword () {
            this.validate()
            this.inputPassword()
        },
        passwordGenerated (password) {
            this.$emit('update:modelValue', {
                password: password,
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
