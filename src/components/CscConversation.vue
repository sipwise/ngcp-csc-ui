<template>
    <q-card class="conversation-card" :id="conversation._id">
        <csc-collapsible :icon="getCollapsibleIcons()"
            :label="getCollapsibleLabel()"
            :sublabel="conversation.start_time | readableDate">
            <div v-if="isType('call') || isType('voicemail')">
                <ul>
                    <li>
                        <strong>
                            {{ $t('pages.conversations.card.duration') }}:
                        </strong> {{ conversation.duration }}</li>
                    <li v-if="isType('voicemail')">
                        <strong>
                            {{ $t('pages.conversations.card.folder') }}:
                        </strong> {{ conversation.folder }}</li>
                </ul>
            </div>
        </csc-collapsible>
        <div v-if="!isType('fax')">
            <q-card-separator />
            <q-card-actions align="center">
                <q-btn flat round small color="primary" icon="call">
                    {{ $t('pages.conversations.buttons.call') }}
                    <q-popover ref="popover">
                        <q-list separator link>
                            <q-item @click="call('audioOnly'),
                                $refs.popover.close()">
                                {{ $t('pages.conversations.buttons.audioCall') }}
                            </q-item>
                            <q-item @click="call('audioVideo'),
                                $refs.popover.close()">
                                {{ $t('pages.conversations.buttons.videoCall') }}
                            </q-item>
                        </q-list>
                      </q-popover>
                </q-btn>
                <div v-if="isType('voicemail')">
                    <a :href="conversation.voicemail">
                        <q-btn flat round small color="primary"
                            icon="play_arrow">
                            {{ $t('pages.conversations.buttons.play') }}
                        </q-btn>
                    </a>
                </div>
            </q-card-actions>
        </div>
    </q-card>
</template>

<script>
    import Vue from 'vue'
    import crypto from 'crypto-browserify'
    import CscCollapsible from './card/CscCollapsible'
    import { mapGetters } from 'vuex'
    import { QBtn, QCardActions, QCard, QCardSeparator,
        QPopover, QItem, QList } from 'quasar-framework'
    import numberFormat from '../filters/number-format'
    export default {
        name: 'csc-conversation',
        props: [
            'conversation'
        ],
        components: {
            QBtn,
            QCard,
            QCardActions,
            QCardSeparator,
            QPopover,
            QItem,
            QList,
            CscCollapsible
        },
        computed: {
            ...mapGetters('conversations', [
                'getCardId'
            ])
        },
        methods: {
            call(localMedia) {
                let conversation = this.conversation;
                let number = conversation.direction == 'out' ?
                    conversation.callee : conversation.caller;
                this.$store.dispatch('call/start',
                    { number: number, localMedia: localMedia });
            },
            getCollapsibleIcons() {
                let conversation = this.conversation;
                let directionIcon = conversation.direction == 'out' ? 'call_made' :
                    'call_received';
                switch (conversation.type) {
                    case 'call':
                        return 'phone ' + directionIcon;
                        break;
                    case 'callforward':
                        return 'call_merge ' + directionIcon;
                        break;
                    case 'voicemail':
                        return 'voicemail ' + directionIcon;
                        break;
                    case 'fax':
                        return 'insert_drive_file ' + directionIcon;
                        break; case 'sms':
                        return 'txtsms ' + directionIcon;
                        break;
                };
            },
            getCollapsibleLabel() {
                let conversation = this.conversation;
                let prefix;
                if (!conversation.status || ['ok', 'SUCCESS'].indexOf(conversation.status) > -1) {
                    prefix = this.$t('pages.conversations.labels.successful');
                } else {
                    prefix = this.$t('pages.conversations.labels.unsuccessful');
                }
                let direction = conversation.direction == 'in' ?
                    this.$t('pages.conversations.labels.from') :
                    this.$t('pages.conversations.labels.to');
                let number = conversation.caller;
                if(conversation.direction === 'out') {
                    number = conversation.callee;
                }
                return `${prefix} ${conversation.type} ${direction} ${numberFormat(number)}`;
            },
            isType(type) {
                return this.conversation.type == type;
            },
            getVoicemailUrl() {
                return this.conversation.voicemail;
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
.voicemail-controls
    height 46px
    padding 0 7px
.voicemail-outer
    width 110px
    height 50px
    margin-left 10px
.voicemail-inner
    position absolute
    width 110px
</style>
