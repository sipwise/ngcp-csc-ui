<template>
    <q-infinite-scroll
        :handler="loadMore"
        :offset=1
        ref="infinite"
    >
        <csc-conversation
            v-for="(conversation, index) in conversations"
            :conversation="conversation"
            :key="conversation._id"
        />
        <div
            slot="message"
            class="row justify-center"
        >
            <q-spinner-dots :size="40" />
        </div>
    </q-infinite-scroll>
</template>

<script>
    import CscConversation from './CscConversation'
    import { mapGetters } from 'vuex'
    import {
        QInfiniteScroll,
        QSpinnerDots
    } from 'quasar-framework'
    export default {
        name: 'csc-conversations',
        props: ['conversations'],
        components: {
            CscConversation,
            QInfiniteScroll,
            QSpinnerDots
        },
        computed: {
            ...mapGetters('call', [
                'callState'
            ])
        },
        methods: {
            reloadConversations() {
                this.$store.dispatch('conversations/reloadConversations', 1);
                this.$refs.infinite.reset();
                this.$refs.infinite.resume();
            },
            loadMore(index, done) {
                //NOTE: Temporarily fixed to avoid infinite scrolling
                if(index === 1) {
                    this.$store.dispatch('conversations/loadConversations')
                        .then(() => {
                            done();
                        }).catch(() => {
                            done();
                            this.$refs.infinite.stop();
                        }); 
                }
            }
        },
        watch: {
            callState(newState, oldState) {
                let endedA = newState === 'ended';
                let endedB = oldState === 'established' && newState === 'input';
                let endedC = oldState === 'ringing' && newState === 'input';
                if (endedA || endedB || endedC) {
                    this.reloadConversations();
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
