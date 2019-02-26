<template>
    <q-field
        class="csc-upload-field"
        :icon="icon"
        :label="noFloatLabel"
    >
        <!--TODO: 1. See if you need to simplify noFloat/hidePlayer/width into one single param-->
        <!--TODO: 2. Try making it work to simply pass in :float-label if float and :label if normal-->
        <!--TODO: 3. Adjust styling with reactively added classes depending on whether slot is used or not-->
        <div class="row items-end">
            <slot
                class="col-auto"
                name="additional"
            >
            </slot>
            <q-input
                class="col-xl col-sm-12"
                v-if="!noFloat"
                :disable="isPlaying"
                dark
                readonly
                :float-label="label"
                :value="inputValue"
                :after="inputButtons"
            />
            <q-input
                class="col-xl col-sm-12"
                v-if="noFloat"
                :disable="isPlaying"
                dark
                readonly
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
        </div>
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
            :file-url="fileUrl"
            :loaded="loaded"
            class="csc-greeting-player"
            @load="init"
            :disable="disablePlayer"
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
            'noFloat'
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
            },
            noFloatLabel() {
                if (this.noFloat) {
                    return this.label;
                }
                else {
                    return '';
                }
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
