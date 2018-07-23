
<template>
    <q-input
        type="text"
        :float-label="label"
        :value="phoneNumber"
        @input="inputPhoneNumber"
        clearable
        @blur="phoneNumberBlur"
        @focus="phoneNumberFocus"
        @keypress.space.prevent
        @keydown.space.prevent
    />
</template>

<script>
    import {
        normalizeNumber,
        rawNumber
    } from '../../filters/number-format'
    import {
        QInput,
        Platform
    } from 'quasar-framework'

    export default {
        name: 'csc-destination-input',
        props: [
            'loading',
            'label'
        ],
        data () {
            return {
                validationEnabled: false,
                phoneNumber: ''
            }
        },
        components: {
            QInput
        },
        methods: {
            inputPhoneNumber(value) {
                // TODO: Don't know if we need platform value - check
                this.phoneNumber = normalizeNumber(value, Platform.is.mobile);
                this.$emit('destination-input', rawNumber(this.phoneNumber));
            },
            phoneNumberFocus() {
                this.validationEnabled = true;
            },
            phoneNumberBlur() {
                this.validationEnabled = false;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
