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
            ...mapGetters('call', {
                callEnded: 'isEnded'
            })
        },
        methods: {
            reloadConversations: _.debounce((self) => {
                self.$store.dispatch('conversations/reloadConversations');
                self.$refs.infinite.reset();
                self.$refs.infinite.resume();
            }, 7000),
            loadMore(index, done) {
                console.log('loadMore fired');
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
            callEnded() {
                this.reloadConversations(this);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
