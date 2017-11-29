<template>
    <csc-page :title="$t('pages.conversations.title')">
        <q-infinite-scroll :handler="loadMore" :offset=1 ref="infinite">
            <q-card v-for="(conversation, index) in conversations"
                :key="conversation.caller"
                class="conversation-card">
                <csc-collapsible :icon="getCollapsibleIcons(conversation)"
                    :label="getCollapsibleLabel(conversation)"
                    :sublabel="conversation.start_time | readableDate">
                    <div v-if="isCall(conversation.type) || isVoicemail(conversation.type)">
                        <ul>
                            <li><strong>
                                    {{ $t('pages.conversations.card.date') }}:
                                </strong> {{ conversation.start_time }}</li>
                            <li v-if="isCall(conversation.type) || isVoicemail(conversation.type)">
                                <strong>
                                    {{ $t('pages.conversations.card.duration') }}:
                                </strong> {{ conversation.duration }}</li>
                            <li v-if="isVoicemail(conversation.type)">
                                <strong>
                                    {{ $t('pages.conversations.card.folder') }}:
                                </strong> {{ conversation.folder }}</li>
                        </ul>
                    </div>
                </csc-collapsible>
                <div v-if="!isFax(conversation.type)">
                    <q-card-separator />
                    <q-card-actions align="center">
                        <q-btn flat round small color="primary" icon="call">
                            {{ $t('pages.conversations.buttons.call') }}
                            <q-popover ref="popover">
                                <q-list separator link>
                                    <q-item @click="call(conversation,
                                        'audioOnly'), $refs.popover[index].close()">
                                        {{ $t('pages.conversations.buttons.audioCall') }}
                                    </q-item>
                                    <q-item @click="call(conversation,
                                        'audioVideo'), $refs.popover[index].close()">
                                        {{ $t('pages.conversations.buttons.videoCall') }}
                                    </q-item>
                                </q-list>
                              </q-popover>
                        </q-btn>
                    </q-card-actions>
                </div>
            </q-card>
            <div slot="message" class="row justify-center">
                <q-spinner-dots :size="40"></q-spinner-dots>
            </div>
        </q-infinite-scroll>
    </csc-page>
</template>

<script>
    import CscPage from '../CscPage'
    import CscCollapsible from '../card/CscCollapsible'
    import { QBtn, QCardActions, QCard, QCardSeparator, QInfiniteScroll,
        QPopover, QList, QItem, QSpinnerDots } from 'quasar-framework'
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
            QPopover,
            QList,
            QItem,
            QSpinnerDots
        },
        computed: {
            conversations() {
                return this.$store.state.conversations.conversations;
            }
        },
        methods: {
            call(conversation, localMedia) {
                let number = conversation.direction == 'out' ?
                    conversation.callee : conversation.caller;
                this.$store.dispatch('call/start',
                    { number: number, localMedia: localMedia });
            },
            loadMore(index, done) {
                this.$store.dispatch('conversations/loadConversations')
                    .then(() => {
                        done();
                    }).catch((err) => {
                        done();
                        this.$refs.infinite.stop();
                    });
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
                let prefix = item.status == 'ok' ?
                    this.$t('pages.conversations.labels.successful')
                    : this.$t('pages.conversations.labels.unsuccessful');
                let direction = item.direction == 'in' ?
                    this.$t('pages.conversations.labels.from') :
                    this.$t('pages.conversations.labels.to');
                return `${prefix} ${item.type} ${direction} ${item.caller}`;
            },
            isCall(type) {
                return type == 'call';
            },
            isVoicemail(type) {
                return type == 'voicemail';
            },
            isFax(type) {
                return type == 'fax';
            },
            isXmpp(type) {
                return type == 'xmpp';
            },
            isSms(type) {
                return type == 'sms';
            },
            isCallForward(type) {
                return type == 'call forward';
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
.q-infinite-scroll-message
    margin-bottom 50px
</style>
