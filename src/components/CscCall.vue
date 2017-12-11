<template>
    <div class="csc-call">
        <audio ref="incomingSound" loop preload="auto" src="statics/ring.mp3"></audio>
        <q-card flat color="secondary">
            <q-card-title>
                <span v-if="isRinging || isInitiating || isIncoming">
                    <q-spinner-rings color="primary" :size="50" />
                </span>
                <q-icon v-if="isEnded" name="error" color="primary" size="26px"/>

                <span v-if="isPreparing" class="text">{{ $t('call.startNew') }}</span>
                <span v-else-if="isInitiating" class="text">{{ $t('call.initiating') }}</span>
                <span v-else-if="isRinging" class="text">{{ $t('call.ringing') }}</span>
                <span v-else-if="isEnded" class="text">{{ $t('call.ended') }}</span>
                <span v-else-if="isIncoming" class="text">{{ $t('call.incoming') }}</span>
                <span v-else class="text">{{ $t('call.call') }}</span>

                <q-btn v-if="isFullscreenEnabled" round :small="!isFullscreenEnabled" slot="right"
                       class="no-shadow" @click="toggleFullscreen()" icon="fullscreen exit"/>
                <q-btn v-else round :small="!isFullscreenEnabled" slot="right"
                       class="no-shadow" @click="toggleFullscreen()" icon="fullscreen"/>
                <q-btn round :small="!isFullscreenEnabled" slot="right"
                       class="no-shadow" @click="close()" icon="clear"/>
            </q-card-title>
            <q-card-main>

                <div class="csc-call-info">
                    <q-field v-if="isPreparing" :helper="$t('call.inputNumber')" :count="64" dark
                             :error="validationEnabled && phoneNumberError" :error-label="$t('call.inputValidNumber')">
                        <q-input :float-label="$t('call.number')" v-model.trim="formattedPhoneNumber"
                                 dark clearable max="64" @blur="phoneNumberBlur()" @focus="phoneNumberFocus()"/>
                    </q-field>
                    <div v-if="!isPreparing" class="phone-number">
                        <q-icon v-if="isCalling && getMediaType == 'audioOnly'" name="mic" color="primary" size="26px"/>
                        <q-icon v-else-if="isCalling && getMediaType == 'audioVideo'" name="videocam" color="primary" size="26px"/>
                        {{ getNumber | numberFormat }}
                    </div>
                    <div v-if="isEnded" class="ended-reason">{{ getEndedReason }}</div>
                </div>

                <div class="csc-call-media">
                    <csc-media :class="mediaPreviewClasses" id="local-media" :muted="true"
                               v-show="isCalling" :stream="localMediaStream" />
                    <csc-media class="csc-media-remote" id="remote-media" :muted="isMuted"
                               v-show="isEstablished" :stream="remoteMediaStream" />
                </div>

            </q-card-main>
            <q-card-actions align="center">
                <q-btn v-if="isEstablished" round :small="!isFullscreenEnabled" color="primary" @click="toggleAudio()" :icon="toggleAudioIcon" />
                <q-btn v-if="isEstablished" round :small="!isFullscreenEnabled" color="primary" @click="toggleVideo()" :icon="toggleVideoIcon" />
                <q-btn v-if="isEstablished" round :small="!isFullscreenEnabled" color="primary" @click="toggleMute()" :icon="toggleMuteIcon" />
                <q-btn v-if="isPreparing" round :small="!isFullscreenEnabled" color="primary" @click="call('audioOnly')" icon="mic" />
                <q-btn v-if="isPreparing" round :small="!isFullscreenEnabled" color="primary" @click="call('audioVideo')" icon="videocam" />
                <q-btn v-if="isPreparing" round :small="!isFullscreenEnabled" color="primary" @click="call('audioScreen')" icon="computer" />
                <q-btn v-if="isCalling" round :small="!isFullscreenEnabled" color="negative" @click="hangUp()" icon="call end" />
                <q-btn v-if="isEnded" round :small="!isFullscreenEnabled" color="negative" @click="init()" icon="clear"/>
                <q-btn v-if="isIncoming" round :small="!isFullscreenEnabled" color="primary" @click="accept('audioOnly')" icon="mic" />
                <q-btn v-if="isIncoming" round :small="!isFullscreenEnabled" color="primary" @click="accept('audioVideo')" icon="videocam" />
                <q-btn v-if="isIncoming" round :small="!isFullscreenEnabled" color="primary" @click="accept('audioScreen')" icon="computer" />
                <q-btn v-if="isIncoming" round :small="!isFullscreenEnabled" color="negative" @click="decline()" icon="call end" />
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
        props: ['region', 'fullscreen'],
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
                if(!_.isEmpty(this.phoneNumber)) {
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
            },
            toggleAudio() {
                if(this.isAudioEnabled) {
                    this.$store.dispatch('call/disableAudio');
                } else {
                    this.$store.dispatch('call/enableAudio');
                }
            },
            toggleVideo() {
                if(this.isVideoEnabled) {
                    this.$store.dispatch('call/disableVideo');
                } else {
                    this.$store.dispatch('call/enableVideo');
                }
            },
            toggleMute() {
                if(this.isMuted) {
                    this.$store.commit('call/unmute');
                } else {
                    this.$store.commit('call/mute');
                }
            },
            toggleFullscreen() {
                this.$emit('fullscreen');
            }
        },
        computed: {
            isFullscreenEnabled() {
                return this.fullscreen;
            },
            toggleAudioIcon() {
                if(this.isAudioEnabled) {
                    return 'mic'
                } else {
                    return 'mic off';
                }
            },
            toggleVideoIcon() {
                if(this.isVideoEnabled) {
                    return 'videocam'
                } else {
                    return 'videocam off';
                }
            },
            toggleMuteIcon() {
                if(this.isMuted) {
                    return 'volume off'
                } else {
                    return 'volume up';
                }
            },
            mediaPreviewClasses() {
                var classes = [];
                if(this.isEstablished && this.hasRemoteVideo) {
                    classes.push('csc-media-preview');
                }
                return classes;
            },
            formattedPhoneNumber: {
                get() {
                    return normalizeNumber(this.phoneNumber);
                },
                set(value) {
                    this.validationEnabled = true;
                    this.phoneNumberError = false;
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
                'getEndedReason',
                'hasRemoteVideo',
                'hasVideo',
                'isAudioEnabled',
                'isVideoEnabled',
                'isMuted'
            ]),
            hasLocalVideo() {
                return this.getLocalMediaType !== null && this.getLocalMediaType.match(/(v|V)ideo/) !== null;
            }
        }
    }
</script>

<style lang="stylus">
    @import '../../src/themes/app.variables.styl';
    @import '../../src/themes/quasar.variables.styl';

    .csc-call {
        width: inherit;
    }

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
    .csc-call-fullscreen .csc-call .q-card-title .text {
        color: white;
    }

    .csc-call .phone-number {
        font-size: 18px;
        text-align: center;
        color: #adb3b8;
        margin-bottom: 16px;
    }

    .csc-call-fullscreen .csc-call .phone-number {
        color: white;
    }

    .csc-call .ended-reason {
        font-size: 18px;
        text-align: center;
        color: #adb3b8;
    }

    .csc-call-media {
        position: relative;
    }

    .csc-media.csc-media-preview {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 25%;
        z-index: 10;
    }

</style>
