<template>
    <csc-page :title="$t('pages.conversations.title')">
        <q-infinite-scroll :handler="loadMore" :offset=1 ref="infinite">
            <q-card v-for="conversation in conversations" :key="conversation.caller"
                class="conversation-card">
                <csc-collapsible :icon="getCollapsibleIcons(conversation)"
                    :label="getCollapsibleLabel(conversation)"
                    :sublabel="conversation.start_time | readableDate">
                </csc-collapsible>
                <div v-if="hasCallOption(conversation.type)">
                    <q-card-separator />
                    <q-card-actions align="center">
                        <q-btn flat round small color="primary" icon="call">{{ $t('pages.conversations.buttons.call') }}</q-btn>
                    </q-card-actions>
                </div>
            </q-card>
            <q-spinner-dots slot="message" :size="40"></q-spinner-dots>
        </q-infinite-scroll>
    </csc-page>
</template>

<script>
    // TODO: 1. Improve spinner (alignment, styling, etc)
    // TODO: 2. Check for formatting, cleanup, etc
    import CscPage from '../CscPage'
    import CscCollapsible from '../card/CscCollapsible'
    import { QBtn, QCardActions, QCard,
        QCardSeparator, QInfiniteScroll, QSpinnerDots } from 'quasar-framework'
    export default {
        data () {
            return {
            }
        },
        components: {
            CscPage,
            QBtn,
            QCard,
            QCardActions,
            QCardSeparator,
            CscCollapsible,
            QInfiniteScroll,
            QSpinnerDots
        },
        computed: {
            conversations() {
                return this.$store.state.conversations.conversations;
            }
        },
        methods: {
            loadMore(index, done) {
                this.$store.dispatch('conversations/loadConversations').then(() => {
                    done();
                }).catch((err) => {
                    done();
                    this.$refs.infinite.stop();
                });
            },
            hasCallOption(type) {
                return (['call', 'call forward', 'sms', 'voicemail']
                    .indexOf(type) > -1);
            },
            getCollapsibleIcons(item) {
                let directionIcon = item.direction == 'out' ? 'call_made' :
                    'call_received';
                switch (item.type) {
                    case 'call':
                        return 'phone ' + directionIcon;
                        break;
                    case 'call forward':
                        return 'call_merge ' + directionIcon;
                        break;
                    case 'voicemail':
                        return 'voicemail ' + directionIcon;
                        break;
                    case 'fax':
                        return 'insert_drive_file ' + directionIcon;
                        break;
                    case 'sms':
                        return 'txtsms ' + directionIcon;
                        break;
                };
            },
            getCollapsibleLabel(item) {
                let prefix = item.status == 'ok' ? this.$t('pages.conversations.labels.successful')
                    : this.$t('pages.conversations.labels.unsuccessful');
                let direction = item.direction == 'in' ? this.$t('pages.conversations.labels.from') : this.$t('pages.conversations.labels.to');
                return `${prefix} ${item.type} ${direction} ${item.caller}`;
            }
        }
    }
</script>

<style lang="stylus">
@import '~variables'
.conversation-card
    padding 15px
    .q-btn
        margin-bottom -10px
</style>
