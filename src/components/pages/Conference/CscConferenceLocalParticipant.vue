<template>
    <q-card
      class="csc-conf-participant-cont"
    >
        <q-icon
            name="person"
            class="csc-conf-avatar"
            v-if="!localMediaStream || localMediaStream && (!isCameraEnabled && !isScreenEnabled)"
        >
        </q-icon>

      <csc-media
          ref="cscMedia"
          v-show="localMediaStream && (isCameraEnabled || isScreenEnabled)"
          class="csc-media-cont"
          :muted="true"
          :stream="localMediaStream"
      />
      <q-card-title
        class="csc-conf-participants-item-title"
      >
        {{ localParticipant.displayName }}
      </q-card-title>
    </q-card>
</template>

<script>
    import { QIcon, QCard, QCardMedia, QCardTitle } from 'quasar-framework'
    import CscMedia from "../../CscMedia";
    export default {
        name: 'csc-conference-local-participant',
        components: {
            QIcon,
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
