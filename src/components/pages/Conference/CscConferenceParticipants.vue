<template>
    <div
        class="row justify-right items-center"
        id="csc-conf-participants-cont"
    >
      <q-card
        class="csc-conf-participants-item-cont"
      >
        <q-card-media
          v-show="!localMediaStream"
          class="csc-avatar-cont"
        >
          <img src="/statics/avatar.png">
        </q-card-media>
        <csc-media
            v-show="localMediaStream"
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
      <div
        id="csc-conf-remote-participants-cont"
        v-for="participantId in participantsList" :key="participantId">
        <csc-conference-remote-participant
            :participant-id="participantId"
        />
    </div>
    </div>
</template>

<script>
    import { QCard, QCardMedia, QCardTitle } from 'quasar-framework'
    import { mapGetters } from 'vuex'
    import CscMedia from "../../CscMedia";
    import CscConferenceRemoteParticipant from './CscConferenceRemoteParticipant'
    export default {
        name: 'csc-conference-participants',
        components: {
          QCard,
          QCardMedia,
          QCardTitle,
          CscMedia,
          CscConferenceRemoteParticipant,
        },
        computed: {
          ...mapGetters('conference', [
            'localParticipant',
            'localMediaStream',
            'participantsList'
          ])
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
    .csc-conf-participants-item-cont
      margin-bottom 20px
      width 115px
      height 115px
      background white
    .csc-conf-participants-item-title
      position relative
      background white
      bottom 24px
      text-align center
      padding 0
      background rgba(0, 0, 0, 0.5)
      .q-card-title
        color $primary
        font-size 12px
        line-height 24px
    .csc-avatar-cont
      height 100%
      top 6px
    .csc-media-cont
      height 100% !important
      width 100% !important
      video
        height: 100%;

</style>
