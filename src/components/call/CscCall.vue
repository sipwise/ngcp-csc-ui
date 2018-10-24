<template>
    <div
        :class="componentClasses"
    >
        <audio
            ref="callSound"
            loop
            playsinline
            preload="auto"
            src="statics/ring.mp3"
        />
        <div
            v-show="isContentVisible"
            class="csc-call-content"
        >
            <div
                v-if="isInitiating || isRinging || isIncoming || isEnded"
                class="csc-call-info full-height"
            >
                <div
                    class="row justify-center items-center full-height"
                >
                    <div
                        class="csc-call-info-content col col-md-6 text-center"
                    >
                        <q-spinner-rings
                            v-if="isInitiating || isRinging || isIncoming"
                            class="csc-call-spinner"
                            color="primary"
                            :size="64"
                        />
                        <div
                            v-if="isInitiating || isRinging || isIncoming"
                            class="csc-phone-number"
                        >
                            <q-icon
                                class="csc-media-icon"
                                v-if="isVideoCall"
                                name="videocam"
                                size="24px"
                            />
                            <q-icon
                                class="csc-media-icon"
                                v-else
                                name="mic"
                                size="24px"
                            />
                            <span
                                v-if="isInitiating"
                            >{{ $t('call.initiating', {number: callNumberFormatted}) }}</span>
                            <span
                                v-else-if="isRinging"
                            >{{ $t('call.ringing', {number: callNumberFormatted}) }}</span>
                            <span
                                v-else-if="isIncoming"
                            >{{ $t('call.incoming', {number: callNumberFormatted}) }}</span>
                        </div>
                        <div
                            v-else-if="isEnded"
                            class="csc-call-error"
                        >
                            {{ endedReason | startCase }} ({{callNumberFormatted}})
                        </div>
                    </div>
                </div>
            </div>
            <div
                v-else-if="isEstablished"
                class="csc-call-info-established"
            >
                <div
                    class="row justify-center items-center"
                >
                    <q-icon
                        class="csc-media-icon"
                        v-if="isVideoCall"
                        name="videocam"
                        size="24px"
                    />
                    <q-icon
                        class="csc-media-icon"
                        v-else
                        name="mic"
                        size="24px"
                    />
                    <div
                    >
                        {{ $t('call.established', {number: callNumberFormatted}) }}
                    </div>
                    <q-btn
                        v-if="!dialpadOpened"
                        class="csc-dialpad-button"
                        icon="dialpad"
                        round
                        small
                        @click="toggleDialpad"
                        color="default"
                    />
                    <q-btn
                        v-else
                        class="csc-dialpad-button"
                        icon="expand_more"
                        round
                        small
                        @click="toggleDialpad"
                        color="default"
                    />
                </div>
                <csc-call-dialpad
                    v-if="dialpadOpened"
                    :show-backspace-button="false"
                    :show-clear-button="false"
                    @click="dialpadClick"
                />
            </div>
            <div
                class="csc-call-media-local"
            >
                <csc-media
                    v-show="isCalling && !minimized && hasLocalVideo"
                    :muted="true"
                    :stream="localMediaStream"
                />
            </div>
        </div>
        <div
            v-show="isEstablished"
            class="csc-call-media-remote transition-generic"
        >
            <div
                v-show="!hasRemoteVideo && !minimized"
                class="csc-call-media-icon row justify-center items-center full-height"
            >
                <q-icon
                    name="person"
                    size="128px"
                    color="white"
                />
            </div>
            <csc-media
                v-show="hasRemoteVideo || minimized"
                :muted="!remoteVolumeEnabled"
                :stream="remoteMediaStream"
            />
        </div>
        <div
            class="csc-call-content-minimized transition-generic"
        >
            <div
                class="csc-call-actions row justify-center"
            >
                <q-btn
                    v-if="isEstablished"
                    class="csc-call-button"
                    :color="colorToggleMicrophone"
                    :icon="iconToggleMicrophone"
                    round
                    @click="toggleMicrophone()"
                />
                <q-btn
                    v-if="isEstablished && hasLocalVideo"
                    class="csc-call-button"
                    :color="colorToggleCamera"
                    :icon="iconToggleCamera"
                    round
                    @click="toggleCamera()"
                />
                <q-btn
                    v-if="isEstablished"
                    class="csc-call-button"
                    :color="colorToggleRemoteVolume"
                    :icon="iconToggleRemoteVolume"
                    round
                    @click="toggleRemoteVolume()"
                />
                <q-btn
                    v-if="canHangup"
                    class="csc-call-button"
                    color="negative"
                    icon="call_end"
                    round
                    @click="endCall()"
                />
                <q-btn
                    v-if="canClose"
                    class="csc-call-button"
                    color="negative"
                    icon="clear"
                    round
                    @click="closeCall()"
                />
                <q-fab
                    ref="startButton"
                    v-if="canStart"
                    class="csc-call-button"
                    color="primary"
                    icon="call"
                    direction="up"
                >
                    <q-fab-action
                        color="primary"
                        icon="computer"
                        @click="startCall('audioScreen')"
                    />
                    <q-fab-action
                        color="primary"
                        icon="videocam"
                        @click="startCall('audioVideo')"
                    />
                    <q-fab-action
                        color="primary"
                        icon="mic"
                        @click="startCall('audioOnly')"
                    />
                </q-fab>
            </div>
            <div
                v-if="minimized"
                class="csc-call-info-minimized"
            >
                <div
                    v-if="isInitiating || isRinging || isIncoming || isEstablished"
                    class="csc-phone-number"
                >
                    <q-spinner-rings
                        v-if="isInitiating || isRinging || isIncoming"
                        class="csc-call-spinner"
                        color="primary"
                        :size="64"
                    />
                    <q-icon
                        class="csc-media-icon"
                        v-if="isVideoCall"
                        name="videocam"
                        size="24px"
                    />
                    <q-icon
                        class="csc-media-icon"
                        v-else
                        name="mic"
                        size="24px"
                    />
                    <span
                        v-if="isInitiating"
                    >{{ $t('call.initiating', {number: callNumberFormatted}) }}</span>
                    <span
                        v-else-if="isRinging"
                    >{{ $t('call.ringing', {number: callNumberFormatted}) }}</span>
                    <span
                        v-else-if="isIncoming"
                    >{{ $t('call.incoming', {number: callNumberFormatted}) }}</span>
                    <span
                        v-else-if="isEstablished"
                    >{{ $t('call.established', {number: callNumberFormatted}) }}</span>
                </div>
                <div
                    v-if="isEnded"
                    class="csc-call-error"
                >
                    {{ endedReason | startCase }} ({{callNumberFormatted}})
                </div>
            </div>
            <q-btn
                class="csc-call-btn-fullscreen"
                v-if="isEstablished && minimized"
                icon="fullscreen"
                round
                color="default"
                @click="maximize"
            />
            <q-btn
                class="csc-call-btn-fullscreen-small"
                v-else-if="isEstablished && maximizable"
                icon="fullscreen_exit"
                round
                small
                color="default"
                @click="minimize"
            />
        </div>
    </div>
</template>

<script>
    import numberFormat from '../../filters/number-format'
    import {
        showCallNotification
    } from '../../helpers/ui'
    import {
        normalizeDestination
    } from '../../filters/number-format'
    import {
        QFab,
        QFabAction,
        QBtn,
        QSpinnerRings,
        QIcon
    } from 'quasar-framework'
    import CscMedia from '../CscMedia'
    import CscCallDialpad from "../CscCallDialpad";
    export default {
        name: 'csc-call',
        data() {
            return {}
        },
        props: [
            'callState',
            'callNumber',
            'endedReason',
            'fullView',
            'localMediaStream',
            'remoteMediaStream',
            'minimized',
            'closed',
            'isVideoCall',
            'hasLocalVideo',
            'hasRemoteVideo',
            'microphoneEnabled',
            'cameraEnabled',
            'remoteVolumeEnabled',
            'maximizable',
            'dialpadOpened'
        ],
        components: {
            CscCallDialpad,
            QFab,
            QFabAction,
            QBtn,
            CscMedia,
            QSpinnerRings,
            QIcon
        },
        computed: {
            componentClasses() {
                let classes = [
                    'transition-generic',
                    'csc-call',
                    'csc-call-' + this.callState
                ];
                if(this.fullView) {
                    classes.push('csc-call-full-width');
                }
                if(this.minimized) {
                    classes.push('csc-call-minimized');
                }
                if(this.isVideoCall) {
                    classes.push('csc-call-video');
                }
                return classes;
            },
            isCalling() {
                return this.callState === 'initiating' ||
                    this.callState === 'ringing' ||
                    this.callState === 'established';
            },
            isInitiating() {
                return this.callState === 'initiating';
            },
            isRinging() {
                return this.callState === 'ringing';
            },
            isEstablished() {
                return this.callState === 'established';
            },
            isIncoming() {
                return this.callState === 'incoming';
            },
            isEnded() {
                return this.callState === 'ended';
            },
            canStart() {
                return this.callState === 'input' || this.callState === 'incoming';
            },
            canHangup() {
                return this.isCalling || this.callState === 'incoming';
            },
            canClose() {
                return this.callState === 'ended';
            },
            callNumberFormatted() {
                return normalizeDestination(this.callNumber);
            },
            isContentVisible() {
                return (!this.minimized && (this.isInitiating ||
                    this.isRinging || this.isIncoming ||
                    this.isEnded || this.isEstablished));
            },
            iconToggleMicrophone() {
                if(this.microphoneEnabled) {
                    return 'mic';
                }
                else {
                    return 'mic_off';
                }
            },
            colorToggleMicrophone() {
                if(this.microphoneEnabled) {
                    return 'primary';
                }
                else {
                    return 'faded';
                }
            },
            iconToggleCamera() {
                if(this.cameraEnabled) {
                    return 'videocam';
                }
                else {
                    return 'videocam_off';
                }
            },
            colorToggleCamera() {
                if(this.cameraEnabled) {
                    return 'primary';
                }
                else {
                    return 'faded';
                }
            },
            iconToggleRemoteVolume() {
                if(this.remoteVolumeEnabled) {
                    return 'volume_up';
                }
                else {
                    return 'volume_off';
                }
            },
            colorToggleRemoteVolume() {
                if(this.remoteVolumeEnabled) {
                    return 'primary';
                }
                else {
                    return 'faded';
                }
            }
        },
        methods: {
            startCall(media) {
                if(this.callState === 'input') {
                    this.$emit('start-call', media);
                }
                else if(this.callState === 'incoming') {
                    this.$emit('accept-call', media);
                }
            },
            endCall() {
                this.$emit('end-call');
            },
            closeCall() {
                this.$emit('close-call');
            },
            playCallSound() {
                this.$refs.callSound.play();
            },
            stopCallSound() {
                this.$refs.callSound.pause();
            },
            toggleDialpad() {
                this.$emit('toggle-dialpad');
            },
            toggleMicrophone() {
                this.$emit('toggle-microphone');
            },
            toggleCamera() {
                this.$emit('toggle-camera');
            },
            toggleRemoteVolume() {
                this.$emit('toggle-remote-volume');
            },
            dialpadClick(value) {
                this.$emit('click-dialpad', value);
            },
            maximize() {
                this.$emit('maximize-call');
            },
            minimize() {
                this.$emit('minimize-call');
            }
        },
        watch: {
            callState(state) {
                if(state === 'ringing' || state === 'incoming') {
                    this.playCallSound();
                    if(state === 'incoming') {
                        showCallNotification(numberFormat(this.callNumber));
                    }
                }
                else {
                    this.stopCallSound();
                }
            },
            closed(closed) {
                if(closed && this.$refs.startButton) {
                    this.$refs.startButton.close();
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../themes/quasar.variables'
    $call-footer-height = $toolbar-min-height
    $call-footer-height-big = $call-footer-height * 2
    $call-footer-action-margin = 27px
    .csc-call
        left $layout-aside-left-width
        top $call-footer-height
        position fixed
        bottom 0
        right 0
        z-index 40
        .q-btn.q-btn-round
            box-shadow none
        .csc-call-content
            position absolute
            bottom $call-footer-height
            top 0
            right 0
            left 0
            z-index 2
            background-color white
            .csc-call-info
                .csc-call-info-content
                    margin-top -80px
                    .csc-call-error
                        color $negative
                    .csc-call-spinner
                        margin-bottom $flex-gutter-sm
            .csc-call-media-local
                position absolute
                bottom $flex-gutter-sm
                left $flex-gutter-sm
                width 20%
                z-index 2
            .csc-call-info-established
                position absolute
                bottom $call-footer-action-margin * 2
                right 0
                left 0
                justify-items center
                z-index 3
                color white
                .csc-media-icon
                    margin-right $flex-gutter-xs
                .csc-dialpad-button
                    vertical-align center
                    margin-left $flex-gutter-sm
        .csc-call-media-remote
            position absolute
            top 0
            bottom $call-footer-height
            right 0
            left 0
            z-index 1
            background-color black
            .csc-call-media-icon
                opacity 0.5
        .csc-call-content-minimized
            position absolute
            bottom 0
            left 0
            right 0
            height $call-footer-height
            background-color $secondary
            z-index 3
            .csc-call-btn-fullscreen
                position absolute
                right $flex-gutter-md
                top 50%
                bottom 50%
                margin-top -27px
            .csc-call-btn-fullscreen-small
                position absolute
                right $flex-gutter-sm
                top 50%
                bottom 50%
                margin-top -20px
            .csc-call-actions
                margin-top $call-footer-action-margin * -1
                .q-btn.q-btn-round
                    box-shadow none
                .csc-call-button
                    margin-right $flex-gutter-sm
                .csc-call-button:last-child
                    margin-right 0
            .csc-call-error
                color $negative
                text-align center
            .csc-phone-number
                color white
                text-align center
    .csc-call.csc-call-input
        top auto
    .csc-call.csc-call-established
        .csc-call-content
            background-color transparent
    .csc-call.csc-call-minimized
        height $call-footer-height-big
        top auto
        bottom ($call-footer-height-big + $call-footer-action-margin) * -1
        .csc-call-media-remote
            top auto
            bottom $call-footer-height-big + $flex-gutter-sm
            right $flex-gutter-sm
            left auto
            width 20%
            z-index 1
        .csc-call-content-minimized
            height $call-footer-height-big
            .csc-call-actions
                margin-bottom $call-footer-action-margin
    .csc-call.csc-call-minimized.csc-call-incoming,
    .csc-call.csc-call-minimized.csc-call-initiating,
    .csc-call.csc-call-minimized.csc-call-ringing
        .csc-call-actions
            margin-bottom 8px
    .csc-call.csc-call-minimized.csc-call-incoming,
    .csc-call.csc-call-minimized.csc-call-initiating,
    .csc-call.csc-call-minimized.csc-call-ringing,
    .csc-call.csc-call-minimized.csc-call-established,
    .csc-call.csc-call-minimized.csc-call-ended
        bottom 0
    .csc-call.csc-call-full-width
        left 0
</style>
