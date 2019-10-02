<template>
    <div
        class="row justify-right items-center"
        id="csc-conf-participants-cont"
    >
      <csc-conference-local-participant />
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
        computed: {
          ...mapGetters('conference', [
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
