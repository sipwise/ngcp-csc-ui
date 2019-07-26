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
            />{{ soundHandle.group  }} {{ soundHandle.handle  }}
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
                        accept=".wav,.mp3,.ogg"
                        ref="fileUpload"
                        type="file"
                        @change="selectFile"
                    />
                    <q-icon
                        v-if="soundFile || selectedFile"
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
                        v-if="!selectedFile"
                        dark
                        flat
                        color="primary"
                        icon="folder"
                        @click="openFileSelectionDialog"
                        >Select file</q-btn>
                    <q-btn
                        v-if="selectedFile && !isUploading"
                        dark
                        flat
                        color="primary"
                        icon="cloud_upload"
                        @click="uploadFile"
                        >Upload</q-btn>
                    <q-btn
                        v-if="selectedFile && !isUploading"
                        dark
                        flat
                        color="white"
                        icon="undo"
                        @click="resetFile"
                    >Reset</q-btn>
                </div>

            </div>
            <div
                v-if="isUploading"
                class="row items-center"
            >
                <div
                    class="csc-progress-col col-grow"
                >
                    <q-progress
                        :percentage="soundFileUploadProgress"
                        color="primary"
                        stripe
                        animate
                        heigth="24px"
                    />
                </div>
            </div>
            <div
                v-if="soundFile && !selectedFile"
                class="row items-center"
            >
                <div
                    class="col-auto"
                >
                    <q-checkbox
                        :value="soundFileLoopplay"
                        label="Loop"
                        left-label
                        @input="toggleLoopPlay"
                    />
                </div>
                <div
                    class="csc-col-right col-grow"
                >
                    <csc-audio-player
                        v-if="soundFileFilename"
                        :file-url="soundFileUrl"
                        @load="loadPlay"
                    />
                </div>
            </div>
        </div>
        <csc-object-spinner
            v-if="isUpdating"
            :loading="isUpdating"
        />
    </div>
</template>

<script>
    import {
        QList,
        QItem,
        QItemMain,
        QToggle,
        QTooltip,
        QCheckbox,
        QInput,
        QIcon,
        QBtn,
        QChip,
        QProgress
    } from 'quasar-framework'
    import CscSoundFileUpload from '../../form/CscSoundFileUpload'
    import CscAudioPlayer from "../../CscAudioPlayer";
    import CscFormSaveButton from "../../form/CscFormSaveButton";
    import {
        RequestState
    } from '../../../store/common'
    import CscObjectSpinner from "../../CscObjectSpinner";
    export default {
        name: 'csc-pbx-sound-set-sound',
        props: [
            'odd',
            'soundHandle',
            'soundFile',
            'soundFileUrl',
            'soundFileUploadState',
            'soundFileUploadProgress',
            'soundFileUpdateState'
        ],
        components: {
            CscObjectSpinner,
            CscFormSaveButton,
            CscAudioPlayer,
            CscSoundFileUpload,
            QList,
            QItem,
            QItemMain,
            QToggle,
            QTooltip,
            QCheckbox,
            QInput,
            QIcon,
            QBtn,
            QChip,
            QProgress
        },
        data () {
            return {
                selectedFile: null,
                selectedFileUploading: false
            }
        },
        mounted() {
        },
        computed: {
            soundFileLoopplay() {
                if(this.soundFile && this.soundFile.loopplay) {
                    return this.soundFile.loopplay;
                }
                return false;
            },
            soundFileFilename() {
                if(this.soundFile && this.soundFile.filename) {
                    return this.soundFile.filename;
                }
                return '';
            },
            soundFileId() {
                if(this.soundFile && this.soundFile.id) {
                    return this.soundFile.id;
                }
                return null;
            },
            itemClasses() {
                let classes = ['csc-pbx-sound-set-sound', 'row', 'items-center'];
                if(this.odd) {
                    classes.push('csc-pbx-sound-set-sound-odd');
                }
                return classes;
            },
            isUploading() {
                return this.soundFileUploadState === RequestState.requesting;
            },
            isUpdating() {
                return this.soundFileUpdateState === RequestState.requesting;
            }
        },
        methods: {
            openFileSelectionDialog() {
                if(this.$refs.fileUpload) {
                    this.$refs.fileUpload.click();
                }
            },
            selectFile(event){
                this.selectedFile = event.target.files[0];
            },
            resetFile() {
                this.selectedFile = null;
                if(this.$refs.fileUpload) {
                    this.$refs.fileUpload.value = '';
                }
            },
            loadPlay() {
                this.$emit('play', this.soundFile);
            },
            uploadFile() {
                this.$emit('upload', {
                    soundHandle: this.soundHandle.handle,
                    soundFileData: this.selectedFile
                });
            },
            toggleLoopPlay() {
                this.$emit('toggle-loop-play', {
                    soundSetId: this.soundFile.set_id,
                    soundHandle: this.soundFile.handle,
                    soundFileId: this.soundFile.id,
                    loopPlay: !this.soundFileLoopplay
                });
            }
        },
        watch: {
            soundFileUploadState(state) {
                if(state === RequestState.succeeded || state === RequestState.failed) {
                    this.selectedFile = this.resetFile();
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables';
    .csc-progress-col
        margin-top $flex-gutter-xs
        .q-progress
            heigth 24px
    .csc-pbx-sound-set-sound.csc-pbx-sound-set-sound-odd
        background-color $item-stripe-color
    .csc-pbx-sound-set-sound
        position relative
        padding $flex-gutter-xs
        .csc-col-right
            padding-left $flex-gutter-sm
        .csc-pbx-sound-set-sound-icon
            margin-right $flex-gutter-xs
        .csc-pbx-sound-set-sound-player
            padding-left $flex-gutter-md
            .q-input
                margin 0
        .csc-pbx-sound-set-sound-label
            color alpha($white, 0.6)
        .audio-player
            .progress-bar
                margin-right 0
</style>
