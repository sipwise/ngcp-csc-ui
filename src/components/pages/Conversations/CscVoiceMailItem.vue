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
            'callAvailable'
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
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">

    .csc-voice-mail-player
        padding 0
        margin-top 16px

</style>
