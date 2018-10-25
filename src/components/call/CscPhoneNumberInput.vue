<template>
    <q-field
        v-if="!isMobile"
        dark
        :count="maxLength"
        :helper="helperMessage"
        :error-label="errorMessage"
    >
        <q-input
            ref="inputField"
            dark
            clearable
            type="text"
            :float-label="$t('call.number')"
            :readonly="!enabled"
            v-model="phoneNumber"
            @keypress.space.prevent
            @keydown.space.prevent
            @keyup.space.prevent
            :after="inputButtons"
            @keyup.enter="keyReturn()"
            @input="$v.phoneNumber.$touch"
            @blur="$v.phoneNumber.$touch"
            :error="$v.phoneNumber.$error"
        />
    </q-field>
    <q-field
        v-else
        dark
        :error="$v.phoneNumber.$error"
        :error-label="errorMessage"
    >
        <q-input
            ref="inputField"
            dark
            clearable
            type="text"
            :placeholder="$t('call.number')"
            :value="phoneNumber"
            :error="$v.phoneNumber.$error"
            :max-length="maxLength"
            :readonly="!enabled"
            @input="inputPhoneNumber"
            @keypress.space.prevent
            @keydown.space.prevent
            @keyup.space.prevent
            :after="inputButtons"
        />
    </q-field>
</template>

<script>
    import Vue from 'vue'
    import _ from 'lodash'
    import { userInfo } from '../../helpers/validation'
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
                userInfo
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
            dialpadButton: {
                type: Boolean,
                default: false
            }
        },
        mixins: [
            platformMixin
        ],
        computed: {
            errorMessage() {
                return this.$t('validationErrors.inputValidNumber');
            },
            helperMessage() {
                return this.$t('validationErrors.inputNumber');
            },
            inputReadonly() {
                return this.isMobile;
            },
            inputButtons() {
                let self = this;
                let buttons = [];
                if (this.dialpadButton) {
                    buttons.push({
                        icon: 'dialpad',
                        error: false,
                        handler (event) {
                            event.stopPropagation();
                            self.toggleDialpad();
                        }
                    });
                }
                return buttons;
            }
        },
        methods: {
            keyReturn() {
                this.$emit('key-return');
            },
            getPhoneNumber() {
                return this.phoneNumber;
            },
            hasPhoneNumber() {
                return !this.$v.phoneNumber.$error && !_.isEmpty(this.phoneNumber);
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
            },
            remove() {
                this.phoneNumber = _.trim(this.phoneNumber.substring(0, this.phoneNumber.length - 1));
                if (this.phoneNumber === '+') {
                    this.phoneNumber = '';
                }
            },
            removeAll() {
                this.phoneNumber = '';
            },
            toggleDialpad() {
                this.$emit('toggle-dialpad');
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
