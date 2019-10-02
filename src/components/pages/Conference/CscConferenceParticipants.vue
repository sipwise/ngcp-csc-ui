<template>
    <div
        class="row justify-right items-center"
        id="csc-conf-participants-cont"
    >
      <q-card
        v-if="isJoined"
        class="csc-conf-participants-item-cont"
      >
        <q-card-media>
          <img src="/statics/avatar.png">
        </q-card-media
        >
        <q-card-title
          class="csc-conf-participants-item-title"
        >
          {{localParticipant.displayName}}
        </q-card-title>
      </q-card>
      <div
        id="csc-conf-remote-participants-cont"
        v-for="participantId in participantsList">
        <q-card
          class="csc-conf-participants-item-cont"
        >
          <q-card-media> <!-- TODO use csc-media -->
            <img src="/statics/avatar.png">
          </q-card-media
          >
          <q-card-title
            class="csc-conf-participants-item-title"
          >
            {{remoteParticipant(participantId).displayName}}
          </q-card-title>
        </q-card>
    </div>
    </div>
</template>

<script>
    import { QCard, QCardMedia, QCardTitle } from 'quasar-framework'
    import { mapGetters } from 'vuex'

    export default {
        name: 'csc-conference-participants',
        data () {
            return {}
        },
        props: [
          'isJoined'
        ],
        components: {
          QCard,
          QCardMedia,
          QCardTitle
        },
        computed: {
          ...mapGetters('conference', [
            'localParticipant',
            'remoteParticipant',
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
      height 100%
    .csc-conf-participants-item-cont
      margin-bottom 20px
      max-width 120px
      max-height 115px
      background white
    .csc-conf-participants-item-title
      position relative
      background white
      bottom 32px
      text-align center
      padding 0
      background rgba(0, 0, 0, 0.5)
      .q-card-title
        color $primary
        font-size 14px


</style>
