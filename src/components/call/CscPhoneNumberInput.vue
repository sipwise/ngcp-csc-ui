<template>
    <q-input
        ref="inputField"
        clearable
        type="text"
        :label="$t('Phone number')"
        :value="value"
        :disable="!enabled"
        :error="v$.phoneNumber.$errors.length > 0"
        :readonly="readonly"
        @keypress.space.prevent
        @keydown.space.prevent
        @keyup.space.prevent
        @keyup.enter="keyReturn()"
        @update:model-value="inputNumber"
    />
</template>
<script>
import useValidate from '@vuelidate/core'
import { maxLength } from '@vuelidate/validators'
import platformMixin from 'src/components/mixins/platform'
import { userInfoAndEmpty } from 'src/helpers/validation'
import { nextTick } from 'vue'

export default {
    name: 'CscPhoneNumberInput',
    validations: {
        phoneNumber: {
            userInfoAndEmpty,
            maxLength: maxLength(64)
        }
    },
    mixins: [
        platformMixin
    ],
    props: {
        maxLength: {
            type: Number,
            default: 64
        },
        enabled: {
            type: Boolean,
            default: true
        },
        readonly: {
            type: Boolean,
            default: false
        },
        dark: {
            type: Boolean,
            default: true
        },
        value: {
            type: String,
            default: ''
        }
    },
    emits: ['key-return', 'number-changed'],
    data () {
        return {
            phoneNumber: this.value,
            v$: useValidate()
        }
    },
    computed: {
        errorMessage () {
            const errorsTab = this.v$.phoneNumber.$errors
            if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'required') {
                return this.$t('{field} is required', {
                    field: this.$t('Phone number')
                })
            } else if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'maxLength') {
                return this.$t('{field} must have at most {maxLength} letters', {
                    field: this.$t('Phone number'),
                    maxLength: this.v$.phoneNumber.maxLength.$params.max
                })
            } else if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'userInfo') {
                return this.$t('Input a valid phone number')
            }
            return ''
        },
        helperMessage () {
            return this.$t('Input a phone number')
        }
    },
    watch: {
        value () {
            this.phoneNumber = this.value
            this.v$.phoneNumber.$touch()
        }
    },
    methods: {
        inputNumber (input) {
            this.phoneNumber = input
            this.v$.phoneNumber.$touch()
            this.$emit('number-changed', this.phoneNumber)
        },
        keyReturn () {
            this.$emit('key-return')
        },
        focus () {
            nextTick(() => {
                if (this.$refs.inputField) {
                    this.$refs.inputField.focus()
                }
            })
        },
        blur () {
            nextTick(() => {
                if (this.$refs.inputField) {
                    this.$refs.inputField.blur()
                }
            })
        }
    }
}
</script>
<style lang="sass" rel="stylesheet/sass">
</style>
