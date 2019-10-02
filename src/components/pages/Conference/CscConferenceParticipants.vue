<template>
    <div
        class="row justify-right items-center csc-conf-full-height"
        id="csc-conf-participants-cont"
    >
        <div v-for="participant in participantsList">
          <q-card
            class="csc-conf-participants-item-cont"
          >
            <q-card-media>
              <img src="/statics/avatar.png">
            </q-card-media
            >
            <q-card-title
              class="csc-conf-participants-item-title"
            >
              {{getParticipantName(participant)}}

            </q-card-title>
          </q-card>
      </div>
    </div>
</template>

<script>
    import { QCard, QCardMedia, QCardTitle, QCardMain } from 'quasar-framework'
    import { mapGetters } from 'vuex'

    export default {
        name: 'csc-conference-participants',
        data () {
            return {}
        },
        props: [
          'participants',
        ],
        components: {
          QCard,
          QCardMedia,
          QCardTitle,
          QCardMain
        },
        computed: {
          ...mapGetters('conference', []),
          participantsList(){
            return this.participants;
          }
        },
        methods: {
          getParticipantName(participant){
            return participant.displayName;
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
