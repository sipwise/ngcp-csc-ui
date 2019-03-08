<template>
    <csc-page
        :is-list="true"
    >
        <!--TODO: Remove-->
        <csc-sound-file-upload
            ref="testUpload"
            icon="music_note"
            file-types=".wav,.mp3"
            float-label="My label goes here"
            :value="soundFileLabel"
            :progress="uploadSoundFileProgress"
            :uploading="uploadSoundFileRequesting"
            :uploaded="true"
            @upload="uploadSoundFile"
            @abort="abortUpload"
            @reset="deleteSoundFile"
            :file-url="playSoundFileUrl(125)"
            :loaded="playSoundFileLoaded(125)"
            @init="initSoundFileAudio"
        />
        <q-list
            striped-odd
            no-border
            multiline
            :highlight="!isMobile"
        >
            <csc-pbx-sound-set
                v-for="set in soundSets"
                :loading="soundSetFilesLoading(set.id)"
                :key="set.id"
                :set="set"
                :mobile="isMobile"
                @remove="removeSoundSetDialog"
            />
        </q-list>
        <div
            v-if="soundSets.length === 0 && !isSoundSetsRequesting"
            class="row justify-center csc-no-entities"
        >
            {{ $t('pbxConfig.noSoundSets') }}
        </div>
        <csc-remove-dialog
            ref="removeDialog"
            :title="$t('pbxConfig.removeSoundSetTitle')"
            :message="removeDialogMessage"
            @remove="removeSoundSet"
        />
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    import CscPbxSoundSet from './CscPbxSoundSet'
    import CscRemoveDialog from '../../CscRemoveDialog'
    import CscSoundFileUpload from '../../form/CscSoundFileUpload' // TODO: Remove
    import {
        mapGetters
    } from 'vuex'
    import {
        Platform,
        QList,
        QBtn
    } from 'quasar-framework'
    export default {
        components: {
            CscSoundFileUpload, // TODO: Remove
            CscPage,
            CscPbxSoundSet,
            CscRemoveDialog,
            QList,
            QBtn
        },
        data () {
            return {
                currentRemovingSoundSet: null
            }
        },
        mounted() {
            this.$store.dispatch('pbxConfig/listSoundSets');
        },
        computed: {
            ...mapGetters('pbxConfig', [
                'soundSets',
                'soundSetFilesLoading',
                'isSoundSetsRequesting',
                'soundFileLabel',
                'uploadSoundFileProgress',
                'uploadSoundFileRequesting',
                'uploadSoundFileDone',
                'playSoundFileUrl',
                'playSoundFileLoaded'
            ]),
            isMobile() {
                return !!Platform.is.mobile;
            },
            removeDialogMessage() {
                if (this.currentRemovingSoundSet !== null) {
                    return this.$t('pbxConfig.removeSoundSetText', {
                        set: this.currentRemovingSoundSet.name
                    });
                }
            }
        },
        methods: {
            removeSoundSetDialog(soundSet) {
                this.currentRemovingSoundSet = soundSet;
                this.$refs.removeDialog.open();
            },
            removeSoundSet() {
                this.$store.dispatch('pbxConfig/removeSoundSet', this.currentRemovingSoundSet)
            },
            playSoundFile() { // TODO: Remove
                this.$store.dispatch('pbxConfig/playSoundFile', {
                    id: 125,
                    format: 'mp3'
                });
            },
            initSoundFileAudio() { // TODO: Remove
                this.playSoundFile();
                this.$refs.testUpload.setPlayingTrue();
                this.$refs.testUpload.setPausedFalse();
            },
            uploadSoundFile(file) { // TODO: Remove
                this.$store.dispatch('pbxConfig/uploadSoundFile', {
                    file: file
                });
            },
            abortUpload() { // TODO: Remove
                console.log('abortUpload()');
            },
            deleteSoundFile() { // TODO: Remove
                console.log('deleteSoundFile()');
            }
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>
