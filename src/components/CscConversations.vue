<template>
    <div>
        <q-infinite-scroll :handler="loadMore" :offset=1 ref="infinite">
            <csc-conversation v-for="(conversation, index) in conversations"
                :conversation="conversation" :key="conversation._id">
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
                    }).catch(() => {
                        done();
                        this.$refs.infinite.stop();
                    });
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
