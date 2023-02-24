<template>
    <q-list>
        <q-item
            class="no-padding"
        >
            <q-item-section>
                <q-input
                    readonly
                    :value="inputValue"
                    :loading="uploading || updating"
                    :label="label || floatLabel"
                >
                    <template
                        v-slot:loading
                    >
                        <q-spinner-dots
                            color="primary"
                        />
                    </template>
                    <template
                        v-slot:prepend
                    >
                        <q-icon
                            :name="icon"
                        />
                    </template>
                    <template
                        v-slot:append
                    >
                        <q-btn
                            v-if="!uploaded && selectedFile === null"
                            icon="folder"
                            color="primary"
                            flat
                            dense
                            :label="$t('Select')"
                            data-cy="csc-fileselect-select"
                            :disable="isPlaying"
                            @click="$refs.fileUpload.click()"
                        />
                        <q-btn
                            v-if="uploaded"
                            icon="delete"
                            color="negative"
                            flat
                            dense
                            :label="$t('Remove')"
                            data-cy="csc-fileselect-remove"
                            :disable="isPlaying"
                            @click="remove"
                        />
                        <q-btn
                            v-if="selectedFile !== null && !uploading && !uploaded"
                            icon="undo"
                            color="primary"
                            flat
                            dense
                            :label="$t('Reset')"
                            data-cy="csc-fileselect-reset"
                            :disable="isPlaying"
                            @click="cancel"
                        />
                        <q-btn
                            v-if="selectedFile !== null && !uploading && !uploaded"
                            icon="cloud_upload"
                            color="primary"
                            flat
                            dense
                            :label="$t('Upload')"
                            data-cy="csc-fileselect-upload"
                            :disable="isPlaying"
                            @click="upload"
                        />
                    </template>
                </q-input>
                <input
                    v-show="false"
                    ref="fileUpload"
                    :accept="fileTypes"
                    type="file"
                    @change="inputChange"
                >
            </q-item-section>
        </q-item>
        <q-item
            v-show="uploading"
            class="no-padding"
        >
            <q-linear-progress
                stripe
                animate
                color="primary"
                size="24px"
                :value="progress"
            >
                <div
                    class="absolute-full flex flex-center"
                >
                    <q-badge
                        color="primary"
                        text-color="accent"
                        :label="progress + '%'"
                    />
                </div>
            </q-linear-progress>
        </q-item>
        <q-item
            v-show="uploaded"
            class="no-padding"
        >
            <q-item-section>
                <csc-audio-player
                    ref="audioPlayer"
                    :file-url="fileUrl"
                    :loaded="loaded"
                    :disable="disablePlayer"
                    @load="init"
                    @playing="audioPlayerPlaying"
                    @stopped="audioPlayerStopped"
                />
            </q-item-section>
        </q-item>
    </q-list>
</template>

<script>
import CscAudioPlayer from '../CscAudioPlayer'
export default {
    name: 'CscSoundFileUpload',
    components: {
        CscAudioPlayer
    },
    props: {
        icon: {
            type: String,
            default: ''
        },
        label: {
            type: String,
            default: ''
        },
        value: {
            type: String,
            default: ''
        },
        uploading: {
            type: Boolean,
            default: false
        },
        uploaded: {
            type: Boolean,
            default: false
        },
        progress: {
            type: Number,
            default: 0
        },
        fileTypes: {
            type: String,
            default: ''
        },
        fileUrl: {
            type: String,
            default: null
        },
        loaded: {
            type: Boolean,
            default: false
        },
        disable: {
            type: Boolean,
            default: false
        },
        floatLabel: {
            type: String,
            default: ''
        },
        deleteTerm: {
            type: String,
            default: ''
        },
        updating: {
            type: Boolean,
            default: false
        },
        stopAll: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            selectedFile: null,
            isPlaying: false
        }
    },
    computed: {
        disablePlayer () {
            return (!!this.selectedFile) || !this.uploaded
        },
        inputValue () {
            if (this.selectedFile === null) {
                return this.value
            } else {
                return this.selectedFile.name
            }
        },
        removeLabel () {
            if (this.deleteTerm === 'remove') {
                return this.$t('Remove file')
            } else {
                return this.$t('Reset to defaults')
            }
        },
        removeIcon () {
            if (this.deleteTerm === 'remove') {
                return 'delete'
            } else {
                return 'undo'
            }
        }
    },
    watch: {
        stopAll (state) {
            if (state && this.$refs.audioPlayer) {
                this.$refs.audioPlayer.stop()
                this.audioPlayerStopped()
            }
        },
        uploaded (uploaded) {
            if (uploaded) {
                this.reset()
            }
        }
    },
    methods: {
        setPlayingTrue () {
            this.$refs.audioPlayer.setPlayingTrue()
            this.isPlaying = true
        },
        setPausedFalse () {
            this.$refs.audioPlayer.setPausedFalse()
        },
        audioPlayerPlaying () {
            this.isPlaying = true
        },
        audioPlayerStopped () {
            this.isPlaying = false
        },
        inputChange (event) {
            this.selectedFile = event.target.files[0]
        },
        cancel () {
            this.selectedFile = null
            this.$refs.fileUpload.value = null
            if (this.uploading) {
                this.abort()
            }
        },
        upload () {
            this.$emit('upload', this.selectedFile)
        },
        abort () {
            this.$emit('abort')
        },
        reset () {
            this.cancel()
        },
        remove () {
            this.$emit('remove')
        },
        init () {
            this.$emit('init')
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-upload-field
        margin-bottom 40px

        .q-field-icon
            color $primary

        .items-end
            margin-left -1.3rem

    .csc-upload-field.csc-player-margin
        margin-bottom 0

    .csc-upload-progress-field
        margin 10px 0 5px 0

        .upload-chip
            min-height 20px
            height 20px
            width 50px
            border-top-right-radius 0
            border-bottom-right-radius 0

        .upload-progress
            height 20px

    .csc-greeting-player
        padding 0

</style>
