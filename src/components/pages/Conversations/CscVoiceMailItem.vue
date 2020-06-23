<template>
    <q-item
        class="csc-entity csc-voice-mail-item"
    >
        <q-item-side
            color="primary"
            icon="voicemail"
        />
        <q-item-main>
            <q-item-tile
                label
            >
                <span class="gt-sm csc-entity-title">
                    {{ $t('pages.conversations.voicemail') }}
                </span>
                <span class="gt-sm csc-entity-title">
                    {{ direction }}
                </span>
                <span class="csc-entity-title csc-phone-number">
                    {{ voiceMail.caller | numberFormat }}
                </span>
            </q-item-tile>
            <q-item-tile
                sublabel
            >
                {{ voiceMail.start_time | smartTime }}
            </q-item-tile>
            <q-item-tile
                sublabel
            >
                {{ $t('pages.conversations.duration') }}
                {{ voiceMail.duration }}
                {{ $t('pages.conversations.seconds') }}
            </q-item-tile>
            <q-item-tile>
                <csc-audio-player
                    ref="voicemailPlayer"
                    :file-url="soundFileUrl"
                    :loaded="voiceMailLoaded"
                    class="csc-voice-mail-player"
                    @load="load"
                    :pausable="true"
                />
            </q-item-tile>
        </q-item-main>
        <q-item-side
            right
            class="csc-item-buttons"
        >
            <q-item-tile>
                <q-btn
                    icon="more_vert"
                    color="primary"
                    slot="right"
                    flat
                >
                    <q-popover
                        ref="callPopover"
                        anchor="bottom right"
                        self="top right"
                    >
                        <q-list
                            link
                            no-border
                            class="csc-toolbar-btn-popover"
                        >
                            <q-item
                                @click="downloadVoiceMail"
                            >
                                <q-item-side
                                    icon="file_download"
                                    color="primary"
                                />
                                <q-item-main
                                    :label="$t('pages.conversations.buttons.downloadVoicemail')"
                                />
                            </q-item>
                            <q-item
                                v-if="callAvailable"
                                @click="startCall"
                            >
                                <q-item-side
                                    icon="call"
                                    color="primary"
                                />
                                <q-item-main
                                    :label="$t('pages.conversations.buttons.call')"
                                />
                            </q-item>
                            <q-item
                                @click="toggleBlockIncoming"
                            >
                                <q-item-side
                                    icon="call received"
                                    color="primary"
                                />
                                <q-item-main
                                    :label="blockIncomingLabel"
                                />
                            </q-item>
                            <q-item
                                @click="toggleBlockOutgoing"
                            >
                                <q-item-side
                                    icon="call made"
                                    color="primary"
                                />
                                <q-item-main
                                    :label="blockOutgoingLabel"
                                />
                            </q-item>
                            <q-item
                                v-if="blockBothPossible"
                                @click="toggleBlockBoth"
                            >
                                <q-item-side
                                    icon="block"
                                    color="primary"
                                />
                                <q-item-main
                                    :label="blockBothLabel"
                                />
                            </q-item>
                            <q-item
                                @click="deleteVoicemail(voiceMail)"
                            >
                                <q-item-side
                                    icon="delete"
                                    color="negative"
                                />
                                <q-item-main
                                    :label="$t('conversations.deleteVoicemailTitle')"
                                />
                            </q-item>
                        </q-list>
                    </q-popover>
                </q-btn>
            </q-item-tile>
        </q-item-side>
    </q-item>
</template>

<script>
    import {
        mapGetters
    } from 'vuex'
    import CscCallOptionList from './CscCallOptionList'
    import CscAudioPlayer from '../../CscAudioPlayer'
    import {
        QList,
        QItem,
        QItemSide,
        QItemMain,
        QItemTile,
        QPopover,
        QBtn
    } from 'quasar-framework'
    export default {
        name: 'csc-voice-mail-item',
        props: [
            'voiceMail',
            'callAvailable',
            'blockIncomingLabel',
            'blockOutgoingLabel',
            'blockBothLabel',
            'blockBothPossible'
        ],
        components: {
            QList,
            QItem,
            QItemSide,
            QItemMain,
            QItemTile,
            QPopover,
            QBtn,
            CscAudioPlayer,
            CscCallOptionList
        },
        data () {
            return {
                platform: this.$q.platform.is
            }
        },
        computed: {
            ...mapGetters('conversations', [
                'playVoiceMailState',
                'playVoiceMailUrl'
            ]),
            direction() {
                if(this.voiceMail.direction === 'out') {
                    return 'to';
                }
                else {
                    return 'from';
                }
            },
            soundFileFormat() {
                return this.platform.mozilla ? 'ogg' : 'mp3';
            },
            soundFileUrl() {
                let getter = this.playVoiceMailUrl;
                return getter(this.voiceMail.id);
            },
            voiceMailLoaded() {
                return this.playVoiceMailState(this.voiceMail.id) === 'succeeded';
            }
        },
        methods: {
            playVoiceMail() {
                this.$emit('play-voice-mail', {
                    id: this.voiceMail.id,
                    format: this.soundFileFormat
                });
            },
            downloadVoiceMail() {
                this.$emit('download-voice-mail', this.voiceMail);
            },
            load() {
                this.playVoiceMail();
                this.$refs.voicemailPlayer.setPlayingTrue();
                this.$refs.voicemailPlayer.setPausedFalse();
            },
            startCall() {
                this.$refs.callPopover.close();
                this.$emit('start-call', this.voiceMail.callee);
            },
            toggleBlockIncoming() {
                this.$emit('toggle-block-incoming');
            },
            toggleBlockOutgoing() {
                this.$emit('toggle-block-outgoing');
            },
            toggleBlockBoth() {
                this.$emit('toggle-block-both');
            },
            deleteVoicemail(voiceMail) {
                this.$refs.callPopover.close();
                this.$emit('delete-voicemail', voiceMail)
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">

    .csc-voice-mail-player
        padding 0
        margin-top 16px

</style>
