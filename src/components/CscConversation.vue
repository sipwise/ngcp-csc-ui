<template>
    <q-card class="conversation-card" :id="conversation._id">
        <csc-collapsible :icon="getCollapsibleIcons(conversation)"
            :label="getCollapsibleLabel(conversation)"
            :sublabel="conversation.start_time | readableDate">
            <div v-if="isCall(conversation.type) || isVoicemail(conversation.type)">
                <ul>
                    <li>
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
                <div v-if="isVoicemail(conversation.type)">
                <audio ref="voicemailsound" :src="voicemailRecording" @timeupdate="timeupdate($event)"></audio>
                <!--<audio ref="voicemailsound" src="https://10.15.17.240/api/voicemailrecordings/1" preload="none" @timeupdate="timeupdate($event)"></audio>-->
                    <q-btn v-if="!voicemailPlaying" flat round small color="primary" icon="play_arrow" @click="playVoicemail()">
                        {{ $t('pages.conversations.buttons.play') }}
                    </q-btn>
                    <div v-if="voicemailPlaying" class="voicemail-outer">
                        <div class="voicemail-inner">
                            <q-progress
                                :percentage="progressPercentage"
                                stripe animate
                                style="height: 46px"
                                color="green-2"
                            />
                        </div>
                        <div class="voicemail-controls voicemail-inner">
                            <q-btn flat round small color="primary" icon="pause" @click="pauseVoicemail()">
                                {{ $t('pages.conversations.buttons.pause') }}
                            </q-btn>
                            <q-btn flat round small color="primary" icon="stop" @click="stopVoicemail()">
                                {{ $t('pages.conversations.buttons.stop') }}
                            </q-btn>
                        </div>
                    </div>
                </div>
            </q-card-actions>
        </div>
    </q-card>
</template>

<script>
    import Vue from 'vue'
	import crypto from 'crypto-browserify'
    import CscCollapsible from './card/CscCollapsible'
    import { mapGetters, mapState } from 'vuex'
    import { QBtn, QCardActions, QCard, QCardSeparator,
        QProgress, QPopover, QItem, QList } from 'quasar-framework'
    import numberFormat from '../filters/number-format'
    export default {
        name: 'csc-conversation',
        props: [
            'conversation',
            'index'
        ],
        components: {
            QBtn,
            QCard,
            QCardActions,
            QCardSeparator,
            QProgress,
            QPopover,
            QItem,
            QList,
            CscCollapsible
        },
        mounted() {
            this.$store.dispatch('conversations/loadVoicemailRecording', 1);
        },
        computed: {
            ...mapGetters('conversations', [
                'getCardId'
            ]),
            progressPercentage() {
                return this.$store.state.conversations.progressPercentage;
            },
            voicemailPlaying() {
                return this.$store.state.conversations.voicemailPlaying;
            },
            voicemailRecording() {
                return this.$store.state.conversations.voicemailRecording;
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
            timeupdate(e) {
                let newPercentage = Math.floor((e.target.currentTime / e.target.duration) * 100);
                this.$store.dispatch('conversations/setProgressPercentage', newPercentage);
            },
            getCollapsibleIcons(item) {
                let directionIcon = item.direction == 'out' ? 'call_made' :
                    'call_received';
                switch (item.type) {
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
            getCollapsibleLabel(item) {
                let prefix = item.status == 'ok' ?
                    this.$t('pages.conversations.labels.successful')
                    : this.$t('pages.conversations.labels.unsuccessful');
                let direction = item.direction == 'in' ?
                    this.$t('pages.conversations.labels.from') :
                    this.$t('pages.conversations.labels.to');
                let number = item.caller;
				if(item.direction === 'out') {
					number = item.callee;
				}
                return `${prefix} ${item.type} ${direction} ${numberFormat(number)}`;
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
                return type == 'callforward';
            },
            playVoicemail() {
                this.$refs.voicemailsound.play();
                this.$store.dispatch('conversations/setVoicemailPlaying');

            },
            pauseVoicemail() {
                console.log('pauseVoicemail()');
            },
            stopVoicemail() {
                this.$store.dispatch('conversations/setVoicemailStopped');
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
