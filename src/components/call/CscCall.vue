<template>
    <div
        :class="componentClasses"
    >
        <div
            v-show="!minimized"
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
                        {{ $t('call.initiating', {number: callNumberFormatted}) }}
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
            isEstablished() {
                return this.callState === 'established';
            },
            canStart() {
                return this.callState === 'input';
            },
            canHangup() {
                return this.callState === 'initiating';
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
                this.$emit('start-call', media);
            },
            endCall() {
                this.$emit('end-call');
            },
            closeCall() {
                this.$emit('close-call');
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../themes/quasar.variables'
    .csc-call
        left $layout-aside-left-width
        top $toolbar-min-height
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
            height $toolbar-min-height
            background-color $secondary
        .csc-call-button
            margin-top -27px
            margin-right $flex-gutter-sm
        .csc-call-media-local
            position absolute
            bottom $toolbar-min-height + $flex-gutter-sm
            left $flex-gutter-sm
            width 20%
        .csc-call-info
            position absolute
            top 0
            right 0
            left 0
            bottom $toolbar-min-height
            .csc-call-error
                color $negative
            .csc-phone-number
                font-size 18px
            .csc-call-spinner
                margin-bottom $flex-gutter-md
    .csc-call.csc-call-minimized
        height $toolbar-min-height
        top auto
    .csc-call.csc-call-full-width
        left 0
</style>
