<template>
    <div
        :class="itemClasses"
    >
        <div
            class="csc-pbx-sound-set-sound-label col-5"
        >
            <q-icon
                class="csc-pbx-sound-set-sound-icon"
                name="music_note"
                size="24px"
            />{{ soundHandle.handle }}
        </div>
        <div
            class="col-grow"
        >
            <div
                class="row items-center"
            >
                <div
                    class="col-6"
                >
                    <input
                        v-show="false"
                        ref="fileUpload"
                        accept=".wav,.mp3,.ogg"
                        type="file"
                        @input="selectFile"
                    >
                    <q-icon
                        v-if="(soundFile && soundFile.filename) || selectedFile"
                        name="insert_drive_file"
                        class="csc-pbx-sound-set-sound-icon"
                        size="24px"
                    />
                    <span
                        v-if="!selectedFile && soundFile"
                    >
                        {{ soundFileFilename }}
                    </span>
                    <span
                        v-else-if="selectedFile"
                    >
                        {{ selectedFile.name }}
                    </span>
                    <span
                        v-else
                    >
                        No file attached
                    </span>
                </div>
                <div
                    class="col-grow text-right"
                >
                    <q-btn
                        v-if="!selectedFile && !readOnly"
                        flat
                        color="primary"
                        icon="folder"
                        :disable="isUpdating || isUploading || isSoundFileRemoving"
                        @click="openFileSelectionDialog"
                    >
                        Select file
                    </q-btn>
                    <q-btn
                        v-if="soundFile && !selectedFile && !readOnly"
                        flat
                        color="negative"
                        icon="delete"
                        :disable="isUpdating || isSoundFileRemoving"
                        @click="removeUploadedFile"
                    >
                        {{ $t('Remove') }}
                    </q-btn>
                    <q-btn
                        v-if="selectedFile && !isUploading"
                        flat
                        color="primary"
                        icon="cloud_upload"
                        @click="uploadFile"
                    >
                        Upload
                    </q-btn>
                    <q-btn
                        v-if="selectedFile && !isUploading"
                        flat
                        color="white"
                        icon="undo"
                        @click="resetFile"
                    >
                        Reset
                    </q-btn>
                </div>
            </div>
            <div
                v-if="isUploading"
                class="row items-center"
            >
                <div
                    class="csc-progress-col col-grow"
                >
                    <q-linear-progress
                        :buffer="soundFileUploadProgress * 0.01"
                        color="primary"
                        stripe
                        height="24px"
                    />
                </div>
            </div>
            <div
                class="row items-center"
            >
                <div
                    v-if="hasParent"
                    class="col-auto"
                >
                    <q-checkbox
                        :model-value="soundFileUseparent"
                        :disable="readOnly || isUploading || isUpdating || isSoundFileRemoving"
                        :label="$t('Use Parent')"
                        left-label
                        @update:model-value="toggleUseParent"
                    />
                </div>
                <template
                    v-if="soundFile && !selectedFile && soundFile.filename"
                >
                    <div
                        class="col-auto"
                    >
                        <q-checkbox
                            :model-value="soundFileLoopplay"
                            :label="$t('Loop')"
                            :disable="readOnly || isUpdating || isSoundFileRemoving"
                            left-label
                            @update:model-value="toggleLoopPlay"
                        />
                    </div>
                    <div
                        class="csc-col-right col-grow"
                    >
                        <csc-audio-player
                            v-if="soundFile && soundFile.filename"
                            :file-url="soundFileUrl"
                            @load="loadPlay"
                        />
                    </div>
                </template>
            </div>
        </div>
        <csc-object-spinner
            v-if="isUpdating"
            :loading="isUpdating"
        />
    </div>
</template>

<script>
import CscAudioPlayer from 'components/CscAudioPlayer'
import CscObjectSpinner from 'components/CscObjectSpinner'
import { RequestState } from 'src/store/common'
import { mapGetters } from 'vuex'

export default {
    name: 'CscPbxSoundSetSound',
    components: {
        CscObjectSpinner,
        CscAudioPlayer
    },
    props: {
        odd: {
            type: Boolean,
            default: false
        },
        soundHandle: {
            type: Object,
            default: null
        },
        soundFile: {
            type: Object,
            default: null
        },
        soundFileUrl: {
            type: String,
            default: null
        },
        soundFileUploadState: {
            type: String,
            default: null
        },
        soundFileUploadProgress: {
            type: Number,
            default: 0
        },
        soundFileUpdateState: {
            type: String,
            default: null
        },
        hasParent: {
            type: Number,
            default: null
        },
        readOnly: {
            type: Boolean,
            default: false
        }
    },
    emits: ['play', 'upload', 'toggle-loop-play', 'toggle-use-parent', 'remove-uploaded-file'],
    data () {
        return {
            selectedFile: null,
            selectedFileUploading: false
        }
    },
    computed: {
        ...mapGetters('pbxSoundSets', [
            'isSoundFileRemoving'
        ]),
        soundFileLoopplay () {
            if (this.soundFile && this.soundFile.loopplay) {
                return this.soundFile.loopplay
            }
            return false
        },
        soundFileFilename () {
            if (this.soundFile && this.soundFile.filename) {
                return this.soundFile.filename
            } else if (this.soundFile && !this.soundFile.filename) {
                return this.$t('(empty)')
            }
            return ''
        },
        soundFileId () {
            if (this.soundFile && this.soundFile.id) {
                return this.soundFile.id
            }
            return null
        },
        soundFileUseparent () {
            if (this.soundFile) {
                return this.soundFile.use_parent
            }
            return true
        },
        itemClasses () {
            const classes = ['csc-pbx-sound-set-sound', 'row', 'items-center']
            if (this.odd) {
                classes.push('csc-pbx-sound-set-sound-odd')
            }
            return classes
        },
        isUploading () {
            return this.soundFileUploadState === RequestState.requesting
        },
        isUpdating () {
            return this.soundFileUpdateState === RequestState.requesting
        }
    },
    watch: {
        soundFileUploadState (state) {
            if (state === RequestState.succeeded || state === RequestState.failed) {
                this.selectedFile = this.resetFile()
            }
        }
    },
    mounted () {
    },
    methods: {
        openFileSelectionDialog () {
            if (this.$refs.fileUpload) {
                this.$refs.fileUpload.click()
            }
        },
        selectFile (event) {
            this.selectedFile = event.target.files[0]
        },
        resetFile () {
            this.selectedFile = null
            if (this.$refs.fileUpload) {
                this.$refs.fileUpload.value = ''
            }
        },
        loadPlay () {
            this.$emit('play', this.soundFile)
        },
        uploadFile () {
            this.$emit('upload', {
                soundHandle: this.soundHandle.handle,
                soundFileData: this.selectedFile
            })
        },
        toggleLoopPlay () {
            this.$emit('toggle-loop-play', {
                soundSetId: this.soundFile.set_id,
                soundHandle: this.soundFile.handle,
                soundFileId: this.soundFile.id,
                loopPlay: !this.soundFileLoopplay
            })
        },
        toggleUseParent () {
            if (!this.soundFile) {
                this.$emit('upload', {
                    soundHandle: this.soundHandle.handle,
                    soundFileData: null,
                    useParent: false
                })
            } else {
                this.$emit('toggle-use-parent', {
                    soundSetId: this.soundFile.set_id,
                    soundHandle: this.soundFile.handle,
                    soundFileId: this.soundFile.id,
                    useParent: !this.soundFileUseparent
                })
            }
        },
        removeUploadedFile () {
            this.$emit('remove-uploaded-file', {
                soundFileId: this.soundFile.id,
                soundSetId: this.soundFile.set_id,
                soundHandle: this.soundFile.handle
            })
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">

.csc-progress-col
    margin-top: $flex-gutter-xs
    .q-progress
        height: 24px
.csc-pbx-sound-set-sound.csc-pbx-sound-set-sound-odd
    background-color: $item-stripe-color
.csc-pbx-sound-set-sound
    position: relative
    padding: $flex-gutter-xs
    .csc-col-right
        padding-left: $flex-gutter-sm
    .csc-pbx-sound-set-sound-icon
        margin-right: $flex-gutter-xs
    .csc-pbx-sound-set-sound-player
        padding-left: $flex-gutter-md
        .q-input
            margin: 0
    .csc-pbx-sound-set-sound-label
        color: rgba($white, 60%)
    .audio-player
        .progress-bar
            margin-right: 0
</style>
