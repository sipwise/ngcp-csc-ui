<template>
    <q-card
      class="csc-conf-participant-cont"
    >
      <q-card-media
        class="csc-avatar-cont"
        v-show="!hasRemoteMediaStreamVideoEnabled(participantId)"
      >
        <img src="/statics/avatar.png">
      </q-card-media>
      <csc-media
          v-show="hasRemoteMediaStreamVideoEnabled(participantId)"
          class="csc-media-cont"
          ref="cscMedia"
          :muted="false"
          :stream="remoteMediaStream(participantId)"
          :preview="true"
      />
      <q-card-title
        class="csc-conf-participants-item-title"
      >
        {{remoteParticipant(participantId).displayName}}
      </q-card-title>
    </q-card>
</template>

<script>
    import { QCard, QCardMedia, QCardTitle } from 'quasar-framework'
    import CscMedia from "../../CscMedia";
    export default {
        name: 'csc-conference-remote-participant',
        components: {
          QCard,
          QCardMedia,
          QCardTitle,
          CscMedia
        },
        props:[
          'participantId',
          'remoteParticipant',
          'remoteMediaStream',
          'hasRemoteMediaStreamVideoEnabled'
        ],
        mounted(){
          this.assignStream(this.remoteMediaStream(this.participantId));
        },
        methods: {
            assignStream(stream) {
                if(this.$refs.cscMedia) {
                  this.$refs.cscMedia.assignStream(stream);
                }

            }
        },
        watch: {
            localMediaStream(stream) {
                this.assignStream(stream);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl'
</style>
