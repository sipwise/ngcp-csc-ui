<template>
    <div class="csc-call">
        <audio ref="incomingSound" loop preload="auto" src="statics/ring.mp3"></audio>
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
                <span v-else-if="isIncoming" class="text">Incoming call</span>
                <span v-else class="text">{{ $t('call.call') }}</span>

                <q-btn round small slot="right" class="no-shadow" @click="close()" icon="clear"/>
            </q-card-title>
            <q-card-main>
                <div v-if="isRinging" class="csc-spinner"><q-spinner-rings color="primary" :size="60" /></div>
                <div v-if="!isPreparing" class="phone-number">{{ getNumber | numberFormat }}</div>

                <csc-media id="local-media" v-show="isCalling" :stream="localMediaStream" />
                <csc-media id="remote-media" v-show="isEstablished" :stream="remoteMediaStream" />

                <q-field v-if="isPreparing" :helper="$t('call.inputNumber')" :error="validationEnabled && phoneNumberError"
                         :error-label="$t('call.inputValidNumber')" :count="64" dark>
                    <q-input :float-label="$t('call.number')" v-model="formattedPhoneNumber" dark clearable max="64"
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
                <q-btn v-if="isIncoming" round small color="primary" @click="accept('audioOnly')" icon="mic" />
                <q-btn v-if="isIncoming" round small color="primary" @click="accept('audioVideo')" icon="videocam" />
                <q-btn v-if="isIncoming" round small color="negative" @click="decline()" icon="call end" />
            </q-card-actions>
        </q-card>

    </div>
</template>

<script>
    import _ from 'lodash';
    import { mapState, mapGetters } from 'vuex'
    import CscMedia from './CscMedia'
    import { QLayout, QCard, QCardTitle, QCardSeparator, QCardMain, QField, QInput,
        QCardActions, QBtn, QIcon, Loading, Alert, QSpinnerRings, Dialog } from 'quasar-framework'
    import { normalizeNumber, rawNumber } from '../filters/number-format'
    export default {
        name: 'csc-call',
        props: ['region'],
        data () {
            return {
                phoneNumber: '',
                phoneNumberError: false,
                validationEnabled: false
            }
        },
        updated() {
            if(this.$store.state.call.callState === 'incoming' ||
                this.$store.state.call.callState === 'ringing') {
                this.$refs.incomingSound.play();
            } else {
                this.$refs.incomingSound.pause();
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
            CscMedia,
            Dialog
        },
        methods: {
            init() {
                this.phoneNumber = '';
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
                if(this.phoneNumber !== null) {
                    this.phoneNumberError = false;
                    this.$store.dispatch('call/start', {
                        number: this.phoneNumber,
                        localMedia: localMedia
                    });
                } else {
                    this.phoneNumberError = true;
                }
            },
            accept(localMedia) {
                this.$store.dispatch('call/accept', localMedia);
            },
            decline() {
                this.hangUp();
                this.$emit('close');
            },
            hangUp() {
                this.$store.dispatch('call/hangUp');
            },
            close() {
                if(this.isPreparing || this.isEnded) {
                    this.init();
                    this.$emit('close');
                } else {
                    Dialog.create({
                        title: this.$t('call.endCall'),
                        message: this.$t('call.endCallDialog'),
                        buttons: [
                            'Cancel',
                            {
                                label: this.$t('call.endCall'),
                                color: 'negative',
                                handler: ()=>{
                                    this.hangUp();
                                    this.$emit('close');
                                }
                            }
                        ]
                    });
                }
            },
            playIncomingSound() {
                this.$refs.incomingRinging.play();
            },
            stopIncomingSound() {
                this.$refs.incomingRinging.stop();
            }
        },
        computed: {
            formattedPhoneNumber: {
                get() {
                    return normalizeNumber(this.phoneNumber);
                },
                set(value) {
                    this.validationEnabled = true;
                    this.phoneNumber = rawNumber(value);
                }
            },
            localMediaStream() {
                if(this.$store.state.call.localMediaStream !== null) {
                    return this.$store.state.call.localMediaStream.getStream();
                } else {
                    return null;
                }
            },
            remoteMediaStream() {
                if(this.$store.state.call.remoteMediaStream !== null) {
                    return this.$store.state.call.remoteMediaStream.getStream();
                } else {
                    return null;
                }
            },
            ...mapGetters('call', [
                'isPreparing',
                'isInitiating',
                'isTrying',
                'isRinging',
                'isCalling',
                'isEnded',
                'isIncoming',
                'isEstablished',
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
