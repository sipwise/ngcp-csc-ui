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
    import _ from 'lodash'
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
            reloadConversations: _.debounce((self) => {
                // 7000 milliseconds debounce delay was the lowest possible
                // delay during testing, as cases where there has been some time
                // between calls seems to take longer to appear in the conversations
                // api endpoint. Might need to add a couple of seconds to account
                // for possible fluctuations in backend speed
                self.$store.dispatch('conversations/reloadConversations');
                self.$refs.infinite.reset();
                self.$refs.infinite.resume();
            }, 7000),
            loadMore(index, done) {
                this.$store.dispatch('conversations/loadConversations')
                    .then(() => {
                        done();
                    }).catch(() => {
                        done();
                        this.$refs.infinite.stop();
                    });
            },

        },
        watch: {
            callState(newState, oldState) {
                let endedA = newState === 'ended';
                let endedB = oldState === 'established' && newState === 'input';
                let endedC = oldState === 'ringing' && newState === 'input';
                if (endedA || endedB || endedC) {
                    this.reloadConversations(this);
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
