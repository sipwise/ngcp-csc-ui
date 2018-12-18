<template>
    <q-field
        :dark="dark"
        :count="maxLength"
        :helper="helperMessage"
        :error-label="errorMessage"
        :disabled="!enabled"
    >
        <q-input
            ref="inputField"
            :dark="dark"
            clearable
            type="text"
            :float-label="$t('call.number')"
            :value="value"
            :disable="!enabled"
            :error="$v.phoneNumber.$error"
            @keypress.space.prevent
            @keydown.space.prevent
            @keyup.space.prevent
            @keyup.enter="keyReturn()"
            @input="inputNumber"
        />
    </q-field>
</template>
<script>
    import Vue from 'vue'
    import {
        userInfoAndEmpty
    } from '../../helpers/validation'
    import {
        maxLength
    } from 'vuelidate/lib/validators'
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
                phoneNumber: this.value
            }
        },
        validations: {
            phoneNumber: {
                userInfoAndEmpty,
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
        mixins: [
            platformMixin
        ],
        computed: {
            errorMessage() {
                if (!this.$v.phoneNumber.required) {
                    return this.$t('validationErrors.fieldRequired', {
                        field: this.$t('call.number')
                    });
                }
                else if (!this.$v.phoneNumber.maxLength) {
                    return this.$t('validationErrors.maxLength', {
                        field: this.$t('call.number'),
                        maxLength: this.$v.phoneNumber.$params.maxLength.max
                    });
                }
                else if (!this.$v.phoneNumber.userInfo) {
                    return this.$t('validationErrors.inputValidNumber');
                }
            },
            helperMessage() {
                return this.$t('validationErrors.inputNumber');
            }
        },
        methods: {
            inputNumber(input) {
                this.phoneNumber = input;
                this.$v.phoneNumber.$touch();
                this.$emit('number-changed', this.phoneNumber);
            },
            keyReturn() {
                this.$emit('key-return');
            },
            focus() {
                Vue.nextTick(() => {
                    if(this.$refs.inputField) {
                        this.$refs.inputField.focus();
                    }
                });
            },
            blur() {
                Vue.nextTick(() => {
                    if(this.$refs.inputField) {
                        this.$refs.inputField.blur();
                    }
                });
            }
        },
        watch: {
            value() {
                this.phoneNumber = this.value;
                this.$v.phoneNumber.$touch();
            }
        }
    }
</script>
<style lang="stylus" rel="stylesheet/stylus">
</style>
