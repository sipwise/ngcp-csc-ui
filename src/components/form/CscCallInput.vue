s
<template>
    <q-input
        v-bind="$attrs"
        :value="value"
        :error="$v.inputValue.$error"
        :error-message="errorMessage"
        v-on="$listeners"
        @input="$emit('input', $event)"
    />
</template>

<script>
import {
    userInfo
} from 'src/helpers/validation'
import {
    maxLength,
    required
} from 'vuelidate/lib/validators'

export default {
    name: 'CscCallInput',
    props: {
        value: {
            type: String,
            required: true
        }
    },
    data () {
        return {
            inputValue: '',
            error: ''
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
            if (!this.$v.inputValue.required) {
                return this.$t('{field} is required', {
                    field: this.label
                })
            } else if (!this.$v.inputValue.maxLength) {
                return this.$t('{field} must have at most {maxLength} letters', {
                    field: this.label,
                    maxLength: this.$v.inputValue.$params.maxLength.max
                })
            } else if (!this.$v.inputValue.userInfo) {
                return this.$t('Input a valid phone number')
            } else {
                return ''
            }
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
            this.$v.inputValue.$touch()
            this.error = this.$v.inputValue.$error
            this.$emit('input', this.inputValue)
        },
        blur () {
            this.$v.inputValue.$touch()
            this.error = this.$v.inputValue.$error
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
