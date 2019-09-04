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
                                name="call"
                                size="24px"
                            />
                            <span
                                v-if="isInitiating"
                            >
                                {{ $t('call.initiating', {number: callNumberFormatted}) }}</span>
                            <span
                                v-else-if="isRinging"
                            >
                                {{ $t('call.ringing', {number: callNumberFormatted}) }}</span>
                            <span
                                v-else-if="isIncoming"
                            >
                                {{ $t('call.incoming', {number: callNumberFormatted}) }}</span>
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
                        name="call"
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
                ref="localMediaWrapper"
                class="csc-call-media-local"
            >
                <csc-media
                    ref="localMedia"
                    v-show="isActive && !minimized && hasLocalVideo"
                    :muted="true"
                    :stream="localMediaStream"
                    :preview="true"
                    :width="localMediaWrapperWidth"
                />
            </div>
        </div>
        <div
            ref="remoteMediaWrapper"
            class="csc-call-media-remote"
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
                ref="remoteMedia"
                v-show="hasRemoteVideo"
                :muted="!remoteVolumeEnabled"
                :stream="remoteMediaStream"
                :preview="minimized"
                :width="remoteMediaWrapperWidth"
            />
        </div>
        <div
            class="csc-call-content-minimized transition-generic"
            @click="maximizeMobile"
        >
            <div
                class="csc-call-actions row justify-center"
            >
                <q-btn
                    v-if="isEstablished && !(isMobile && minimized)"
                    class="csc-call-button"
                    :color="colorToggleMicrophone"
                    :icon="iconToggleMicrophone"
                    round
                    @click="toggleMicrophone()"
                />
                <q-btn
                    v-if="isEstablished && hasLocalVideo && !(isMobile && minimized)"
                    class="csc-call-button"
                    :color="colorToggleCamera"
                    :icon="iconToggleCamera"
                    round
                    @click="toggleCamera()"
                />
                <q-btn
                    v-if="isEstablished && !(isMobile && minimized)"
                    class="csc-call-button"
                    :color="colorToggleRemoteVolume"
                    :icon="iconToggleRemoteVolume"
                    round
                    @click="toggleRemoteVolume()"
                />
                <q-btn
                    v-if="isActive"
                    class="csc-call-button"
                    color="negative"
                    icon="call_end"
                    round
                    @click="endCall"
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
                        v-if="!isMobile"
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
                        icon="call"
                        @click="startCall('audioOnly')"
                    />
                </q-fab>
            </div>
            <div
                v-if="minimized"
                class="csc-call-info-minimized"
            >
                <div
                    v-if="isCalling"
                    class="csc-call-info-loading"
                >
                    <q-spinner-rings
                        class="csc-call-spinner"
                        color="primary"
                        size="64px"
                    />
                </div>
                <div
                    class="csc-call-info-icon"
                >
                    <q-icon
                        class="csc-media-icon"
                        v-if="isActive && isVideoCall"
                        name="videocam"
                        size="24px"
                        color="white"
                    />
                    <q-icon
                        class="csc-media-icon"
                        v-else-if="isActive"
                        name="call"
                        size="24px"
                        color="white"
                    />
                    <q-icon
                        class="csc-media-icon"
                        v-else-if="isEnded"
                        name="error"
                        size="24px"
                        color="white"
                    />
                </div>
                <div
                    v-if="isActive"
                    class="csc-call-info-text"
                >
                    <div
                        v-if="isActive"
                    >
                        <div
                            class="csc-call-info-phrase"
                        >
                            {{ $t('call.' + callState + 'Short') }}
                        </div>
                        <div
                            class="csc-call-info-number"
                        >
                            {{ callNumberFormatted }}
                        </div>
                    </div>
                </div>
                <div
                    v-else-if="isEnded"
                    class="csc-call-info-text csc-call-error"
                >
                    <div
                        class="csc-call-info-phrase"
                    >
                        {{ endedReason | startCase }}
                    </div>
                    <div
                        class="csc-call-info-number"
                    >
                        {{ callNumberFormatted }}
                    </div>
                </div>
            </div>
            <q-btn
                class="csc-call-btn-fullscreen"
                v-if="isEstablished && minimized && !isMobile"
                icon="fullscreen"
                round
                color="default"
                @click="maximize"
            />
            <q-btn
                class="csc-call-btn-fullscreen-small"
                v-else-if="isEstablished && maximizable && !isMobile"
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
    import platformMixin from '../../mixins/platform'
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
            return {
                localMediaWrapperWidth: 0,
                remoteMediaWrapperWidth: 0
            }
        },
        mixins: [
            platformMixin
        ],
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
            'dialpadOpened',
            'menuMinimized'
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
        mounted() {
            let fetchMediaWrapperWidth = ()=>{
                this.fetchLocalMediaWrapperWidth();
                this.fetchRemoteMediaWrapperWidth();
            };
            fetchMediaWrapperWidth();
            this.$root.$on('window-resized', fetchMediaWrapperWidth);
            this.$root.$on('content-resized', fetchMediaWrapperWidth);
            this.$root.$on('orientation-changed', fetchMediaWrapperWidth);
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
                if(this.isMobile) {
                    classes.push('csc-call-mobile');
                }
                if(this.menuMinimized) {
                    classes.push('csc-main-menu-minimized');
                }
                return classes;
            },
            isCalling() {
                return this.isInitiating || this.isRinging || this.isIncoming;
            },
            isActive() {
                return this.isCalling || this.isEstablished;
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
            fetchLocalMediaWrapperWidth() {
                if(this.$refs.localMediaWrapper) {
                    this.localMediaWrapperWidth = this.$refs.localMediaWrapper.clientWidth;
                }
                else {
                    this.localMediaWrapperWidth = 0;
                }
            },
            fetchRemoteMediaWrapperWidth() {
                if(this.$refs.remoteMediaWrapper) {
                    this.remoteMediaWrapperWidth = this.$refs.remoteMediaWrapper.clientWidth;
                }
                else {
                    this.remoteMediaWrapperWidth = 0;
                }
            },
            startCall(media) {
                if(this.callState === 'input') {
                    this.$emit('start-call', media);
                }
                else if(this.callState === 'incoming') {
                    this.$emit('accept-call', media);
                }
            },
            endCall(event) {
                event.stopPropagation();
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
            },
            maximizeMobile() {
                if(this.isMobile && this.isEstablished) {
                    this.maximize();
                }
            },
            fitMedia() {
                this.fetchLocalMediaWrapperWidth();
                this.fetchRemoteMediaWrapperWidth();
                this.$nextTick(()=>{
                    if(this.$refs.localMedia) {
                        this.$refs.localMedia.fitMedia();
                    }
                    if(this.$refs.remoteMedia) {
                        this.$refs.remoteMedia.fitMedia();
                    }
                });
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
            },
            minimized() {
                this.fetchLocalMediaWrapperWidth();
                this.fetchRemoteMediaWrapperWidth();
                this.$nextTick(()=>{
                    this.fitMedia();
                });
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../themes/quasar.variables.styl'
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
            background-color $secondary
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
                height auto
                overflow hidden
                z-index 2
                font-size 0
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
            font-size 0
            .csc-call-media-icon
                opacity 0.5
        .csc-call-content-minimized
            position absolute
            bottom 0
            left 0
            right 0
            height $call-footer-height
            background-color $call-minimized-background
            z-index 3
            display flex
            flex-wrap no-wrap
            align-items center
            justify-content center
            .csc-call-info-minimized
                display flex
                flex-wrap no-wrap
                align-items center
                margin-bottom -16px
                .csc-call-info-text
                    color white
                    padding-left $flex-gutter-xs
                    .csc-call-info-phrase
                        margin-bottom 4px
                    .csc-call-info-number
                        font-size 14px
                .csc-call-info-loading
                    margin-right $flex-gutter-sm
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
                position absolute
                left 0
                right 0
                top $call-footer-action-margin * -1
                .q-btn
                    .q-btn-inner
                        color $dark
                .q-btn.q-btn-round
                    box-shadow none
                .csc-call-button
                    margin-right $flex-gutter-sm
                .csc-call-button:last-child
                    margin-right 0
            .csc-phone-number
                color white
                text-align center
    .csc-call.csc-call-input
        top auto
        height $call-footer-height
        .csc-call-content
            bottom 0
            height 0
            visibility hidden
        .csc-call-media-remote
            bottom 0
            height 0
            visibility hidden
    .csc-call.csc-call-established
        .csc-call-content
            background-color transparent
    .csc-call.csc-call-minimized
        opacity 0
        height $call-footer-height-big
        top auto
        bottom ($call-footer-height-big + $call-footer-action-margin) * -1
        .csc-call-content
            bottom 0
            height 0
            visibility hidden
        .csc-call-media-remote
            top auto
            bottom $call-footer-height-big + $flex-gutter-sm
            right $flex-gutter-sm
            left auto
            height auto
            width 20%
            z-index 1
            font-size 0
        .csc-call-content-minimized
            height $call-footer-height-big
            .csc-call-actions
                top $call-footer-action-margin * -1
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
        opacity 1
    .csc-call.csc-call-full-width
        left 0
    .csc-call.csc-main-menu-minimized
        left $main-menu-minimized-width
    .csc-call.csc-call-mobile
        .csc-call-content
            .csc-call-media-local
                font-size 0
                top $flex-gutter-sm
                left $flex-gutter-sm
                bottom auto
                width 30%
                height auto
                overflow hidden
    .csc-call.csc-call-mobile.csc-call-minimized
        .csc-call-content-minimized
            height $call-footer-height-big
    .csc-call.csc-call-mobile.csc-call-minimized.csc-call-ended,
    .csc-call.csc-call-mobile.csc-call-minimized.csc-call-established
        .csc-call-content-minimized
            height $call-footer-height * 1.4
            justify-content left
            padding-left $flex-gutter-sm
            .csc-call-info-minimized
                margin-bottom 0
            .csc-call-actions
                position absolute
                margin auto
                margin-top -27px
                top 50%
                right $flex-gutter-sm
                left auto
                .csc-call-button
                    margin-right $flex-gutter-sm
                .csc-call-button:last-child
                    margin-right 0

</style>
