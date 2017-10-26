<template>
    <div class="csc-call">

        <q-card flat color="secondary">
            <q-card-title>
                <q-icon v-if="isCalling && getMediaType == 'audioOnly'" name="mic" color="primary" size="26px"/>
                <q-icon v-else-if="isCalling && getMediaType == 'audioVideo'" name="videocam" color="primary" size="26px"/>
                <q-icon v-else-if="isEnded" name="error" color="primary" size="26px"/>
                <q-icon v-else name="call made" color="primary" size="26px"/>

                <span v-if="isPreparing" class="text">{{ $t('call.startNew') }}</span>
                <span v-else-if="isInitiating" class="text">{{ $t('call.initiating') }}</span>
                <span v-else-if="isRinging" class="text">{{ $t('call.ringing') }}</span>
                <span v-else-if="isEnded" class="text">{{ $t('call.ended') }}</span>
                <span v-else class="text">{{ $t('call.call') }}</span>

                <q-btn round small slot="right" class="no-shadow" @click="close()" icon="clear"/>
            </q-card-title>
            <q-card-main>
                <div v-if="isTrying" class="csc-spinner"><q-spinner-rings color="primary" :size="60" /></div>
                <div v-if="isCalling" class="phone-number">{{ getNumber }}</div>
                <csc-media v-if="isCalling && localMediaStream != null" :stream="localMediaStream" />
                <q-field v-if="isPreparing" :helper="$t('inputNumber')" :error="validationEnabled && phoneNumberError"
                         :error-label="$t('inputValidNumber')" :count="64" dark>
                    <q-input float-label="Number" v-model="formattedPhoneNumber" dark clearable max="64"
                             @blur="phoneNumberBlur()" @focus="phoneNumberFocus()"/>
                </q-field>
                <div v-if="isEnded" class="ended-reason">
                    {{ getEndedReason }}
                </div>
            </q-card-main>
            <q-card-actions align="center">
                <q-btn v-if="isPreparing" round small color="primary" @click="call('audioOnly')" icon="mic" />
                <q-btn v-if="isPreparing" round small color="primary" @click="call('audioVideo')" icon="videocam" />
                <q-btn v-if="isCalling" round small color="negative" @click="hangUp()" icon="call end" />
                <q-btn v-if="isEnded" round small color="negative" @click="init()" icon="clear"/>
            </q-card-actions>
        </q-card>

    </div>
</template>

<script>
    import _ from 'lodash';
    import { mapState, mapGetters } from 'vuex'
    import CscMedia from './CscMedia'
    import { QLayout, QCard, QCardTitle, QCardSeparator, QCardMain, QField, QInput,
        QCardActions, QBtn, QIcon, Loading, Alert, QSpinnerRings } from 'quasar-framework'
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
            QIcon,
            QSpinnerRings,
            CscMedia
        },
        methods: {
            init() {
                this.phoneNumber = '';
                this.parsedPhoneNumber = null;
                this.validationEnabled = false;
                this.phoneNumberError = false;
                this.$store.commit('call/inputNumber');
            },
            phoneNumberFocus() {
                this.validationEnabled = true;
            },
            phoneNumberBlur() {
                this.validationEnabled = false;
            },
            call(localMedia) {
                this.validationEnabled = true;
                if(this.parsedPhoneNumber !== null) {
                    this.phoneNumberError = false;
                    this.$store.dispatch('call/start', {
                        number: this.phoneNumber,
                        localMedia: localMedia
                    });
                } else {
                    this.phoneNumberError = true;
                }
            },
            hangUp() {
                this.$store.dispatch('call/hangUp');
            },
            close() {
                this.$store.commit('call/inputNumber');
                this.$emit('close');
            }
        },
        computed: {
            formattedPhoneNumber: {
                get() {
                    if(this.parsedPhoneNumber !== null) {
                        return _.trim(phoneUtil.format(this.parsedPhoneNumber, PhoneNumberFormat.INTERNATIONAL));
                    } else {
                        return _.trim(this.phoneNumber);
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
            localMediaStream() {
                if(this.$store.state.call.localMediaStream != null) {
                    return this.$store.state.call.localMediaStream.getStream();
                } else {
                    return null;
                }
            },
            remoteMediaStream() {
                console.log(this.$refs.remoteMedia);
            },
            ...mapGetters('call', [
                'isPreparing',
                'isInitiating',
                'isTrying',
                'isRinging',
                'isCalling',
                'isEnded',
                'getNumber',
                'getMediaType',
                'getLocalMediaType',
                'getEndedReason'
            ]),
            hasLocalVideo() {
                return this.getLocalMediaType !== null && this.getLocalMediaType.match(/(v|V)ideo/) !== null;
            }
        }
    }
</script>

<style lang="stylus">
    .csc-call .q-card {
        margin:0;
    }

    .csc-call .q-card-main {
        padding: 0;
    }

    .csc-call .q-field {
        margin: 0px;
        padding-left: 16px;
        padding-right: 16px;
    }

    .csc-call .q-card-actions {
        padding: 16px;
    }

    .csc-spinner {
        text-align: center;
        margin-bottom: 16px;
    }

    .q-card-title .text {
        color: #adb3b8;
    }

    .csc-call .phone-number {
        font-size: 18px;
        text-align: center;
        color: #adb3b8;
        margin-bottom: 16px;
    }

    .csc-call .ended-reason {
        font-size: 18px;
        text-align: center;
        color: #adb3b8;
    }
</style>
