<template>
    <div :class="callClasses">
        <audio
            ref="incomingSound"
            loop
            playsinline
            preload="auto"
            src="statics/ring.mp3"
        />
        <div
            v-if="!isMobile"
            class="csc-call-top-actions absolute-top-right"
        >
            <q-btn
                v-if="isFullscreenEnabled && !isMobile"
                round
                :small="!isFullscreenEnabled"
                slot="right"
                class="no-shadow"
                @click="toggleFullscreen()"
                icon="fullscreen exit"
                color="default"
            />
            <q-btn
                v-else-if="!isMobile"
                round
                :small="!isFullscreenEnabled"
                slot="right"
                class="no-shadow"
                @click="toggleFullscreen()"
                icon="fullscreen"
                color="default"
            />
            <q-btn
                round
                :small="!isFullscreenEnabled"
                slot="right"
                class="no-shadow"
                @click="close()"
                icon="clear"
                color="default"
            />
        </div>
        <div
            class="csc-call-spinner row justify-center"
            v-if="isRinging || isInitiating || isIncoming"
        >
            <q-spinner-rings
                color="primary"
                :size="50"
            />
        </div>
        <q-alert
            v-if="desktopSharingInstall"
            v-model="desktopSharingInstall"
            color="warning"
            :actions="desktopSharingAlertActions"
        >
            {{ $t('call.desktopSharingNotInstalled') }}
        </q-alert>
        <csc-phone-number-input
            v-if="isPreparing"
            class="csc-phone-number-input"
            ref="phoneNumberInput"
            :enabled="isPhoneNumberInputEnabled"
            :dialpad-button="true"
            @toggle-dialpad="toggleDialpad()"
            @key-return="call('audioOnly')"
        />
        <div
            v-if="!isPreparing"
            class="csc-phone-number"
        >
            <q-icon
                v-if="isCalling && (localMediaType == 'audioVideo' || remoteMediaType == 'audioVideo')"
                name="videocam"
                color="primary"
                size="26px"
            />
            <q-icon
                v-else-if="isCalling && (localMediaType == 'audioOnly' || remoteMediaType == 'audioVideo')"
                name="mic"
                color="primary"
                size="26px"
            />
            {{ getNumber | destinationFormat }}
        </div>
        <div
            v-if="isEnded"
            class="csc-call-ended-reason"
        >
            {{ getEndedReason | startCase }}
        </div>
        <div
            :class="callMediaClasses"
            v-show="isCalling || isEstablished"
        >
            <csc-media
                class="csc-media-local"
                id="local-media"
                :muted="true"
                v-show="isCalling"
                :stream="localMediaStream"
            />
            <csc-media
                class="csc-media-remote"
                id="remote-media"
                :muted="isMuted"
                v-show="isEstablished"
                :stream="remoteMediaStream"
            />
        </div>
        <div
            :class="callControlClasses"
        >
            <csc-call-dialpad
                class="csc-call-dialpad"
                v-if="isDialpadEnabled"
                @inserted="dialpadInserted"
                @remove="dialpadRemove"
                @remove-all="dialpadRemoveAll"
            />
            <div
                class="csc-call-actions"
            >
                <q-btn
                    v-if="isEstablished"
                    round
                    :small="!isFullscreenEnabled"
                    color="primary"
                    @click="toggleAudio()"
                    :icon="toggleAudioIcon"
                />
                <q-btn
                    v-if="isEstablished && localMediaType == 'audioVideo'"
                    round
                    :small="!isFullscreenEnabled"
                    color="primary"
                    @click="toggleVideo()"
                    :icon="toggleVideoIcon"
                />
                <q-btn
                    v-if="isEstablished"
                    round
                    :small="!isFullscreenEnabled"
                    color="primary"
                    @click="toggleMute()"
                    :icon="toggleMuteIcon"
                />
                <q-btn
                    v-if="isPreparing"
                    round
                    :small="!isFullscreenEnabled"
                    color="primary"
                    @click="call('audioOnly')"
                    icon="mic"
                />
                <q-btn
                    v-if="isPreparing"
                    round
                    :small="!isFullscreenEnabled"
                    color="primary"
                    @click="call('audioVideo')"
                    icon="videocam"
                />
                <q-btn
                    v-if="isPreparing && !isMobile"
                    round
                    :small="!isFullscreenEnabled"
                    color="primary"
                    @click="call('audioScreen')"
                    icon="computer"
                />
                <q-btn
                    v-if="isCalling"
                    round
                    :small="!isFullscreenEnabled"
                    color="negative"
                    @click="hangUp()"
                    icon="call end"
                />
                <q-btn
                    v-if="isEnded"
                    round
                    :small="!isFullscreenEnabled"
                    color="negative"
                    @click="init()"
                    icon="clear"
                />
                <q-btn
                    v-if="isIncoming"
                    round
                    :small="!isFullscreenEnabled"
                    color="primary"
                    @click="accept('audioOnly')"
                    icon="mic"
                />
                <q-btn
                    v-if="isIncoming"
                    round
                    :small="!isFullscreenEnabled"
                    color="primary"
                    @click="accept('audioVideo')"
                    icon="videocam"
                />
                <q-btn
                    v-if="isIncoming && !isMobile"
                    round
                    :small="!isFullscreenEnabled"
                    color="primary"
                    @click="accept('audioScreen')"
                    icon="computer"
                />
                <q-btn
                    v-if="isIncoming"
                    round
                    :small="!isFullscreenEnabled"
                    color="negative"
                    @click="decline()"
                    icon="call end"
                />
            </div>
        </div>
    </div>
</template>

<script>
    import platformMixin from '../mixins/platform'
    import { mapGetters } from 'vuex'
    import CscMedia from './CscMedia'
    import numberFormat from '../filters/number-format'
    import { showCallNotification } from '../helpers/ui'
    import { getChromeExtensionUrl } from '../helpers/cdk-lib'
    import CscCallDialpad from './CscCallDialpad'
    import CscPhoneNumberInput from './call/CscPhoneNumberInput'
    import {
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
        Dialog,
        QAlert
    } from 'quasar-framework'

    export default {
        name: 'csc-call',
        props: ['region', 'fullscreen'],
        data () {
            return {
                phoneNumber: '',
                phoneNumberError: false,
                validationEnabled: false,
                dialpadEnabled: false
            }
        },
        mixins: [
            platformMixin
        ],
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
            QAlert,
            CscCallDialpad,
            CscPhoneNumberInput
        },
        mounted() {
            this.dialpadEnabled = this.isMobile;
        },
        methods: {
            dialpadInserted(value) {
                if(this.isEstablished) {
                    this.$store.dispatch('call/sendDTMF', value);
                }
                else {
                    this.$refs.phoneNumberInput.concat(value);
                }
            },
            dialpadRemove() {
                if(!this.isEstablished) {
                    this.$refs.phoneNumberInput.remove();
                }
            },
            dialpadRemoveAll() {
                if(!this.isEstablished) {
                    this.$refs.phoneNumberInput.removeAll();
                }
            },
            focusNumberInput() {
                this.$refs.phoneNumberInput.focusInput();
            },
            blurNumberInput() {
                this.$refs.phoneNumberInput.blurInput();
            },
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
                if(this.$refs.phoneNumberInput.hasPhoneNumber()) {
                    this.$store.dispatch('call/start', {
                        number: this.$refs.phoneNumberInput.getRawPhoneNumber(),
                        localMedia: localMedia
                    });
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
                }
                else {
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
                this.$refs.incomingSound.play();
            },
            stopIncomingSound() {
                this.$refs.incomingSound.pause();
            },
            toggleAudio() {
                if(this.isAudioEnabled) {
                    this.$store.dispatch('call/disableAudio');
                }
                else {
                    this.$store.dispatch('call/enableAudio');
                }
            },
            toggleVideo() {
                if(this.isVideoEnabled) {
                    this.$store.dispatch('call/disableVideo');
                }
                else {
                    this.$store.dispatch('call/enableVideo');
                }
            },
            toggleMute() {
                if(this.isMuted) {
                    this.$store.commit('call/unmute');
                }
                else {
                    this.$store.commit('call/mute');
                }
            },
            toggleFullscreen() {
                this.$emit('fullscreen');
            },
            toggleDialpad() {
                this.dialpadEnabled = !this.dialpadEnabled;
            }
        },
        computed: {
            isFullscreenEnabled() {
                return this.fullscreen;
            },
            toggleAudioIcon() {
                if(this.isAudioEnabled) {
                    return 'mic'
                }
                else {
                    return 'mic off';
                }
            },
            toggleVideoIcon() {
                if(this.isVideoEnabled) {
                    return 'videocam'
                }
                else {
                    return 'videocam off';
                }
            },
            toggleMuteIcon() {
                if(this.isMuted) {
                    return 'volume off'
                }
                else {
                    return 'volume up';
                }
            },
            localMediaStream() {
                if(this.$store.state.call.localMediaStream !== null) {
                    return this.$store.state.call.localMediaStream.getStream();
                }
                else {
                    return null;
                }
            },
            remoteMediaStream() {
                if(this.$store.state.call.remoteMediaStream !== null) {
                    return this.$store.state.call.remoteMediaStream.getStream();
                }
                else {
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
                'getEndedReason',
                'hasRemoteVideo',
                'hasVideo',
                'isAudioEnabled',
                'isVideoEnabled',
                'isMuted',
                'localMediaType',
                'remoteMediaType',
                'isCaller',
                'isCallee',
                'callState',
                'desktopSharingInstall'
            ]),
            desktopSharingAlertActions() {
                var self = this;
                return [
                    {
                        label: 'Install',
                        handler () {
                            self.$store.commit('call/desktopSharingInstallReset');
                            window.open(getChromeExtensionUrl());
                        }
                    },
                    {
                        label: 'Cancel',
                        handler () {
                            self.$store.commit('call/desktopSharingInstallReset');
                        }
                    }
                ]
            },
            isPhoneNumberInputEnabled () {
                return !(this.isDialpadEnabled && this.isMobile);
            },
            isDialpadEnabled() {
                return this.dialpadEnabled && (this.isPreparing || this.isEstablished);
            },
            callClasses() {
                let classes = ['csc-call', 'call-state-' + this.callState];
                if (this.isFullscreenEnabled) {
                   classes.push('csc-call-fullscreen');
                }
                if (this.isMobile) {
                    classes.push('csc-call-mobile');
                }
                return classes;
            },
            callMediaClasses() {
                let classes = ['csc-call-media'];
                if (this.hasVideo) {
                    classes.push('csc-call-media-video');
                }
                return classes;
            },
            callControlClasses() {
                let classes = ['csc-call-controls'];
                if(this.isFullscreenEnabled  && !this.isMobile) {
//                    classes.push('absolute-bottom');
                }
                return classes;
            }
        },
        watch: {
            isEstablished(established) {
                if(established) {
                    this.dialpadEnabled = false;
                }
            },
            callState(state) {
                if(state === 'incoming') {
                    showCallNotification(numberFormat(this.getNumber));
                    this.playIncomingSound();
                }
                else if (state === 'ringing') {
                    this.playIncomingSound();
                }
                else if (state === 'input') {
                    this.stopIncomingSound();
                    if(this.isMobile) {
                        this.dialpadEnabled = true;
                    }
                }
                else {
                    this.stopIncomingSound();
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../themes/quasar.variables.styl';
    .csc-call
        position relative
        z-index 2
        padding-top 64px
        height 100%
        .csc-call-top-actions
            z-index 10
            padding 16px
        .csc-phone-number-input
            position relative
            z-index 9
            margin 0
            padding 16px
        .csc-call-dialpad
            position relative
            z-index 8
            padding 16px
        .csc-call-actions
            display flex
            flex-direction row
            position relative
            z-index 7
            padding 16px
            padding-top 8px
            justify-content center
            .q-btn
                margin-right 16px
                display flex
            .q-btn:last-child
                margin-right 0
        .csc-call-ended-reason
            color indianred
            text-align center
            padding 16px
            padding-top 0
            position relative
            z-index 6
            font-size 16px
        .csc-phone-number
            text-align center
            padding 16px
            color white
            position relative
            z-index 6
            font-size 16px
            .q-icon
                vertical-align middle
        .csc-media-local
            position relative
        .csc-call-media.csc-call-media-video
            padding-top 16px
            padding-bottom 16px
            position relative
            z-index 2
        .csc-call-spinner
            position relative
            padding 16px
            z-index 3

    .csc-call.csc-call-fullscreen
        .csc-call-controls
            padding: 32px
            .csc-call-actions
                .q-btn
                    margin-right 16px
                .q-btn:last-child
                    margin-right 0
        .csc-call-media
            padding 0
            position absolute
            top 0
            left 0
            right 0
            bottom 0
            .csc-media-local
                position relative
                padding 0
                width: 100%
                height: 100%
        .csc-phone-number
            font-size: 20px
        .csc-call-ended-reason
            font-size: 20px
    .csc-call.csc-call-fullscreen.call-state-initiating,
    .csc-call.csc-call-fullscreen.call-state-ringing
        .csc-call-controls
            position absolute
            bottom 0
            right 0
            left 0
            background-color alpha($secondary, 0.4)
    .csc-call.call-state-established
        .csc-call-media
            .csc-media-local
                position absolute
                width 30%
                height auto
                z-index 2
                bottom 24px
                left 8px
                -webkit-box-shadow: 0px 0px 29px -4px rgba(0,0,0,0.75);
                -moz-box-shadow: 0px 0px 29px -4px rgba(0,0,0,0.75);
                box-shadow: 0px 0px 29px -4px rgba(0,0,0,0.75);
            .csc-media-remote
                position relative
                width 100%
                height 100%
                z-index 1
    .csc-call.csc-call-fullscreen.call-state-established
        .csc-call-media
            .csc-media-local
                bottom 16px
                left 16px
                width 20%
                -webkit-box-shadow: 0px 0px 29px -4px rgba(0,0,0,0.75);
                -moz-box-shadow: 0px 0px 29px -4px rgba(0,0,0,0.75);
                box-shadow: 0px 0px 29px -4px rgba(0,0,0,0.75);
        .csc-call-controls
            position absolute
            bottom 0
            right 0
            left 0
            background-color alpha($secondary, 0.4)

    .csc-call.csc-call-fullscreen.csc-call-mobile
        padding-top 0
        .csc-call-top-actions
            padding 8px
        .csc-phone-number-input
            margin 0
            padding 16px
        .csc-call-dialpad
            padding 4px
        .csc-call-actions
            padding 4px
            .q-btn
                margin-right 16px
            .q-btn:last-child
                margin-right 0

    .csc-call.csc-call-fullscreen.csc-call-mobile.call-state-established
        .csc-media-local
            bottom 120px
            left: 32px
        .csc-call-controls
            .csc-call-actions
                padding-bottom 0
</style>
