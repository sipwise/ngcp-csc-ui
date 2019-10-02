<template>
    <q-card
      class="csc-conf-participant-cont"
    >
      <q-card-media
        class="csc-avatar-cont"
        v-show="!hasRemoteMediaStream(participantId)"
      >
        <img src="/statics/avatar.png">
      </q-card-media>
      <csc-media
          v-show="hasRemoteMediaStream(participantId)"
          class="csc-media-cont"
          ref="{{participantId}}"
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
    import { mapGetters } from 'vuex'
    import CscMedia from "../../CscMedia";
    export default {
        name: 'csc-conference-remote-participant',
        components: {
          QCard,
          QCardMedia,
          QCardTitle,
          CscMedia
        },
        props:['participantId'],
        computed: {
          ...mapGetters('conference', [
            'remoteParticipant',
            'remoteMediaStream',
            'hasRemoteMediaStream'
          ])
        },
        mounted(){
          // workaround to retrigger :stream binding on csc-media component
          if(this.hasRemoteMediaStream(this.participantId)){
            this.$store.commit('conference/addRemoteMedia', this.participantId);
          }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl'
</style>
