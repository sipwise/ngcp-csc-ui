<template>
    <div>
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
    </div>
</template>

<script>
    import CscConversation from './CscConversation'
    import { mapGetters } from 'vuex'
    import {
		QInfiniteScroll,
		QSpinnerDots,
		dom,
		scroll
	} from 'quasar-framework'
	const { viewport } = dom
	const { getScrollPosition, setScrollPosition } = scroll
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
			reloadConversations() {
				this.$store.dispatch('conversations/reloadConversations');
			},
            loadMore(index, done) {
				let { height, width } = viewport();
				this.$refs.infinite.resume();
                console.log('index', index);
                console.log('height', height);
                console.log('width', width);
                console.log('getScrollPosition', getScrollPosition(window));
                this.$store.dispatch('conversations/loadConversations')
                    .then(() => {
                        done();
                    }).catch(() => {
                        done();
                        this.$refs.infinite.stop();
                    });
            }
        },
        watch: {
            callEnded() {
                setScrollPosition(window, 0); // Might need to be conditional, or try behavior without
                setTimeout(() => {
					this.reloadConversations();
                }, 9000);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
