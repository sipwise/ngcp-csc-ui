<template>
    <q-field
        class="csc-upload-field"
        :icon="icon"
        :label="label"
    >
        <div
            v-if="label"
            class="row items-end"
        >
            <slot
                class="col-auto"
                name="additional"
            >
            </slot>
            <q-input
                class="col-xl col-sm-12"
                :disable="isPlaying"
                dark
                readonly
                :value="inputValue"
                :after="inputButtons"
            />
        </div>
        <q-input
            v-if="floatLabel"
            :disable="isPlaying"
            dark
            readonly
            :float-label="floatLabel"
            :value="inputValue"
            :after="inputButtons"
        />
        <input
            v-show="false"
            :accept="fileTypes"
            ref="fileUpload"
            type="file"
            @change="inputChange"
        />
        <div
            v-show="uploading"
            class="row no-wrap csc-upload-progress-field"
        >
            <q-chip
                square
                color="primary"
                class="upload-chip"
            >
                {{ `${progress}%` }}
            </q-chip>
            <q-progress
                stripe
                animate
                color="primary"
                :percentage="progress"
                class="upload-progress"
            />
        </div>
        <csc-audio-player
            v-if="!hidePlayer"
            ref="audioPlayer"
            class="csc-greeting-player"
            :file-url="fileUrl"
            :loaded="loaded"
            :disable="disablePlayer"
            @load="init"
            @playing="audioPlayerPlaying"
            @stopped="audioPlayerStopped"
        />
        <div
            v-if="!hidePlayer"
            class="csc-file-upload-actions"
        >
            <q-btn
                v-if="selectedFile != null"
                flat
                color="default"
                icon="clear"
                @click="cancel"
            >
                {{ $t('buttons.cancel') }}
            </q-btn>
            <q-btn
                flat
                v-if="selectedFile != null && !uploading"
                color="primary"
                icon="cloud_upload"
                @click="upload"
            >
                {{ $t('buttons.upload') }}
            </q-btn>
            <q-btn
                :disable="isPlaying"
                flat
                v-if="uploaded && selectedFile == null"
                color="primary"
                icon="undo"
                @click="undo"
            >
                {{ $t('buttons.resetDefaults') }}
            </q-btn>
        </div>
    </q-field>
</template>

<script>
    import CscAudioPlayer from '../CscAudioPlayer'
    import {
        QInput,
        QField,
        QBtn,
        QChip,
        QProgress
    } from 'quasar-framework'
    export default {
        name: 'csc-sound-file-upload',
        components: {
            CscAudioPlayer,
            QInput,
            QField,
            QBtn,
            QChip,
            QProgress
        },
        props: [
            'icon',
            'label',
            'value',
            'uploading',
            'uploaded',
            'progress',
            'fileTypes',
            'fileUrl',
            'loaded',
            'disabled',
            'hidePlayer',
            'floatLabel',
            'stopAll'
        ],
        data () {
            return {
                selectedFile: null,
                isPlaying: false
            }
        },
        computed: {
            disablePlayer() {
                return (this.selectedFile ? true : false) || !this.uploaded;
            },
            inputValue() {
                if(this.selectedFile === null) {
                    return this.value;
                }
                else {
                    return this.selectedFile.name;
                }
            },
            inputButtons() {
                let buttons = [];
                let self = this;
                if (this.isPlaying || this.disabled) {
                    buttons.push({
                            icon: 'folder',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                            }
                        }
                    );
                }
                else {
                    buttons.push({
                            icon: 'folder',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.$refs.fileUpload.click();
                            }
                        }
                    );
                }
                return buttons;
            }
        },
        methods: {
            setPlayingTrue() {
                this.$refs.audioPlayer.setPlayingTrue();
                this.isPlaying = true;
            },
            setPausedFalse() {
                this.$refs.audioPlayer.setPausedFalse();
            },
            audioPlayerPlaying() {
                this.isPlaying = true;
            },
            audioPlayerStopped() {
                this.isPlaying = false;
            },
            inputChange(event) {
                this.selectedFile = event.target.files[0];
            },
            cancel() {
                this.selectedFile = null;
                this.$refs.fileUpload.value = null;
                if (this.uploading) {
                    this.abort();
                }
            },
            upload() {
                this.$emit('upload', this.selectedFile);
            },
            abort() {
                this.$emit('abort');
            },
            reset() {
                this.cancel();
            },
            undo() {
                this.$emit('reset');
            },
            init() {
                this.$emit('init');
            }
        },
        watch: {
            stopAll(state) {
                if (state && this.$refs.audioPlayer) {
                    this.$refs.audioPlayer.stop();
                    this.audioPlayerStopped();
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../themes/quasar.variables';

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
