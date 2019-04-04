<template>
    <q-item
        highlight
        :class="itemClasses"
    >
        <q-item-main>
            <csc-sound-file-upload
                ref="uploadSoundFile"
                file-types=".wav,.mp3"
                delete-term="remove"
                icon="music_note"
                :label="handleName"
                :value="fileLabel"
                :progress="uploadSoundFileProgress(item.handle)"
                :file-url="playSoundFileUrl(item.id)"
                :loaded="playSoundFileLoaded(item.id)"
                :stop-all="!isLastPlayed(item.id)"
                :uploading="uploadSoundFileRequesting(item.handle)"
                :uploaded="file"
                :invalid="isInvalid"
                :updating="updating"
                @remove="removeFile"
                @init="initSoundFileAudio"
                @upload="uploadSoundFile"
                @abort="abortUpload"
            >
                <div
                    slot="additional"
                >
                    <q-toggle
                        v-model="loop"
                        unchecked-icon="loop"
                        checked-icon="loop"
                        :disable="true"
                        :class="loopClasses"
                        :label="$t('pbxConfig.playingInLoop')"
                    />
                    <q-tooltip>
                        {{ loopTooltipLabel }}
                    </q-tooltip>
                </div>
            </csc-sound-file-upload>
        </q-item-main>
    </q-item>
</template>

<script>
    import {
        QList,
        QItem,
        QItemMain,
        QToggle,
        QTooltip
    } from 'quasar-framework'
    import CscSoundFileUpload from '../../form/CscSoundFileUpload'
    import {
        mapGetters
    } from 'vuex'
    import { showToast } from '../../../helpers/ui'
    export default {
        name: 'csc-pbx-sound-item',
        props: {
            item: Object,
            group: String,
            updating: Boolean,
            setId: Number
        },
        components: {
            CscSoundFileUpload,
            QList,
            QItem,
            QItemMain,
            QToggle,
            QTooltip
        },
        data () {
            return {
                loop: this.hasLoop(),
                file: this.hasFile(),
                platform: this.$q.platform.is
            }
        },
        mounted() {
        },
        computed: {
            ...mapGetters('pbxConfig', {
                playSoundFileUrl: 'playSoundFileUrl',
                playSoundFileLoaded: 'playSoundFileLoaded',
                isLastPlayed: 'isLastPlayed',
                uploadSoundFileProgress: 'uploadSoundFileProgress',
                uploadSoundFileRequesting: 'uploadSoundFileRequesting',
                uploadSoundFileSucceeded: 'uploadSoundFileSucceeded',
                uploadSoundFileState: 'uploadSoundFileState'
            }),
            handleName() {
                return `${this.group}: ${this.item.handle}`;
            },
            refName() {
                return `handle-${this.item.handle}`;
            },
            fileLabel() {
                let noSound = this.$t('pbxConfig.noSoundUploaded');
                return this.file ? this.item.filename : noSound;
            },
            loopClasses() {
                let classes = ['csc-additional'];
                if(this.loop) {
                    classes.push('csc-toggle-enabled');
                }
                else {
                    classes.push('csc-toggle-disabled');
                }
                return classes;
            },
            loopTooltipLabel() {
                return this.loop ?
                    this.$t('pbxConfig.dontPlayInLoop') :
                    this.$t('pbxConfig.playInLoop');
            },
            soundFileFormat() {
                return this.platform.mozilla ? 'ogg' : 'mp3';
            },
            isInvalid() {
                return !this.file;
            },
            itemClasses() {
                let classes = ['csc-sound-item'];
                if(this.isInvalid) {
                    classes.push('csc-item-invalid');
                }
                return classes;
            },
            uploadFileState() {
                return this.uploadSoundFileState(this.item.handle);
            }
        },
        methods: {
            hasLoop() {
                return !!this.item.loopplay;
            },
            hasFile() {
                return this.item.filename ? this.item.filename.length > 0 : false;
            },
            playSoundFile() {
                this.$store.dispatch('pbxConfig/playSoundFile', {
                    id: this.item.id,
                    format: this.soundFileFormat
                });
            },
            initSoundFileAudio() {
                this.playSoundFile();
                this.$refs.uploadSoundFile.setPlayingTrue();
                this.$refs.uploadSoundFile.setPausedFalse();
            },
            removeFile() {
                this.$emit('remove-file', this.item);
            },
            uploadSoundFile(file) {
                let item = Object.assign(this.item, { set_id: this.setId });
                this.$store.dispatch('pbxConfig/uploadSoundFile', {
                    item: item,
                    file: file
                });
            },
            abortUpload() {
                this.$store.dispatch('pbxConfig/abortPreviousSoundFileUpload', this.item.handle);
            },
            resetFile() {
                this.$refs.uploadSoundFile.reset();
                this.$store.commit('pbxConfig/resetProgress', this.item.handle);
            }
        },
        watch: {
            uploadFileState(state) {
                if (state === 'succeeded') {
                    showToast(this.$t('pbxConfig.toasts.uploadSoundFileToast', { handle: this.item.handle }));
                    this.resetFile();
                }
                else if (state === 'failed' && this.uploadProgress > 0) {
                    this.resetFile();
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';

    .csc-sound-item
        .q-field-icon
            padding-left 12px

        .csc-upload-field
            margin 0 0 10px 0

</style>
