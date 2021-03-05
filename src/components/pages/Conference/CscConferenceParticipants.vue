<template>
    <div
        id="csc-conf-participants-cont"
        class="row justify-right items-center"
    >
        <csc-conference-local-participant
            ref="localParticipant"
            :local-participant="localParticipant"
            :local-media-stream="localMediaStream"
            :is-microphone-enabled="isMicrophoneEnabled"
            :is-camera-enabled="isCameraEnabled"
            :is-screen-enabled="isScreenEnabled"
            @click.native="setSelectedParticipant('local')"
        />
        <div
            id="csc-conf-remote-participants-cont"
        >
            <csc-conference-remote-participant
                v-for="participantId in participantsList"
                :key="participantId"
                :remote-participant="remoteParticipant(participantId)"
                :has-remote-video="hasRemoteVideo(participantId)"
                :remote-media-stream="remoteMediaStream"
                :remote-media-streams="remoteMediaStreams"
                @click.native="setSelectedParticipant(participantId)"
            />
        </div>
    </div>
</template>

<script>
import {
    mapGetters,
    mapState
} from 'vuex'
import CscConferenceRemoteParticipant from './CscConferenceRemoteParticipant'
import CscConferenceLocalParticipant from './CscConferenceLocalParticipant'

export default {
    name: 'CscConferenceParticipants',
    components: {
        CscConferenceRemoteParticipant,
        CscConferenceLocalParticipant
    },
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
    watch: {
        localMediaStream (stream) {
            this.assignLocalMediaStream(stream)
        }
    },
    mounted () {
        this.assignLocalMediaStream(this.localMediaStream)
    },
    methods: {
        assignLocalMediaStream (stream) {
            if (this.$refs.localParticipant) {
                this.$refs.localParticipant.assignStream(stream)
            }
        },
        setSelectedParticipant (participant) {
            this.$store.commit('conference/setSelectedParticipant', participant)
            this.$store.commit('conference/setManualSelection', true)
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
  #csc-conf-participants-cont
    padding 0px 20px 10px 20px
    display list-item
    height calc(100vh - 150px)
    overflow hidden
    @media (max-width: $breakpoint-sm)
      font-size 73px
      left -18px
      top -2px
</style>
