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
                <span class="csc-entity-title">
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
                <csc-voice-mail-player
                    :id="voiceMail.id"
                    class="csc-voice-mail-player"
                    @play-voice-mail="playVoiceMail"
                />
            </q-item-tile>
        </q-item-main>
        <q-item-side
            right
            class="csc-item-buttons"
        >
            <q-item-tile>
                <q-btn
                    icon="file_download"
                    color="primary"
                    slot="right"
                    flat
                    @click="downloadVoiceMail"
                >
                </q-btn>
                <q-btn
                    v-if="callAvailable"
                    icon="call"
                    color="primary"
                    slot="right"
                    flat
                >
                    <q-popover ref="callPopover" anchor="bottom right" self="top right">
                        <csc-call-option-list
                            ref="callOptionPopover"
                            @init-call="initCall"
                        />
                    </q-popover>
                </q-btn>
            </q-item-tile>
        </q-item-side>
    </q-item>
</template>

<script>
    import CscCallOptionList from './CscCallOptionList'
    import CscVoiceMailPlayer from './CscVoiceMailPlayer'
    import {
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
            QItem,
            QItemSide,
            QItemMain,
            QItemTile,
            QPopover,
            QBtn,
            CscVoiceMailPlayer,
            CscCallOptionList
        },
        data () {
            return {}
        },
        computed: {
            direction() {
                if(this.voiceMail.direction === 'out') {
                    return 'to';
                }
                else {
                    return 'from';
                }
            }
        },
        methods: {
            initCall(media) {
                this.$refs.callPopover.close();
                this.$emit('init-call', {
                    media: media,
                    number: this.voiceMail.callee
                });
            },
            playVoiceMail() {
                this.$emit('play-voice-mail', this.voiceMail);
            },
            downloadVoiceMail() {
                this.$emit('download-voice-mail', this.voiceMail);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">

    .csc-voice-mail-player
        padding 0
        margin-top 16px

</style>
