<template>
    <q-layout>

        <div
            id="csc-conf-header"
            class="csc-conf-full-height"
        >
            <div
                class="row justify-end"
            >
                <q-btn
                    class="csc-conf-button"
                    color="primary"
                    icon="clear"
                    flat
                    round
                    @click="close()"
                />
            </div>
        </div>
        <div
            id="csc-conf-body"
        >
            <csc-conference-join
                id="csc-conf-join"
                v-if="!isJoined"
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
                @join="join"
            />
            <csc-conference-joined
                v-if="!isJoining && isJoined"
            />
            <csc-conference-participants
              :participants="participantsList"
              :remote-media-streams="remoteMediaStreams"
              :is-joined="isJoined"
              :local-media-stream="localMediaStream"
            />
        </div>
        <div
            id="csc-conf-main-media"
            v-show="isMediaEnabled && (isCameraEnabled || isScreenEnabled)"
        >
            <csc-media
                ref="localMedia"
                :muted="true"
                :stream="localMediaStream"
                :preview="false"
            />
        </div>
        <div
            id="csc-conf-footer"
        >
            <div
                id="csc-conf-actions"
                class="row justify-center"
            >
                <q-btn
                    class="csc-conf-button"
                    :color="microphoneButtonColor"
                    icon="mic"
                    round
                    @click="toggleMicrophone()"
                    :disable="!hasConferenceId || isJoining"
                />
                <q-btn
                    class="csc-conf-button"
                    :color="cameraButtonColor"
                    icon="videocam"
                    round
                    @click="toggleCamera()"
                    :disable="!hasConferenceId || isJoining"
                />
                <q-btn
                    class="csc-conf-button"
                    :color="screenButtonColor"
                    icon="computer"
                    round
                    @click="toggleScreen()"
                    :disable="!hasConferenceId || isJoining"
                />
            </div>
        </div>
        <csc-confirm-dialog
            ref="confirmDialog"
            title-icon="exit_to_app"
            :title="$t('conferencing.exitDialogTitle')"
            :message="$t('conferencing.exitDialogText')"
            @confirm="leave"
        />
    </q-layout>
</template>

<script>
    import {
        mapGetters
    } from 'vuex'
    import CscConferenceJoin from '../pages/Conference/CscConferenceJoin'
    import CscConferenceJoined from '../pages/Conference/CscConferenceJoined'
    import CscConferenceParticipants from '../pages/Conference/CscConferenceParticipants'
    import CscMedia from "../CscMedia";
    import CscSpinner from "../CscSpinner";
    import {
        QLayout,
        QBtn
    } from 'quasar-framework'
    import CscConfirmDialog from "../CscConfirmationDialog";
    export default {
        data () {
            return {}
        },
        mounted() {
            this.$store.dispatch('user/initUser');
        },
        components: {
            CscConfirmDialog,
            CscSpinner,
            CscMedia,
            CscConferenceJoin,
            CscConferenceJoined,
            CscConferenceParticipants,
            QLayout,
            QBtn
        },
        computed: {
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
                'localMediaStream',
                'participantsList',
                'remoteMediaStreams'
            ]),
            microphoneButtonColor() {
                if(this.isMicrophoneEnabled) {
                    return 'primary';
                }
                else {
                    return 'grey';
                }
            },
            cameraButtonColor() {
                if(this.isCameraEnabled) {
                    return 'primary';
                }
                else {
                    return 'grey';
                }
            },
            screenButtonColor() {
                if(this.isScreenEnabled) {
                    return 'primary';
                }
                else {
                    return 'grey';
                }
            }
        },
        methods: {
            close() {
                if(!this.isJoined) {
                    this.$router.push({path: '/user/home'});
                    this.$store.commit('conference/disposeLocalMedia');
                }
                else {
                    this.$refs.confirmDialog.open();
                }

            },
            toggleMicrophone() {
                if(this.hasConferenceId) {
                    this.$store.dispatch('conference/toggleMicrophone');
                }
            },
            toggleCamera() {
                if(this.hasConferenceId) {
                    this.$store.dispatch('conference/toggleCamera');
                }
            },
            toggleScreen() {
                if(this.hasConferenceId) {
                    this.$store.dispatch('conference/toggleScreen');
                }
            },
            async join(conferenceId) {
                if(this.hasConferenceId) {
                    await this.$store.dispatch('conference/enableMicrophone');
                    this.$store.dispatch('conference/join', conferenceId);
                }
            },
            leave() {
                if(this.isJoined) {
                    this.$store.dispatch('conference/leave');
                }
            }
        },
        watch: {
            hasConferenceId(value) {
                if(!value) {
                    this.$store.commit('conference/disposeLocalMedia');
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../themes/app.common.styl'
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
