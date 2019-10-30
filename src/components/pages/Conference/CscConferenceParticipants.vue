<template>
    <div
        class="row justify-right items-center"
        id="csc-conf-participants-cont"
    >
        <csc-conference-local-participant
            ref="localParticipant"
            @click.native="showSelectedParticipant('local')"
            :local-participant="localParticipant"
            :local-media-stream="localMediaStream"
            :is-microphone-enabled="isMicrophoneEnabled"
            :is-camera-enabled="isCameraEnabled"
            :is-screen-enabled="isScreenEnabled"
        />
        <div
            id="csc-conf-remote-participants-cont"
            v-for="participantId in participantsList"
            :key="participantId"
        >
            <csc-conference-remote-participant
                :key="participantId"
                @click.native="showSelectedParticipant(participantId)"
                :remote-participant="remoteParticipant(participantId)"
                :has-remote-video="hasRemoteVideo(participantId)"
                :remote-media-stream="remoteMediaStream"
                :remote-media-streams="remoteMediaStreams"
            />
        </div>
    </div>
</template>

<script>
    import {QCard, QCardMedia, QCardTitle} from 'quasar-framework'
    import {
        mapGetters,
        mapState,
    } from 'vuex'
    import CscMedia from "../../CscMedia";
    import CscConferenceRemoteParticipant from './CscConferenceRemoteParticipant'
    import CscConferenceLocalParticipant from './CscConferenceLocalParticipant'

    export default {
        name: 'csc-conference-participants',
        components: {
            QCard,
            QCardMedia,
            QCardTitle,
            CscMedia,
            CscConferenceRemoteParticipant,
            CscConferenceLocalParticipant
        },
        props: ['showSelectedParticipant'],
        computed: {
            ...mapState('conference', [
                'remoteMediaStreams'
            ]),
            ...mapGetters('conference', [
                'participantsList',
                'localParticipant',
                'localMediaStream',
                'isMicrophoneEnabled',
                'isCameraEnabled',
                'isScreenEnabled',
                'remoteParticipant',
                'remoteMediaStream',
                'hasRemoteVideo'
            ])
        },
        mounted() {
            this.assignLocalMediaStream(this.localMediaStream);
        },
        methods: {
            assignLocalMediaStream(stream) {
                if(this.$refs.localParticipant) {
                    this.$refs.localParticipant.assignStream(stream);
                }
            }
        },
        watch: {
            localMediaStream(stream) {
                this.assignLocalMediaStream(stream);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl'
    #csc-conf-participants-cont
        float right
        padding 10px
        display inline-block
        height calc(100vh - 150px)
        overflow hidden

    #csc-conf-remote-participants-cont
        overflow scroll
</style>
