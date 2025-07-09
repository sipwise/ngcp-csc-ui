<template>
    <div
        :class="componentClasses"
    >
        <audio
            ref="callSound"
            loop
            playsinline
            preload="auto"
            src="ring.mp3"
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
                                v-if="isVideoCall"
                                class="csc-media-icon"
                                name="videocam"
                                size="24px"
                            />
                            <q-icon
                                v-else
                                class="csc-media-icon"
                                name="call"
                                size="24px"
                            />
                            <span
                                v-if="isInitiating"
                            >
                                {{ $t('Calling {number}...', { number: callDisplayName}) }}</span>
                            <span
                                v-else-if="isRinging"
                            >
                                {{ $t('Ringing at {number}...', { number: callDisplayName}) }}</span>
                            <span
                                v-else-if="isIncoming"
                            >
                                {{ $t('Incoming call from {number}...', { number: callDisplayName}) }}</span>
                        </div>
                        <div
                            v-else-if="isEnded"
                            class="csc-call-error"
                        >
                            {{ $filters.startCase(endedReason) }} ({{ callDisplayName }})
                        </div>
                    </div>
                </div>
            </div>
            <div
                v-else-if="isEstablished || isHolded"
                class="csc-call-info-established"
            >
                <div
                    class="row justify-center items-center"
                >
                    <q-icon
                        v-if="isVideoCall"
                        class="csc-media-icon"
                        name="videocam"
                        size="24px"
                    />
                    <q-icon
                        v-else
                        class="csc-media-icon"
                        name="call"
                        size="24px"
                    />
                    <div>
                        {{ $t('In call with {number}', { number: callDisplayName}) }}
                    </div>
                    <q-btn
                        v-if="!dialpadOpened"
                        class="csc-dialpad-button"
                        icon="dialpad"
                        round
                        small
                        color="default"
                        @click="toggleDialpad"
                    />
                    <q-btn
                        v-else
                        class="csc-dialpad-button"
                        icon="expand_more"
                        round
                        small
                        color="default"
                        @click="toggleDialpad"
                    />
                </div>
                <csc-call-dialpad
                    v-if="dialpadOpened"
                    :show-backspace-button="false"
                    :show-clear-button="false"
                    :transfer-call="transferEnabled"
                    @click="dialpadClick"
                />
            </div>
            <div
                ref="localMediaWrapper"
                class="csc-call-media-local"
            >
                <csc-media
                    v-show="isActive && !minimized && hasLocalVideo"
                    ref="localMedia"
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
                    :name="isHolded ? 'pause_circle_filled' : 'person'"
                    size="128px"
                    color="white"
                />
            </div>
            <csc-media
                v-show="hasRemoteVideo"
                ref="remoteMedia"
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
                class="row justify-center items-center"
                style="margin-top: -30px"
            >
                <q-btn
                    v-if="isHolded || isEstablished && !(isMobile && minimized)"
                    :color="colorToggleMicrophone"
                    :icon="iconToggleMicrophone"
                    class="q-mr-sm"
                    text-color="dark"
                    round
                    size="large"
                    @click="toggleMicrophone()"
                />
                <div
                    v-if="platformInfo.type != 'spce'"
                >
                    <q-btn
                        v-if="isHolded || isEstablished && !(isMobile && minimized)"
                        :color="colorToggleHold"
                        text-color="dark"
                        icon="pause_circle_filled"
                        class="q-mr-sm"
                        round
                        size="large"
                        :disable="isLocalOnHold || isRemoteOnHold || transferEnabled"
                        @click="toggleHold()"
                    />

                    <q-btn
                        v-if="isEstablished || isHolded && !(isMobile && minimized)"
                        :color="colorTransfer"
                        icon="phone_forwarded"
                        class="q-mr-sm"
                        text-color="dark"
                        round
                        size="large"
                        :disable="isLocalOnHold || isRemoteOnHold"
                        @click="initiateTransfer()"
                    />
                </div>
                <q-btn
                    v-if="isHolded || isEstablished && !(isMobile && minimized)"
                    :color="colorToggleCamera"
                    :icon="iconToggleCamera"
                    class="q-mr-sm"
                    text-color="dark"
                    round
                    size="large"
                    @click="toggleCamera()"
                />
                <q-btn
                    v-if="isHolded || isEstablished && !(isMobile && minimized)"
                    :color="colorToggleScreen"
                    icon="screen_share"
                    class="q-mr-sm"
                    text-color="dark"
                    round
                    size="large"
                    @click="toggleScreen()"
                />
                <q-btn
                    v-if="isHolded || isEstablished && !(isMobile && minimized)"
                    :color="colorToggleRemoteVolume"
                    :icon="iconToggleRemoteVolume"
                    class="q-mr-sm"
                    text-color="dark"
                    round
                    size="large"
                    @click="toggleRemoteVolume()"
                />
                <q-btn
                    v-if="isActive"
                    color="negative"
                    text-color="dark"
                    icon="call_end"
                    class="q-mr-sm"
                    round
                    size="large"
                    data-cy="end-call"
                    @click="endCall"
                />
                <q-btn
                    v-if="canClose"
                    color="negative"
                    text-color="dark"
                    icon="clear"
                    class="q-mr-sm"
                    round
                    size="large"
                    @click="closeCall()"
                />
                <q-btn
                    v-if="canStart"
                    :disabled="!isIncoming && (!isNumberInputDefined || microphoneNotAllowed)"
                    color="primary"
                    text-color="dark"
                    icon="call"
                    class="q-mr-sm"
                    round
                    size="large"
                    data-cy="start-call"
                    @click="startCall('audioOnly')"
                >
                    <q-tooltip
                        v-if="microphoneNotAllowed"
                        :delay="500"
                        class="text-dark"
                    >
                        {{ $t('No microphone authorized.') }}
                    </q-tooltip>
                </q-btn>
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
                        v-if="isActive && isVideoCall"
                        class="csc-media-icon"
                        name="videocam"
                        size="24px"
                        color="white"
                    />
                    <q-icon
                        v-else-if="isActive"
                        class="csc-media-icon"
                        name="call"
                        size="24px"
                        color="white"
                    />
                    <q-icon
                        v-else-if="isEnded"
                        class="csc-media-icon"
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
                            {{ callStateTitle }}
                        </div>
                        <div
                            class="csc-call-info-number"
                        >
                            {{ callDisplayName }}
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
                        {{ $filters.startCase(endedReason) }}
                    </div>
                    <div
                        class="csc-call-info-number"
                    >
                        {{ callDisplayName }}
                    </div>
                </div>
            </div>
            <q-btn
                v-if="isEstablished && minimized && !isMobile"
                class="csc-call-btn-fullscreen"
                icon="fullscreen"
                round
                color="default"
                @click="maximize"
            />
            <q-btn
                v-else-if="isEstablished && maximizable && !isMobile"
                class="csc-call-btn-fullscreen-small"
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
import CscCallDialpad from 'components/CscCallDialpad'
import CscMedia from 'components/CscMedia'
import { normalizeDestination } from 'src/filters/number-format'
import { showCallNotification } from 'src/helpers/ui'
import platformMixin from 'src/mixins/platform'
import { CallStateTitle } from 'src/store/call/common'
import { mapState } from 'vuex'

export default {
    name: 'CscCall',
    components: {
        CscCallDialpad,
        CscMedia
    },
    mixins: [
        platformMixin
    ],
    props: {
        callState: {
            type: String,
            required: true
        },
        callNumber: {
            type: String,
            required: true
        },
        phonebookEntryName: {
            type: String,
            required: true
        },
        numberInput: {
            type: String,
            required: true
        },
        endedReason: {
            type: String,
            default: null
        },
        fullView: {
            type: Boolean,
            default: false
        },
        localMediaStream: {
            type: MediaStream,
            default: null
        },
        remoteMediaStream: {
            type: MediaStream,
            default: null
        },
        minimized: {
            type: Boolean,
            default: false
        },
        closed: {
            type: Boolean,
            default: false
        },
        isVideoCall: {
            type: Boolean,
            default: false
        },
        hasLocalVideo: {
            type: Boolean,
            default: false
        },
        hasRemoteVideo: {
            type: Boolean,
            default: false
        },
        microphoneEnabled: {
            type: Boolean,
            default: false
        },
        cameraEnabled: {
            type: Boolean,
            default: false
        },
        screenEnabled: {
            type: Boolean,
            default: false
        },
        holdEnabled: {
            type: Boolean,
            default: false
        },
        transferEnabled: {
            type: Boolean,
            default: false
        },
        localOnHold: {
            type: Boolean,
            default: false
        },
        remoteOnHold: {
            type: Boolean,
            default: false
        },
        remoteVolumeEnabled: {
            type: Boolean,
            default: false
        },
        maximizable: {
            type: Boolean,
            default: false
        },
        dialpadOpened: {
            type: Boolean,
            default: false
        },
        menuMinimized: {
            type: Boolean,
            default: false
        }
    },
    emits: ['toggle-screen', 'toggle-camera', 'minimize-call', 'maximize-call', 'click-dialpad', 'toggle-remote-volume', 'toggle-microphone', 'toggle-holdon', 'toggle-state-transfer', 'toggle-dialpad', 'close-call', 'end-call', 'accept-call', 'start-call'],
    data () {
        return {
            localMediaWrapperWidth: 0,
            remoteMediaWrapperWidth: 0,
            microphoneNotAllowed: false,
            permissionState: ''
        }
    },
    computed: {
        ...mapState('user', [
            'platformInfo'
        ]),
        componentClasses () {
            const classes = [
                'transition-generic',
                'csc-call',
                `csc-call-${this.callState}`
            ]
            if (this.fullView) {
                classes.push('csc-call-full-width')
            }
            if (this.minimized) {
                classes.push('csc-call-minimized')
            }
            if (this.isVideoCall) {
                classes.push('csc-call-video')
            }
            if (this.isMobile) {
                classes.push('csc-call-mobile')
            }
            if (this.menuMinimized) {
                classes.push('csc-main-menu-minimized')
            }
            return classes
        },
        isCalling () {
            return this.isInitiating || this.isRinging || this.isIncoming
        },
        isActive () {
            return this.isCalling || this.isEstablished || this.isHolded
        },
        isInitiating () {
            return this.callState === 'initiating'
        },
        isRinging () {
            return this.callState === 'ringing'
        },
        isEstablished () {
            return this.callState === 'established'
        },
        isIncoming () {
            return this.callState === 'incoming'
        },
        isEnded () {
            return this.callState === 'ended'
        },
        isHolded () {
            return this.callState === 'hold'
        },
        canStart () {
            return this.callState === 'input' || this.callState === 'incoming'
        },
        canClose () {
            return this.callState === 'ended'
        },
        callNumberFormatted () {
            return normalizeDestination(this.callNumber)
        },
        callNumberQuery () {
            return normalizeDestination(this.$route.query.number)
        },
        callDisplayName () {
            return this.phonebookEntryName || this.callNumberFormatted || this.callNumberQuery
        },
        iconToggleMicrophone () {
            if (this.microphoneEnabled) {
                return 'mic'
            }
            return 'mic_off'
        },
        colorToggleMicrophone () {
            if (this.microphoneEnabled) {
                return 'primary'
            }
            return 'grey-1'
        },
        iconToggleCamera () {
            if (this.cameraEnabled) {
                return 'videocam'
            }
            return 'videocam_off'
        },
        colorToggleCamera () {
            if (this.cameraEnabled) {
                return 'primary'
            }
            return 'grey-1'
        },
        colorToggleScreen () {
            if (this.screenEnabled) {
                return 'primary'
            }
            return 'grey-1'
        },
        colorToggleHold () {
            if (this.holdEnabled && !this.remoteOnHold && !this.localOnHold) {
                return 'primary'
            }
            return 'grey-1'
        },
        colorTransfer () {
            if (this.transferEnabled) {
                return 'primary'
            }
            return 'grey-1'
        },
        iconToggleRemoteVolume () {
            if (this.remoteVolumeEnabled) {
                return 'volume_up'
            }
            return 'volume_off'
        },
        colorToggleRemoteVolume () {
            if (this.remoteVolumeEnabled) {
                return 'primary'
            }
            return 'grey-1'
        },
        callStateTitle () {
            return CallStateTitle[this.callState]
        },
        isNumberInputDefined () {
            return this.numberInput !== '' && this.numberInput !== null
        },
        isLocalOnHold () {
            return this.localOnHold
        },
        isRemoteOnHold () {
            return this.remoteOnHold
        }
    },
    watch: {
        callState (state) {
            if (state === 'ringing' || state === 'incoming') {
                this.playCallSound()
                if (state === 'incoming') {
                    showCallNotification(this.callDisplayName)
                }
            } else {
                this.stopCallSound()
            }
        },
        phonebookEntryName (name, oldName) {
            if (oldName !== name) {
                this.$nextTick(() => {
                    showCallNotification(name)
                })
            }
        },
        closed (closed) {
            if (closed && this.$refs.startButton) {
                this.$refs.startButton.hide()
            }
        },
        minimized () {
            this.fetchLocalMediaWrapperWidth()
            this.fetchRemoteMediaWrapperWidth()
            this.$nextTick(() => {
                this.fitMedia()
            })
        }
    },
    async mounted () {
        const fetchMediaWrapperWidth = () => {
            this.fetchLocalMediaWrapperWidth()
            this.fetchRemoteMediaWrapperWidth()
        }
        fetchMediaWrapperWidth()
        this.emitter.$on('window-resized', fetchMediaWrapperWidth)
        this.emitter.$on('content-resized', fetchMediaWrapperWidth)
        this.emitter.$on('orientation-changed', fetchMediaWrapperWidth)
        if (!navigator.userAgent.includes('Firefox')) {
            const permission = await navigator.permissions.query({ name: 'microphone' })
            this.permissionState = permission.state
            this.microphoneNotAllowed = this.permissionState === 'denied'
            permission.onchange = (event) => {
                if (this.permissionState === 'prompt' && event.target.state === 'denied') {
                    this.closeCall()
                }
                this.permissionState = permission.state
                this.microphoneNotAllowed = event.target.state === 'denied'
            }
        }
    },
    methods: {
        fetchLocalMediaWrapperWidth () {
            if (this.$refs.localMediaWrapper) {
                this.localMediaWrapperWidth = this.$refs.localMediaWrapper.clientWidth
            } else {
                this.localMediaWrapperWidth = 0
            }
        },
        fetchRemoteMediaWrapperWidth () {
            if (this.$refs.remoteMediaWrapper) {
                this.remoteMediaWrapperWidth = this.$refs.remoteMediaWrapper.clientWidth
            } else {
                this.remoteMediaWrapperWidth = 0
            }
        },
        startCall (media) {
            if (this.callState === 'input') {
                this.$emit('start-call', media)
            } else if (this.callState === 'incoming') {
                this.$emit('accept-call', media)
            }
        },
        endCall (event) {
            event.stopPropagation()
            this.$emit('end-call')
        },
        closeCall () {
            this.$emit('close-call')
        },
        playCallSound () {
            this.$refs.callSound.play()
        },
        stopCallSound () {
            this.$refs.callSound.pause()
        },
        toggleDialpad () {
            this.$emit('toggle-dialpad')
        },
        toggleMicrophone () {
            this.$emit('toggle-microphone')
        },
        toggleHold () {
            this.$emit('toggle-holdon')
        },
        toggleRemoteVolume () {
            this.$emit('toggle-remote-volume')
        },
        dialpadClick (value) {
            this.$emit('click-dialpad', value)
        },
        maximize () {
            this.$emit('maximize-call')
        },
        minimize () {
            this.$emit('minimize-call')
        },
        maximizeMobile () {
            if (this.isMobile && this.isEstablished) {
                this.maximize()
            }
        },
        fitMedia () {
            this.fetchLocalMediaWrapperWidth()
            this.fetchRemoteMediaWrapperWidth()
            this.$nextTick(() => {
                if (this.$refs.localMedia) {
                    this.$refs.localMedia.fitMedia()
                }
                if (this.$refs.remoteMedia) {
                    this.$refs.remoteMedia.fitMedia()
                }
            })
        },
        toggleCamera () {
            this.$emit('toggle-camera')
        },
        toggleScreen () {
            this.$emit('toggle-screen')
        },
        initiateTransfer () {
            this.$emit('toggle-state-transfer')
            this.toggleDialpad()
            this.toggleHold()
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">

.csc-call
    left: $layout-aside-left-width
    top: 0
    position: fixed
    bottom: 0
    right: 0
    z-index: 40
    .q-btn.q-btn-round
        box-shadow: none
    .csc-call-content
        position: absolute
        bottom: $call-footer-height
        top: 0
        right: 0
        left: 0
        z-index: 2
        background-color: $secondary
        .csc-call-info
            .csc-call-info-content
                margin-top: -80px
                .csc-call-error
                    color: $negative
                .csc-call-spinner
                    margin-bottom: $flex-gutter-sm
        .csc-call-media-local
            position: absolute
            bottom: $flex-gutter-sm
            left: $flex-gutter-sm
            width: 20%
            height: auto
            overflow: hidden
            z-index: 2
            font-size: 0
        .csc-call-info-established
            position: absolute
            bottom: $call-footer-action-margin * 2
            right: 0
            left: 0
            justify-items: center
            z-index: 3
            color: white
            .csc-media-icon
                margin-right: $flex-gutter-xs
            .csc-dialpad-button
                vertical-align: center
                margin-left: $flex-gutter-sm
        .csc-call-info-hold
            position: absolute
            bottom: $call-footer-action-margin * 2
            right: 0
            left: 0
            justify-items: center
            z-index: 3
            color: white
            .csc-media-icon
                margin-right: $flex-gutter-xs
            .csc-dialpad-button
                vertical-align: center
                margin-left: $flex-gutter-sm
    .csc-call-media-remote
        position: absolute
        top: 0
        bottom: $call-footer-height
        right: 0
        left: 0
        z-index: 1
        background-color: black
        font-size: 0
        .csc-call-media-icon
            opacity: 0.5
    .csc-call-content-minimized
        position: absolute
        bottom: 0
        left: 0
        right: 0
        height: $call-footer-height
        background-color: $call-minimized-background
        z-index: 3
        display: block
        flex-wrap: no-wrap
        align-items: center
        justify-content: center
        .csc-call-info-minimized
            display: flex
            flex-wrap: no-wrap
            align-items: center
            margin-bottom: -16px
            .csc-call-info-text
                color: white
                padding-left: $flex-gutter-xs
                .csc-call-info-phrase
                    margin-bottom: 4px
                .csc-call-info-number
                    font-size: 14px
            .csc-call-info-loading
                margin-right: $flex-gutter-sm
        .csc-call-btn-fullscreen
            position: absolute
            right: $flex-gutter-md
            top: 50%
            bottom: 50%
            margin-top: -27px
        .csc-call-btn-fullscreen-small
            position: absolute
            right: $flex-gutter-sm
            top: 50%
            bottom: 50%
            margin-top: -20px
        .csc-call-actions
            position: absolute
            left: 0
            right: 0
            top: $call-footer-action-margin * -1
            .q-btn
                .q-btn-inner
                    color: $dark
            .q-btn.q-btn-round
                box-shadow: none
            .csc-call-button
                margin-right: $flex-gutter-sm
            .csc-call-button:last-child
                margin-right: 0
        .csc-phone-number
            color: white
            text-align: center
.csc-call.csc-call-input
    top: auto
    height: $call-footer-height
    .csc-call-content
        bottom: 0
        height: 0
        visibility: hidden
    .csc-call-media-remote
        bottom: 0
        height: 0
        visibility: hidden
.csc-call.csc-call-established
    .csc-call-content
        background-color: transparent
.csc-call.csc-call-hold
    .csc-call-content
        background-color: transparent
.csc-call.csc-call-minimized
    opacity: 0
    height: $call-footer-height-big
    top: auto
    bottom: ($call-footer-height-big + $call-footer-action-margin) * -1
    .csc-call-content
        bottom: 0
        height: 0
        visibility: hidden
    .csc-call-media-remote
        top: auto
        bottom: $call-footer-height-big + $flex-gutter-sm
        right: $flex-gutter-sm
        left: auto
        height: auto
        width: 20%
        z-index: 1
        font-size: 0
    .csc-call-content-minimized
        height: $call-footer-height-big
        .csc-call-actions
            top: $call-footer-action-margin * -1
.csc-call.csc-call-minimized.csc-call-incoming,
.csc-call.csc-call-minimized.csc-call-initiating,
.csc-call.csc-call-minimized.csc-call-ringing
    .csc-call-actions
        margin-bottom: 8px
.csc-call.csc-call-minimized.csc-call-incoming,
.csc-call.csc-call-minimized.csc-call-initiating,
.csc-call.csc-call-minimized.csc-call-ringing,
.csc-call.csc-call-minimized.csc-call-established,
.csc-call.csc-call-minimized.csc-call-hold,
.csc-call.csc-call-minimized.csc-call-ended
    bottom: 0
    opacity: 1
.csc-call.csc-call-full-width
    left: 0
.csc-call.csc-main-menu-minimized
    left: $main-menu-minimized-width
.csc-call.csc-call-mobile
    .csc-call-content
        .csc-call-media-local
            font-size: 0
            top: $flex-gutter-sm
            left: $flex-gutter-sm
            bottom: auto
            width: 30%
            height: auto
            overflow: hidden
.csc-call.csc-call-mobile.csc-call-minimized
    .csc-call-content-minimized
        height: $call-footer-height-big
.csc-call.csc-call-mobile.csc-call-minimized.csc-call-ended,
.csc-call.csc-call-mobile.csc-call-minimized.csc-call-established
    .csc-call-content-minimized
        height: $call-footer-height * 1.4
        justify-content: left
        padding-left: $flex-gutter-sm
        .csc-call-info-minimized
            margin-bottom: 0
        .csc-call-actions
            position: absolute
            margin: auto
            margin-top: -27px
            top: 50%
            right: $flex-gutter-sm
            left: auto
            .csc-call-button
                margin-right: $flex-gutter-sm
            .csc-call-button:last-child
                margin-right: 0

</style>
