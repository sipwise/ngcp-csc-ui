<template>
    <div class="csc-call">
        <q-card v-if="true" flat color="secondary">
            <q-card-title>
                New call
                <q-btn round small slot="right" class="no-shadow" @click="$emit('close')"><q-icon name="clear" /></q-btn>
            </q-card-title>
            <q-card-main>
                <q-field icon="contact phone" helper="Input a phone number"
                         :error="validationEnabled && phoneNumberError"
                         error-label="Input a valid phone number" :count="64" dark>
                    <q-input float-label="Number" v-model="formattedPhoneNumber"
                             dark clearable max="64" @blur="phoneNumberBlur()" @focus="phoneNumberFocus()"/>
                </q-field>
            </q-card-main>
            <q-card-actions align="center">
                <q-btn round small color="primary" @click="call('audio')"><q-icon name="mic" /></q-btn>
                <q-btn round small color="primary" @click="call('video')"><q-icon name="videocam" /></q-btn>
            </q-card-actions>
        </q-card>
    </div>
</template>

<script>
    import _ from 'lodash';
    import { mapState } from 'vuex'
    import { QLayout, QCard, QCardTitle, QCardSeparator, QCardMain, QField, QInput,
        QCardActions, QBtn, QIcon, Loading, Alert } from 'quasar-framework'
    import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber'
    var phoneUtil = PhoneNumberUtil.getInstance();
    export default {
        name: 'csc-call',
        props: ['region'],
        data () {
            return {
                phoneNumber: '',
                parsedPhoneNumber: null,
                phoneNumberError: false,
                validationEnabled: false
            }
        },
        components: {
            QLayout,
            QCard,
            QCardTitle,
            QCardSeparator,
            QCardMain,
            QField,
            QInput,
            QCardActions,
            QBtn,
            QIcon
        },
        methods: {
            init() {
                this.phoneNumber = '';
                this.parsedPhoneNumber = null;
                this.validationEnabled = false;
                this.phoneNumberError = false;
            },
            phoneNumberFocus() {
                this.validationEnabled = true;
            },
            phoneNumberBlur() {
                this.validationEnabled = false;
            },
            call(media) {
                this.validationEnabled = true;
                if(this.parsedPhoneNumber !== null) {
                    this.phoneNumberError = false;
                } else {
                    this.phoneNumberError = true;
                }
            }
        },
        computed: {
            formattedPhoneNumber: {
                get() {
                    if(this.parsedPhoneNumber !== null) {
                        return phoneUtil.format(this.parsedPhoneNumber, PhoneNumberFormat.INTERNATIONAL);
                    } else {
                        return this.phoneNumber;
                    }
                },
                set(value) {
                    this.validationEnabled = true;
                    this.phoneNumber = _.trim(value);
                    if(this.phoneNumber.match('^[1-9]')) {
                        this.phoneNumber = '+' + this.phoneNumber;
                    } else if(this.phoneNumber === '+') {
                        this.phoneNumber = '';
                    }
                    if(phoneUtil.isPossibleNumberString(this.phoneNumber, this.region)) {
                        try {
                            this.parsedPhoneNumber = phoneUtil.parse(this.phoneNumber, this.region);
                            this.phoneNumber = phoneUtil.format(this.parsedPhoneNumber, PhoneNumberFormat.E164);
                            this.phoneNumberError = false;
                        } catch(err) {
                            this.parsedPhoneNumber = null;
                            this.phoneNumberError = true;
                        }
                    } else {
                        this.parsedPhoneNumber = null;
                        this.phoneNumberError = true;
                    }
                }
            },
            localMedia() {
                console.log(this.$refs.localMedia);
            },
            remoteMedia() {
                console.log(this.$refs.remoteMedia);
            },
            ...mapState('call',{
                number: 'number',
                state: 'state',
                mediaType: 'mediaType'
            })
        }
    }
</script>

<style lang="stylus">
    .csc-call .q-card {
        margin:0;
    }
</style>
