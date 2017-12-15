<template>
    <csc-card-collapsible :list-item="conversation" :collapsible="hasCollapsibleData()"
        :firstIcon="getFirstIcon()" :secondIcon="getSecondIcon()"
        :sublabel="conversation.start_time | readableDate" :id="conversation._id">
        <span slot="title">
            {{ getTitle() }}
            <span v-if="isType('fax')" style="padding-left:12px;">
                Pages: <q-chip pointing="left" color="primary"> {{ conversation.pages }} </q-chip>
            </span>
        </span>
        <div v-if="isType('call') || isType('voicemail')" slot="main">
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
        <div v-if="!isType('fax')" slot="footer">
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
                <q-btn v-if="isType('voicemail')" flat round small color="primary"
                    icon="play_arrow" @click="downloadVoiceMail(conversation.id)">
                    {{ $t('pages.conversations.buttons.play') }}
                </q-btn>
            </q-card-actions>
        </div>
    </csc-collapsible-card>
</template>

<script>
    import Vue from 'vue'
    import CscCardCollapsible from './card/CscCardCollapsible'
    import { QBtn, QPopover, QItem, QList, QCardActions,
        QChip, QCardSeparator } from 'quasar-framework'
    import numberFormat from '../filters/number-format'
    export default {
        name: 'csc-conversation',
        props: [
            'conversation'
        ],
        components: {
            QBtn,
            QPopover,
            QItem,
            QList,
            QChip,
            QCardSeparator,
            QCardActions,
            CscCardCollapsible
        },
        methods: {
            downloadVoiceMail(id) {
                this.$store.dispatch('conversations/downloadVoiceMail', id);
            },
            call(localMedia) {
                let conversation = this.conversation;
                let number = conversation.direction == 'out' ?
                    conversation.callee : conversation.caller;
                this.$store.dispatch('call/start',
                    { number: number, localMedia: localMedia });
            },
            getFirstIcon() {
                let conversation = this.conversation;
                switch (conversation.type) {
                    case 'call':
                        return 'phone';
                        break;
                    case 'callforward':
                        return 'call_merge';
                        break;
                    case 'voicemail':
                        return 'voicemail';
                        break;
                    case 'fax':
                        return 'insert_drive_file';
                        break; case 'sms':
                        return 'txtsms';
                        break;
                };
            },
            getSecondIcon() {
                let conversation = this.conversation;
                let directionIcon = conversation.direction == 'out' ?
                    'call_made' : 'call_received';
                return directionIcon;
            },
            getTitle() {
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
            hasCollapsibleData() {
                return (['call', 'voicemail'].indexOf(this.conversation.type) > -1);
                return this.conversation.type == type;
            }
        }
    }
</script>

<style lang="stylus">
</style>
