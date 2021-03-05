<template>
    <q-item>
        <q-item-section
            side
            top
        >
            <q-icon
                color="white"
                name="voicemail"
            />
        </q-item-section>
        <q-item-section>
            <q-item-label
                class="text-subtitle1"
            >
                {{ $t('Voicemail') }}
                {{ direction }}
                {{ voiceMail.caller | destinationFormat }}
            </q-item-label>
            <q-item-label
                caption
            >
                {{ voiceMail.start_time | smartTime }}
            </q-item-label>
            <q-item-label
                caption
            >
                {{ $t('Duration') }}
                {{ voiceMail.duration }}
                {{ $t('seconds') }}
            </q-item-label>
            <csc-audio-player
                ref="voicemailPlayer"
                :file-url="soundFileUrl"
                :loaded="voiceMailLoaded"
                :pausable="true"
                @load="load"
            />
        </q-item-section>
        <q-item-section
            side
        >
            <csc-more-menu>
                <csc-popup-menu-item
                    icon="file_download"
                    color="primary"
                    :label="$t('Download voicemail')"
                    @click="downloadVoiceMail"
                />
                <csc-popup-menu-item-start-call
                    v-if="callAvailable"
                    @click="startCall"
                />
                <csc-popup-menu-item
                    icon="call_received"
                    color="primary"
                    :label="blockIncomingLabel"
                    @click="toggleBlockIncoming"
                />
                <csc-popup-menu-item
                    icon="call_made"
                    color="primary"
                    :label="blockOutgoingLabel"
                    @click="toggleBlockOutgoing"
                />
                <csc-popup-menu-item
                    icon="block"
                    color="primary"
                    :label="blockBothLabel"
                    @click="toggleBlockBoth"
                />
                <csc-popup-menu-item-delete
                    @click="deleteVoicemail(voiceMail)"
                />
            </csc-more-menu>
        </q-item-section>
    </q-item>
</template>

<script>
import {
    mapGetters
} from 'vuex'
import CscAudioPlayer from '../../CscAudioPlayer'
import CscMoreMenu from 'components/CscMoreMenu'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import CscPopupMenuItemStartCall from 'components/CscPopupMenuItemStartCall'
import CscPopupMenuItemDelete from 'components/CscPopupMenuItemDelete'
export default {
    name: 'CscVoiceMailItem',
    components: {
        CscPopupMenuItemDelete,
        CscPopupMenuItemStartCall,
        CscPopupMenuItem,
        CscMoreMenu,
        CscAudioPlayer
    },
    props: {
        voiceMail: {
            type: Object,
            default: null
        },
        callAvailable: {
            type: Boolean,
            default: false
        },
        blockIncomingLabel: {
            type: String,
            default: ''
        },
        blockOutgoingLabel: {
            type: String,
            default: ''
        },
        blockBothLabel: {
            type: String,
            default: ''
        },
        blockBothPossible: {
            type: Boolean,
            default: false
        }
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
        direction () {
            if (this.voiceMail.direction === 'out') {
                return 'to'
            } else {
                return 'from'
            }
        },
        soundFileFormat () {
            return this.platform.mozilla ? 'ogg' : 'mp3'
        },
        soundFileUrl () {
            const getter = this.playVoiceMailUrl
            return getter(this.voiceMail.id)
        },
        voiceMailLoaded () {
            return this.playVoiceMailState(this.voiceMail.id) === 'succeeded'
        }
    },
    methods: {
        playVoiceMail () {
            this.$emit('play-voice-mail', {
                id: this.voiceMail.id,
                format: this.soundFileFormat
            })
        },
        downloadVoiceMail () {
            this.$emit('download-voice-mail', this.voiceMail)
        },
        load () {
            this.playVoiceMail()
            this.$refs.voicemailPlayer.setPlayingTrue()
            this.$refs.voicemailPlayer.setPausedFalse()
        },
        startCall () {
            this.$emit('start-call', this.voiceMail.callee)
        },
        toggleBlockIncoming () {
            this.$emit('toggle-block-incoming')
        },
        toggleBlockOutgoing () {
            this.$emit('toggle-block-outgoing')
        },
        toggleBlockBoth () {
            this.$emit('toggle-block-both')
        },
        deleteVoicemail (voiceMail) {
            this.$emit('delete-voicemail', voiceMail)
        }
    }
}
</script>
