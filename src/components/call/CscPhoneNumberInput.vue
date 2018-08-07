<template>
    <q-field
        dark
        :count="maxLength"
        :helper="helperMessage"
        :error="$v.phoneNumber.$error"
        :error-label="errorMessage"
    >
        <q-input
            ref="inputField"
            dark
            clearable
            type="text"
            :float-label="$t('call.number')"
            :value="phoneNumber"
            :error="$v.phoneNumber.$error"
            :max-length="maxLength"
            :readonly="!enabled"
            @input="inputPhoneNumber"
            @click="enableInput"
            @keypress.space.prevent
            @keydown.space.prevent
        />
    </q-field>
</template>

<script>

    import Vue from 'vue'
    import _ from 'lodash'
    import {
        maxLength
    } from 'vuelidate/lib/validators'
    import {
        normalizeNumber,
        rawNumber
    } from '../../filters/number-format'
    import {
        QField,
        QInput
    } from 'quasar-framework'
    import platformMixin from '../../mixins/platform'

    export default {
        name: 'csc-phone-number-input',
        components: {
            QField,
            QInput
        },
        data () {
            return {
                phoneNumber: ''
            }
        },
        validations: {
            phoneNumber: {
                maxLength: maxLength(64)
            }
        },
        props: {
            maxLength: {
                type: Number,
                default: 64
            },
            enabled: {
                type: Boolean,
                default: true
            }
        },
        mixins: [
            platformMixin
        ],
        computed: {
            errorMessage() {
                return this.$t('call.inputValidNumber');
            },
            helperMessage() {
                return this.$t('call.inputNumber');
            },
            inputReadonly() {
                return this.isMobile;
            }
        },
        methods: {
            inputPhoneNumber(value) {
                this.phoneNumber = normalizeNumber(value, this.isMobile);
                this.$v.phoneNumber.$touch();
            },
            getPhoneNumber() {
                return this.phoneNumber;
            },
            getRawPhoneNumber() {
                return rawNumber(this.getPhoneNumber());
            },
            hasPhoneNumber() {
                return !_.isEmpty(this.phoneNumber);
            },
            concat(str) {
                this.inputPhoneNumber(this.phoneNumber + "" + str);
            },
            focusInput() {
                Vue.nextTick(() => {
                    this.$refs.inputField.focus();
                });
            },
            blurInput() {
                Vue.nextTick(() => {
                    this.$refs.inputField.blur();
                });
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
