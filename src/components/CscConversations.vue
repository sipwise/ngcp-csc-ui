<template>
    <div>
        <audio ref="voicemailsound" src="statics/voicemail_sample.mp3"
            @timeupdate="timeupdate($event)"></audio>
        <q-infinite-scroll :handler="loadMore" :offset=1 ref="infinite">
            <csc-conversation v-for="(conversation, index) in conversations"
                :conversation="conversation" :index="index"
                :key="conversation._id">
            </csc-conversation>
            <div slot="message" class="row justify-center">
                <q-spinner-dots :size="40"></q-spinner-dots>
            </div>
        </q-infinite-scroll>
    </div>
</template>

<script>
    import CscConversation from './CscConversation'
    import { QInfiniteScroll, QSpinnerDots } from 'quasar-framework'
    export default {
        name: 'csc-conversations',
        props: ['conversations'],
        components: {
            CscConversation,
            QInfiniteScroll,
            QSpinnerDots
        },
        methods: {
            loadMore(index, done) {
                this.$store.dispatch('conversations/loadConversations')
                    .then(() => {
                        done();
                    }).catch((err) => {
                        done();
                        this.$refs.infinite.stop();
                    });
            },
            timeupdate(e) {
                let newPercentage = Math.floor((e.target.currentTime / e.target.duration) * 100);
                this.$store.dispatch('conversations/setProgressPercentage', newPercentage);
            }
        }
    }
</script>

<style lang="stylus">
</style>
