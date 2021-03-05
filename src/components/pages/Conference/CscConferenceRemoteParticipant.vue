<template>
    <q-card
        class="bg-transparent"
        flat
    >
        <q-card-section
            class="relative-position bg-black text-center full-width no-padding"
            style="height: 100px"
        >
            <q-icon
                v-ripple
                name="more_vert"
                class="absolute-left"
                style="z-index: 1; padding-top: 3px;"
            >
                <csc-popup-menu>
                    <csc-popup-menu-item
                        color="primary"
                        dense
                        :label="audioLabel()"
                        @click="toggleAudio()"
                    />
                </csc-popup-menu>
            </q-icon>
            <q-icon
                v-show="isAudioMuted"
                v-ripple
                name="volume_off"
                class="absolute-right"
                :style="audioIconStyle"
            />
            <q-icon
                v-show="!isAudioMuted"
                v-ripple
                name="volume_up"
                class="absolute-right"
                :style="audioIconStyle"
            />
            <q-avatar
                v-show="!hasRemoteVideo"
                class="absolute-center"
                style="top: 40px"
            >
                <q-icon
                    name="person"
                    size="32px"
                />
            </q-avatar>
            <csc-media
                v-show="hasRemoteVideo"
                ref="cscMedia"
                class="csc-media-cont"
                :preview="false"
                :muted="true"
            />
        </q-card-section>
        <div
            class="absolute-bottom text-center bg-main-menu q-pa-xs"
        >
            {{ remoteParticipant.displayName }}
        </div>
    </q-card>
</template>

<script>
import _ from 'lodash'
import CscMedia from '../../CscMedia'
import CscPopupMenu from 'components/CscPopupMenu'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import {
    TouchHold
} from 'quasar'
import {
    mapGetters,
    mapState
} from 'vuex'
export default {
    name: 'CscConferenceRemoteParticipant',
    directives: {
        TouchHold
    },
    components: {
        CscMedia,
        CscPopupMenu,
        CscPopupMenuItem
    },
    props: {
        remoteParticipant: {
            type: Object,
            default: () => {
                return {
                    displayName: ''
                }
            }
        },
        remoteMediaStream: {
            type: Function,
            default: null
        },
        remoteMediaStreams: {
            type: Object,
            default () {
                return []
            }
        },
        hasRemoteVideo: {
            type: Boolean,
            default: false
        }
    },
    data: function () {
        return {
            isAudioMuted: false,
            localMediaStream: null
        }
    },
    computed: {
        ...mapState('conference', [
            'manualSelection'
        ]),
        ...mapGetters('conference', [
            'selectedParticipant',
            'mutedState'
        ]),
        audioIconStyle () {
            return 'z-index: 1; padding-top: 3px; padding-right: 3px;'
        }
    },
    watch: {
        remoteMediaStreams () {
            this.assignStream()
        },
        mutedState () {
            this.isAudioMuted = _.has(this.mutedState, this.remoteParticipant.id)
            this.$refs.cscMedia.toggleAudio(this.isAudioMuted)
        }
    },
    mounted () {
        this.assignStream()
        if (!this.manualSelection && this.remoteParticipant) {
            this.$store.commit('conference/setSelectedParticipant', this.remoteParticipant.id)
        }
    },
    methods: {
        assignStream () {
            if (this.$refs.cscMedia && _.has(this.remoteMediaStreams, this.remoteParticipant.id)) {
                this.localMediaStream = this.remoteMediaStream(this.remoteParticipant.id)
                this.$refs.cscMedia.assignStream(this.localMediaStream)
                if (this.selectedParticipant === this.remoteParticipant.id) {
                    this.$store.commit('conference/setSelectedParticipant', 'local') // TODO improve (workaround to reset the mediaStream)
                    this.$store.commit('conference/setSelectedParticipant', this.remoteParticipant.id)
                }
            } else if (this.$refs.cscMedia) {
                this.$refs.cscMedia.reset()
            }
        },
        toggleAudio () {
            this.isAudioMuted
                ? this.$store.commit('conference/removeMutedState', this.remoteParticipant.id)
                : this.$store.commit('conference/addMutedState', this.remoteParticipant.id)
        },
        audioLabel () {
            return this.isAudioMuted
                ? this.$t('Unmute')
                : this.$t('Mute')
        },
        showMenu () {
            this.$refs.popover.open()
        }
    }
}
</script>
