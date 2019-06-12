<template>
    <!--<q-item-->
        <!--highlight-->
        <!--:class="itemClasses"-->
    <!--&gt;-->
        <!--<q-item-main>-->
            <!--<csc-sound-file-upload-->
                <!--ref="uploadSoundFile"-->
                <!--file-types=".wav,.mp3"-->
                <!--delete-term="remove"-->
                <!--icon="music_note"-->
                <!--:label="handleName"-->
                <!--:value="fileLabel"-->
                <!--:progress="uploadSoundFileProgress(item.handle)"-->
                <!--:file-url="playSoundFileUrl(item.id)"-->
                <!--:loaded="playSoundFileLoaded(item.id)"-->
                <!--:stop-all="!isLastPlayed(item.id)"-->
                <!--:uploading="uploadSoundFileRequesting(item.handle)"-->
                <!--:uploaded="file"-->
                <!--:invalid="isInvalid"-->
                <!--:updating="updating"-->
                <!--@remove="removeFile"-->
                <!--@init="initSoundFileAudio"-->
                <!--@upload="uploadSoundFile"-->
                <!--@abort="abortUpload"-->
            <!--&gt;-->
                <!--<div-->
                    <!--slot="additional"-->
                <!--&gt;-->
                    <!--<q-toggle-->
                        <!--v-if="file"-->
                        <!--v-model="loop"-->
                        <!--checked-icon="loop"-->
                        <!--unchecked-icon="loop"-->
                        <!--:class="loopClasses"-->
                        <!--:label="$t('pbxConfig.playingInLoop')"-->
                        <!--@change="toggleLoop"-->
                    <!--/>-->
                    <!--<q-tooltip>-->
                        <!--{{ loopTooltipLabel }}-->
                    <!--</q-tooltip>-->
                <!--</div>-->
            <!--</csc-sound-file-upload>-->
        <!--</q-item-main>-->
    <!--</q-item>-->
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
                    <!--<q-btn-->
                        <!--dark-->
                        <!--flat-->
                        <!--color="primary"-->
                        <!--icon="cloud_upload"-->
                        <!--@click="openFileSelectionDialog"-->
                    <!--&gt;Upload</q-btn>-->
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
            <!--<div-->
                <!--class=""-->
            <!--&gt;-->
                <!--<q-icon-->
                    <!--name="folder"-->
                <!--/>{{ soundFileFilename }}-->
            <!--</div>-->
            <!--<div-->
                <!--class="col-grow"-->
            <!--&gt;-->

                <!--<q-checkbox-->
                    <!--:value="soundFileLoopplay"-->
                    <!--label="Loop"-->
                    <!--left-label-->
                <!--/>-->
                <!--<csc-audio-player-->
                    <!--v-if="soundFileFilename"-->
                <!--/>-->
            <!--</div>-->
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
    // import {
    //     mapGetters
    // } from 'vuex'
    // import { showToast } from '../../../helpers/ui'
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
                selectedFileUploading: false,
                // loop: this.hasLoop(),
                // file: this.hasFile(),
                // platform: this.$q.platform.is
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
            // ...mapGetters('pbxConfig', [
            //     'playSoundFileUrl',
            //     'playSoundFileLoaded',
            //     'isLastPlayed',
            //     'uploadSoundFileProgress',
            //     'uploadSoundFileRequesting',
            //     'uploadSoundFileState'
            // ]),
            // handleName() {
            //     return `${this.group}: ${this.item.handle}`;
            // },
            // refName() {
            //     return `handle-${this.item.handle}`;
            // },
            // fileLabel() {
            //     let noSound = this.$t('pbxConfig.noSoundUploaded');
            //     return this.file ? this.item.filename : noSound;
            // },
            // loopClasses() {
            //     let classes = ['csc-additional'];
            //     if(this.loop) {
            //         classes.push('csc-toggle-enabled');
            //     }
            //     else {
            //         classes.push('csc-toggle-disabled');
            //     }
            //     return classes;
            // },
            // loopTooltipLabel() {
            //     return this.loop ?
            //         this.$t('pbxConfig.dontPlayInLoop') :
            //         this.$t('pbxConfig.playInLoop');
            // },
            // soundFileFormat() {
            //     return this.platform.mozilla ? 'ogg' : 'mp3';
            // },
            // isInvalid() {
            //     return !this.file;
            // },
            // itemClasses() {
            //     let classes = ['csc-sound-item'];
            //     if(this.isInvalid) {
            //         classes.push('csc-item-invalid');
            //     }
            //     return classes;
            // },
            // uploadFileState() {
            //     return this.uploadSoundFileState(this.item.handle);
            // }
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
            // hasLoop() {
            //     return !!this.item.loopplay;
            // },
            // hasFile() {
            //     return this.item.filename ? this.item.filename.length > 0 : false;
            // },
            // playSoundFile() {
            //     this.$store.dispatch('pbxConfig/playSoundFile', {
            //         id: this.item.id,
            //         format: this.soundFileFormat
            //     });
            // },
            // initSoundFileAudio() {
            //     this.playSoundFile();
            //     this.$refs.uploadSoundFile.setPlayingTrue();
            //     this.$refs.uploadSoundFile.setPausedFalse();
            // },
            // removeFile() {
            //     this.$emit('remove-file', this.item);
            // },
            // uploadSoundFile(file) {
            //     let item = Object.assign(this.item, { set_id: this.setId });
            //     this.$store.dispatch('pbxConfig/uploadSoundFile', {
            //         item: item,
            //         file: file
            //     });
            // },
            // abortUpload() {
            //     this.$store.dispatch('pbxConfig/abortPreviousSoundFileUpload', this.item.handle);
            // },
            // resetFile() {
            //     this.$refs.uploadSoundFile.reset();
            //     this.$store.commit('pbxConfig/resetSoundFileProgress', this.item.handle);
            // },
            // toggleLoop() {
            //     this.$emit('toggle-loop', this.item)
            // }
        },
        watch: {
            soundFileUploadState(state) {
                if(state === RequestState.succeeded || state === RequestState.failed) {
                    this.selectedFile = this.resetFile();
                }
            }
            // uploadFileState(state) {
            //     if (state === 'succeeded') {
            //         showToast(this.$t('pbxConfig.toasts.uploadSoundFileToast', { handle: this.item.handle }));
            //         this.resetFile();
            //     }
            //     else if (state === 'failed' && this.uploadProgress > 0) {
            //         this.resetFile();
            //     }
            // }
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
