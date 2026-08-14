<template>
    <q-item>
        <csc-dialog-transcript
            ref="transcriptDialog"
            :full-width="isTranscriptReady"
            :text="getTranscriptText"
            :status="getTranscriptStatus"
            :is-loading="isLoadingTranscript"
            @hide="hideTranscriptDialog"
        />
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
                {{ $filters.destinationFormat(voicemailCaller) }}
            </q-item-label>
            <q-item-label
                caption
            >
                {{ $filters.smartTime(voiceMail.start_time) }}
            </q-item-label>
            <q-item-label
                caption
            >
                {{ $t('Duration') }}
                {{ voiceMail.duration }}
                {{ $t('seconds') }}
            </q-item-label>
            <q-item-label
                v-if="voiceMail.folder"
                caption
            >
                {{ $t('Folder : ') }}
                {{ voiceMail.folder.toUpperCase() }}
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
                <csc-popup-menu-item
                    icon="description"
                    color="primary"
                    :label="$t('Transcript')"
                    @click="getVoicemailTranscript"
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
import CscAudioPlayer from 'components/CscAudioPlayer'
import CscDialogTranscript from 'components/CscDialogTranscript'
import CscMoreMenu from 'components/CscMoreMenu'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import CscPopupMenuItemDelete from 'components/CscPopupMenuItemDelete'
import CscPopupMenuItemStartCall from 'components/CscPopupMenuItemStartCall'
import { showGlobalError } from 'src/helpers/ui'
import { RequestState } from 'src/store/common'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
    name: 'CscVoiceMailItem',
    components: {
        CscPopupMenuItemDelete,
        CscPopupMenuItemStartCall,
        CscPopupMenuItem,
        CscMoreMenu,
        CscAudioPlayer,
        CscDialogTranscript
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
    emits: [
        'delete-voicemail',
        'toggle-block-both',
        'toggle-block-outgoing',
        'toggle-block-incoming',
        'start-call',
        'download-voice-mail',
        'play-voice-mail',
        'get-voicemail-transcript'
    ],
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
        ...mapState('conversations', [
            'playVoiceMailErrors',
            'playVoiceMailStates'
        ]),
        ...mapGetters('transcriptions', [
            'getTranscriptText',
            'getTranscriptStatus'
        ]),
        ...mapState('transcriptions', [
            'transcriptState',
            'transcript',
            'transcriptError'
        ]),
        direction () {
            if (this.voiceMail.direction === 'out') {
                return 'to'
            }
            return 'from'
        },
        isLoadingTranscript () {
            return this.transcriptState === 'requesting'
        },
        isTranscriptReady () {
            return this.getTranscriptStatus === 'done'
        },
        voicemailCaller () {
            return this.voiceMail.caller_phonebook_name || this.voiceMail.caller
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
    watch: {
        playVoiceMailStates: {
            deep: true,
            handler (state) {
                if (state[this.voiceMail.id] === RequestState.failed) {
                    showGlobalError(this.playVoiceMailErrors[this.voiceMail.id])
                }
            }
        },
        transcriptState (state) {
            if (state === RequestState.failed) {
                return showGlobalError(this.transcriptError)
            }
        }
    },
    methods: {
        ...mapActions('transcriptions', [
            'clearTranscriptData'
        ]),
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
        getVoicemailTranscript () {
            this.$emit('get-voicemail-transcript', this.voiceMail.id)
            this.$refs.transcriptDialog.show()
        },
        hideTranscriptDialog () {
            this.$refs.transcriptDialog.hide()
            this.clearTranscriptData()
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
