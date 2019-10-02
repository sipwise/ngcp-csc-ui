<template>
    <q-card
      class="csc-conf-participants-item-cont"
    >
      <q-card-media
        class="csc-avatar-cont"
        v-if="!localMediaStream || localMediaStream && (!isCameraEnabled && !isScreenEnabled)"
      >
        <img src="/statics/avatar.png">
      </q-card-media>
      <csc-media
          v-show="localMediaStream && (isCameraEnabled || isScreenEnabled)"
          class="csc-media-cont"
          :muted="false"
          :stream="localMediaStream"
          :preview="true"
      />
      <q-card-title
        class="csc-conf-participants-item-title"
      >
        {{localParticipant.displayName}}
      </q-card-title>
    </q-card>
</template>

<script>
    import { QCard, QCardMedia, QCardTitle } from 'quasar-framework'
    import { mapGetters } from 'vuex'
    import CscMedia from "../../CscMedia";
    export default {
        name: 'csc-conference-local-participant',
        components: {
          QCard,
          QCardMedia,
          QCardTitle,
          CscMedia
        },
        computed: {
          ...mapGetters('conference', [
            'localParticipant',
            'localMediaStream',
            'isMicrophoneEnabled',
            'isCameraEnabled',
            'isScreenEnabled'
          ])
        },
        mounted(){
          //workaround to retrigger localMediaStream watcher
          const enabledMedia = 'mic' + (this.isCameraEnabled ? 'Cam' : this.isScreenEnabled ? 'Screen' : '');
          this.$store.dispatch('conference/createLocalMedia', enabledMedia);
        },
        watch: {
          localMediaStream: ()=>{
            return this.localMediaStream;
          }
        }

    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl'
</style>
