<template>
    <q-card
      class="csc-conf-participant-cont"
    >
      <q-card-media
        class="csc-avatar-cont"
        v-if="!localMediaStream || localMediaStream && (!isCameraEnabled && !isScreenEnabled)"
      >
        <img src="/statics/avatar.png">
      </q-card-media>
      <csc-media
          ref="cscMedia"
          v-show="localMediaStream && (isCameraEnabled || isScreenEnabled)"
          class="csc-media-cont"
          :muted="true"
          :stream="localMediaStream"
          :preview="true"
      />
      <q-card-title
        class="csc-conf-participants-item-title"
      >
        {{ localParticipant.displayName }}
      </q-card-title>
    </q-card>
</template>

<script>
    import { QCard, QCardMedia, QCardTitle } from 'quasar-framework'
    // import { mapGetters } from 'vuex'
    import CscMedia from "../../CscMedia";
    export default {
        name: 'csc-conference-local-participant',
        components: {
          QCard,
          QCardMedia,
          QCardTitle,
          CscMedia
        },
        props: [
          'localParticipant',
          'localMediaStream',
          'isMicrophoneEnabled',
          'isCameraEnabled',
          'isScreenEnabled'
        ],
        mounted(){
          this.assignStream(this.localMediaStream);
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
