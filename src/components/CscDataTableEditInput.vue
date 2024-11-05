<template>
    <span
        class="cursor-pointer"
    >
        <q-input
            v-model="internalValue"
            dense
            hide-bottom-space
            borderless
            filled
            :error="error"
            :error-message="errorMessage"
            :disable="$attrs.disable"
            @keyup="save"
            @clear="clear"
        />
    </span>
</template>

<script>
import useValidate from '@vuelidate/core'
import { i18n } from 'boot/i18n'
export default {
    name: 'CscDataTableEditInput',
    props: {
        column: {
            type: Object,
            required: true
        },
        row: {
            type: Object,
            required: true
        },
        value: {
            type: [String, Number],
            default: undefined
        },
        saveLabel: {
            type: String,
            default: i18n.global.tc('Save')
        }
    },
    emits: ['changed'],
    data () {
        return {
            v$: useValidate(),
            internalValue: this.value
        }
    },
    validations () {
        const config = {}
        if (this.column.componentValidations) {
            config.internalValue = {}
            this.column.componentValidations.forEach((validation) => {
                config.internalValue[validation.name] = validation.validator
            })
        }
        return config
    },
    computed: {
        error () {
            if (this.column.componentValidations) {
                return this.v$.internalValue.$errors.length > 0
            }
            return false
        },
        errorMessage () {
            if (this.column.componentValidations) {
                const validation = this.column.componentValidations.find((validation) => this.v$.internalValue[validation.name]?.$invalid === true
                )
                if (validation) {
                    return validation.error
                }
                return undefined
            }
            return undefined
        }
    },
    watch: {
        value (value) {
            this.internalValue = value
        }
    },
    mounted () {
        this.internalValue = this.value
        this.v$.$reset()
    },
    methods: {
        validate () {
            if (this.column.componentValidations) {
                this.v$.$touch()
                return !this.v$.$invalid
            }
            return true
        },
        save () {
            this.v$.$touch()
            this.$emit('changed', {
                column: this.column,
                row: this.row,
                value: this.internalValue
            })
        },
        clear () {
            this.v$.$reset()
        }
    }
}
</script>
