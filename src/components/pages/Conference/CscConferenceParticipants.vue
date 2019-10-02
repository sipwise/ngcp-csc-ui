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
              {{participant}}
            </q-card-title>
          </q-card>
      </div>
    </div>
</template>

<script>
    import { QCard, QCardMedia, QCardTitle, QCardMain } from 'quasar-framework'

    export default {
        name: 'csc-conference-participants',
        data () {
            return {

            }
        },
        props: [
          'participants'
        ],
        components: {
          QCard,
          QCardMedia,
          QCardTitle,
          QCardMain
        },
        computed: {
          participantsList(){
            return this.participants;
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
      max-height 120px
      background white
    .csc-conf-participants-item-title
      position relative
      bottom 90px
      .q-card-title
        color $primary
        font-size 12px
        line-height 14px

</style>
