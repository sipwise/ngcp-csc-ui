<template>
    <q-layout
        id="csc-layout-conference"
        view="lHh lpR lFf"
    >
        <q-header
            id="csc-header-conference"
            class="bg-transparent"
        >
            <q-toolbar
                id="csc-header-toolbar-conference"
                class="bg-transparent"
            >
                <div
                    v-if="isJoined"
                    class="q-mr-md text-h6"
                >
                    <q-icon
                        name="meeting_room"
                        size="24px"
                    />
                    {{ conferenceId }}
                </div>
                <q-space />
                <div
                    v-if="isJoined"
                    class="q-mr-md text-h6"
                >
                    <q-icon
                        name="person"
                        size="24px"
                    />
                    {{ selectedParticipantName }}
                </div>
                <q-space />
                <q-btn
                    color="tertiary"
                    icon="clear"
                    unelevated
                    dense
                    @click="close()"
                />
            </q-toolbar>
        </q-header>
        <q-page-container
            id="csc-page-conference"
        >
            <q-page
                class="full-width row wrap justify-center items-start content-center"
            >
                <csc-conference-join
                    v-if="!isJoined"
                    class="bg-main-menu q-pa-lg"
                    style="z-index: 11"
                    :conference-id="conferenceId"
                    :has-conference-id="hasConferenceId"
                    :conference-url="conferenceUrl"
                    :local-media-stream="localMediaStream"
                    :is-microphone-enabled="isMicrophoneEnabled"
                    :is-camera-enabled="isCameraEnabled"
                    :is-screen-enabled="isScreenEnabled"
                    :is-media-enabled="isMediaEnabled"
                    :is-joining="isJoining"
                    :is-joined="isJoined"
                    :has-rtc-engine-capability-enabled="hasRtcEngineCapabilityEnabled"
                    @join="join"
                />
                <csc-conference-joined
                    v-if="!isJoining && isJoined"
                    style="z-index: 10"
                />
                <div
                    class="absolute-full"
                >
                    <csc-media
                        v-show="showMainMedia"
                        ref="localMedia"
                        :muted="true"
                        :stream="localMediaStream"
                        :preview="false"
                    />
                </div>
                <csc-confirm-dialog
                    ref="confirmDialog"
                    title-icon="exit_to_app"
                    :title="$t('Leave conference')"
                    :message="$t('Leave current conference now!')"
                    @confirm="leave"
                />
            </q-page>
        </q-page-container>
        <q-drawer
            id="csc-conference-participants"
            side="right"
            :value="isJoined"
            :width="150"
            :mini-width="50"
        >
            <csc-conference-participants
                ref="confParticipants"
                class="no-margin q-mb-lg"
            />
        </q-drawer>
        <q-footer
            id="csc-footer-conference"
            class="bg-footer"
        >
            <q-toolbar>
                <q-space />
                <q-btn
                    :color="microphoneButtonColor"
                    class="text-dark q-mr-md"
                    style="margin-top: -60px"
                    icon="mic"
                    round
                    size="large"
                    :disable="!hasConferenceId || isJoining || !hasRtcEngineCapabilityEnabled"
                    @click="toggleMicrophone()"
                />
                <q-btn
                    :color="cameraButtonColor"
                    class="text-dark q-mr-md"
                    style="margin-top: -60px"
                    icon="videocam"
                    round
                    size="large"
                    :disable="!hasConferenceId || isJoining || !hasRtcEngineCapabilityEnabled"
                    @click="toggleCamera()"
                />
                <q-btn
                    :color="screenButtonColor"
                    class="text-dark q-mr-md"
                    style="margin-top: -60px"
                    icon="screen_share"
                    round
                    size="large"
                    :disable="!hasConferenceId || isJoining || !hasRtcEngineCapabilityEnabled"
                    @click="toggleScreen()"
                />
                <q-btn
                    v-if="isJoined"
                    :color="screenButtonColor"
                    style="margin-top: -60px"
                    icon="more_vert"
                    round
                    size="large"
                    :disable="!hasConferenceId || isJoining || !hasRtcEngineCapabilityEnabled"
                >
                    <q-menu
                        ref="popover"
                        :auto-close="true"
                        :disable="conferenceHasParticipants"
                    >
                        <q-list
                            link
                            class="no-border"
                        >
                            <q-item
                                class="cursor-pointer"
                            >
                                <q-item-section
                                    @click="toggleMuteAll()"
                                >
                                    <q-item-label>{{ muteLabel }}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-menu>
                </q-btn>
                <q-space />
            </q-toolbar>
        </q-footer>
    </q-layout>
</template>

<script>
import _ from 'lodash'
import {
    mapGetters,
    mapState,
    mapActions
} from 'vuex'
import CscConferenceJoin from 'components/pages/Conference/CscConferenceJoin'
import CscConferenceJoined from 'components/pages/Conference/CscConferenceJoined'
import CscMedia from 'components/CscMedia'
import CscConfirmDialog from 'components/CscConfirmationDialog'
// import CscConferenceLocalParticipant from 'components/pages/Conference/CscConferenceLocalParticipant'
import CscConferenceParticipants from 'components/pages/Conference/CscConferenceParticipants'

export default {
    name: 'CscConferenceLayout',
    components: {
        // CscConferenceLocalParticipant,
        CscConferenceParticipants,
        CscConfirmDialog,
        CscMedia,
        CscConferenceJoin,
        CscConferenceJoined
    },
    data: function () {
        return {
            selectedMediaStream: null,
            selectedParticipantName: null
        }
    },
    computed: {
        ...mapGetters('call', [
            'hasRtcEngineCapabilityEnabled'
        ]),
        ...mapState('conference', [
            'selectedParticipant'
        ]),
        ...mapGetters('conference', [
            'conferenceId',
            'conferenceUrl',
            'hasConferenceId',
            'isConferencingEnabled',
            'isJoined',
            'isJoining',
            'isMicrophoneEnabled',
            'isCameraEnabled',
            'isScreenEnabled',
            'isMediaEnabled',
            'localParticipant',
            'localMediaStream',
            'participantsList',
            'remoteParticipant',
            'remoteMediaStream',
            'remoteMediaStreams',
            'hasRemoteVideo',
            'mutedState'
        ]),
        ...mapGetters('user', [
            'getUsername'
        ]),
        microphoneButtonColor () {
            if (this.isMicrophoneEnabled) {
                return 'primary'
            } else {
                return 'grey'
            }
        },
        cameraButtonColor () {
            if (this.isCameraEnabled) {
                return 'primary'
            } else {
                return 'grey'
            }
        },
        screenButtonColor () {
            if (this.isScreenEnabled) {
                return 'primary'
            } else {
                return 'grey'
            }
        },
        selectedHasVideo () {
            if (this.selectedParticipant === 'local') {
                return this.isVideoEnabled
            } else {
                return this.hasRemoteVideo(this.selectedParticipant)
            }
        },
        showMainMedia () {
            return (!this.isJoined && this.isVideoEnabled) || this.selectedHasVideo
        },
        isVideoEnabled () {
            return this.isMediaEnabled && (this.isCameraEnabled || this.isScreenEnabled)
        },
        conferenceHasParticipants () {
            return Object.keys(this.participantsList).length < 1
        },
        muteLabel () {
            return _.isEmpty(this.mutedState)
                ? this.$t('Mute all')
                : this.$t('Unmute all')
        }
    },
    watch: {
        hasConferenceId (value) {
            if (!value) {
                this.$store.commit('conference/disposeLocalMedia')
            }
        },
        selectedParticipant: {
            handler: function (participant) {
                if (participant) {
                    this.showSelectedParticipant(participant)
                }
            },
            deep: true
        },
        localMediaStream (stream) {
            if (this.$refs.localMedia && (stream === null || stream === undefined)) {
                this.$refs.localMedia.reset()
            }
        }
    },
    methods: {
        ...mapActions('conference', [
            'leave'
        ]),
        close () {
            if (!this.isJoined) {
                this.$router.push({ path: '/user/home' })
                this.$store.commit('conference/disposeLocalMedia')
            } else {
                this.$refs.confirmDialog.open()
            }
        },
        toggleMicrophone () {
            if (this.hasConferenceId) {
                this.$store.dispatch('conference/toggleMicrophone')
            }
        },
        toggleCamera () {
            if (this.hasConferenceId) {
                this.$store.dispatch('conference/toggleCamera')
            }
        },
        toggleScreen () {
            if (this.hasConferenceId) {
                this.$store.dispatch('conference/toggleScreen')
            }
        },
        toggleMuteAll () {
            if (_.isEmpty(this.mutedState)) {
                this.$store.dispatch('conference/muteAll')
            } else {
                this.$store.dispatch('conference/unMuteAll')
            }
        },
        async join (conferenceId) {
            if (this.hasConferenceId) {
                await this.$store.dispatch('conference/join', conferenceId)
            }
        },
        showSelectedParticipant (participant) {
            if (this.$refs.localMedia) {
                switch (participant) {
                case 'local':
                    if (this.localParticipant) {
                        this.selectedParticipantName = this.localParticipant.displayName
                        this.selectedMediaStream = this.localMediaStream
                        this.$refs.localMedia.assignStream(this.selectedMediaStream)
                    }
                    break
                default:
                    this.selectedMediaStream = this.remoteMediaStream(participant)
                    this.$refs.localMedia.assignStream(this.selectedMediaStream)
                    this.selectedParticipantName = this.remoteParticipant(participant) ? this.remoteParticipant(participant).displayName : ''
                    break
                }
            }
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    #csc-conf-selected-participant-name
        position absolute
        top 20px
        bottom 0
        right 0
        left 0
        z-index 2
        background-color $conf-participant-box-color
        color $primary
        font-size 20px
        width 130px
        height 45px
        padding 10px
        @media (max-width: $breakpoint-sm)
            font-size 16px
            width 100px
            height 36px
            padding 8px
    #csc-conf-main-media
        position absolute
        top 0
        bottom 0
        right 0
        left 0
        z-index 1
        background-color black
        font-size 0

    #csc-conf-header
        z-index 2
        top 0
        left 0
        right 0
        position fixed
        background-color transparent
        height $call-footer-height
        .csc-conf-button.q-btn
            .q-btn-inner
                color white
    #csc-conf-body
        position relative
        z-index 2
        top $call-footer-height
    #csc-conf-footer
        z-index 2
        bottom 0
        left 0
        right 0
        position fixed
        background-color $layout-aside-background
        height $call-footer-height

        #csc-conf-actions
            margin: -28px
            .q-btn:last-child
                margin-right 0
            .q-btn
                margin-right $flex-gutter-sm
</style>
