s
<template>
    <q-input
        v-bind="$attrs"
        :error="v$.inputValue.$errors.length > 0"
        :error-message="errorMessage"
        @update:model-value="$emit('input', $event)"
    />
</template>

<script>
import useValidate from '@vuelidate/core'
import {
    maxLength,
    required
} from '@vuelidate/validators'
import { userInfo } from 'src/helpers/validation'

export default {
    name: 'CscCallInput',
    emits: ['submit', 'input', 'error'],
    data () {
        return {
            inputValue: '',
            error: '',
            v$: useValidate()
        }
    },
    validations: {
        inputValue: {
            userInfo,
            maxLength: maxLength(64),
            required
        }
    },
    computed: {
        errorMessage () {
            const errorsTab = this.v$.inputValue.$errors
            if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'required') {
                return this.$t('{field} is required', {
                    field: this.label
                })
            } else if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'maxLength') {
                return this.$t('{field} must have at most {maxLength} letters', {
                    field: this.label,
                    maxLength: this.v$.inputValue.maxLength.$params.max
                })
            } else if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'userInfo') {
                return this.$t('Input a valid phone number')
            }
            return ''
        },
        beforeButtons () {
            return this.before ? this.before : []
        }
    },
    watch: {
        error (state) {
            this.$emit('error', state)
        }
    },
    methods: {
        submit () {
            this.$emit('submit')
        },
        input () {
            this.v$.inputValue.$touch()
            this.error = this.v$.inputValue.$error
            this.$emit('input', this.inputValue)
        },
        blur () {
            this.v$.inputValue.$touch()
            this.error = this.v$.inputValue.$error
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">
</style>
