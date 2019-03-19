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
                :conferenceId="conferenceId"
                :local-media-stream="localMediaStream"
                :is-microphone-enabled="isMicrophoneEnabled"
                :is-camera-enabled="isCameraEnabled"
                :is-screen-enabled="isScreenEnabled"
                :is-media-enabled="isMediaEnabled"
            />
            <csc-conference-joined
                v-else
            >
            </csc-conference-joined>
        </div>
        <div
            id="csc-conf-main-media"
            v-show="isMediaEnabled"
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
                />
                <q-btn
                    class="csc-conf-button"
                    :color="cameraButtonColor"
                    icon="videocam"
                    round
                    @click="toggleCamera()"
                />
                <q-btn
                    class="csc-conf-button"
                    :color="screenButtonColor"
                    icon="computer"
                    round
                    @click="toggleScreen()"
                />
            </div>
        </div>
    </q-layout>
</template>

<script>
    import {
        mapGetters
    } from 'vuex'
    import CscConferenceJoin from '../pages/Conference/CscConferenceJoin'
    import CscConferenceJoined from '../pages/Conference/CscConferenceJoined'
    import CscMedia from "../CscMedia";
    import {
        QLayout,
        QBtn
    } from 'quasar-framework'
    export default {
        data () {
            return {}
        },
        mounted() {
            this.$store.dispatch('user/initUser');
        },
        components: {
            CscMedia,
            CscConferenceJoin,
            CscConferenceJoined,
            QLayout,
            QBtn
        },
        computed: {
            ...mapGetters([
                'conferenceId'
            ]),
            ...mapGetters('conference', [
                'isConferencingEnabled',
                'isJoined',
                'isMicrophoneEnabled',
                'isCameraEnabled',
                'isScreenEnabled',
                'isMediaEnabled',
                'localMediaStream'
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
                this.$router.push({path: '/user/home'});
                this.$store.commit('conference/disposeLocalMedia');
            },
            toggleMicrophone() {
                this.$store.dispatch('conference/toggleMicrophone');
            },
            toggleCamera() {
                this.$store.dispatch('conference/toggleCamera');
            },
            toggleScreen() {
                this.$store.dispatch('conference/toggleScreen');
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
