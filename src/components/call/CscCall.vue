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
            v-show="!minimized && (isInitiating || isRinging || isIncoming || isEnded)"
            class="csc-call-info"
        >
            <div
                class="row justify-center items-center full-height"
            >
                <div
                    class="col col-md-6 text-center"
                >
                    <q-spinner-rings
                        class="csc-call-spinner"
                        color="primary"
                        :size="64"
                    />
                    <div
                        class="csc-phone-number"
                    >
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
                        class="csc-call-error"
                    >
                        {{ endedReason | startCase }}
                    </div>
                </div>
            </div>
        </div>
        <csc-media
            v-show="isCalling && !minimized"
            class="csc-call-media-local"
            :muted="true"
            :stream="localMediaStream"
        />
        <csc-media
            v-show="isEstablished && !minimized"
            class="csc-call-media-remote"
            :muted="remoteMuted"
            :stream="remoteMediaStream"
        />
        <div
            class="csc-call-actions row justify-center transition-generic"
        >
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
                    icon="microphone"
                    @click="startCall('audioOnly')"
                />
            </q-fab>
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
        QSpinnerRings
    } from 'quasar-framework'
    import CscMedia from '../CscMedia'
    export default {
        name: 'csc-call',
        data() {
            return {
            }
        },
        props: [
            'callState',
            'callNumber',
            'endedReason',
            'fullView',
            'localMediaStream',
            'remoteMediaStream',
            'remoteMuted',
            'minimized'
        ],
        components: {
            QFab,
            QFabAction,
            QBtn,
            CscMedia,
            QSpinnerRings
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
            declineCall() {
                this.$emit('decline-call');
            },
            playCallSound() {
                this.$refs.incomingSound.play();
            },
            stopCallSound() {
                this.$refs.incomingSound.pause();
            },
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
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../themes/quasar.variables'
    $call-footer-height = $toolbar-min-height
    $call-footer-height-big = $call-footer-height * 2
    .csc-call
        left $layout-aside-left-width
        top $call-footer-height
        position fixed
        bottom 0
        right 0
        z-index 6000
        background-color white
        .csc-call-actions
            position absolute
            bottom 0
            left 0
            right 0
            height $call-footer-height
            background-color $secondary
            .csc-call-button
                margin-top -27px
                margin-right $flex-gutter-sm
            .csc-call-button:last-child
                margin-right 0
        .csc-call-media-local
            position absolute
            bottom $call-footer-height + $flex-gutter-sm
            left $flex-gutter-sm
            width 20%
        .csc-call-info
            position absolute
            top 0
            right 0
            left 0
            bottom $call-footer-height
            .csc-call-error
                color $negative
            .csc-phone-number
                font-size 18px
            .csc-call-spinner
                margin-bottom $flex-gutter-md
    .csc-call.csc-call-minimized
        height $call-footer-height
        top auto
    .csc-call.csc-call-minimized.csc-call-incoming,
    .csc-call.csc-call-minimized.csc-call-initiating,
    .csc-call.csc-call-minimized.csc-call-ringing
        height $call-footer-height-big
        top auto
        .csc-call-actions
            height $call-footer-height-big
        .csc-call-media-local
            bottom $call-footer-height-big + $flex-gutter-sm
        .csc-call-info
            bottom $call-footer-height-big
    .csc-call.csc-call-full-width
        left 0
</style>
