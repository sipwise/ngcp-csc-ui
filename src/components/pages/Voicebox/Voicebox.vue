
<template>
    <csc-page class="csc-simple-page">
        <csc-voicebox-settings
            v-if="isSettingsLoaded"
            :settings="voiceboxSettings"
            :deleteRequesting="isDeleteRequesting"
            :attachRequesting="isAttachRequesting"
            :pinRequesting="isPinRequesting"
            :emailRequesting="isEmailRequesting"
            :deleteLabel="deleteLabel"
            :attachLabel="attachLabel"
        />
        <csc-upload-file
            ref="createBusyGreeting"
            v-if="isSettingsLoaded"
            :progress="uploadProgress"
            :requesting="createBusyGreetingRequesting"
            file-types=".wav,.mp3,.ogg"
            @reset="resetBusyFile"
            @upload="uploadBusyGreeting"
            @abort="abort"
        >
            <slot slot="extra-buttons">
                <q-btn
                    flat
                    color="negative"
                    icon="delete"
                    @click="deleteBusy"
                >
                    {{ $t('buttons.remove') }}
                </q-btn>
            </slot>
        </csc-upload-file>
        <!--TODO: Fix class name or refactor class-->
        <csc-audio-player
            ref="busyGreetingPlayer"
            :file-url="busyFileUrl"
            :loaded="busyGreetingLoaded"
            class="csc-voice-mail-player"
            @load="load"
        />
        Busy greeting sound id: {{ busyGreetingId }}
    </csc-page>
</template>

<script>
    import {
        QBtn
    } from 'quasar-framework'
    import { mapGetters } from 'vuex'
    import CscPage from '../../CscPage'
    import CscVoiceboxSettings from './CscVoiceboxSettings'
    import CscUploadFile from '../../form/CscUploadFile'
    import CscAudioPlayer from '../../CscAudioPlayer'
    import {
        startLoading,
        stopLoading,
        showToast,
        showGlobalError
    } from '../../../helpers/ui'
    export default {
        data () {
            return {
            }
        },
        components: {
            CscPage,
            CscVoiceboxSettings,
            CscUploadFile,
            CscAudioPlayer,
            QBtn
        },
        created() {
            this.$store.dispatch('voicebox/getVoiceboxSettings');
            this.loadGreetings();
        },
        computed: {
            ...mapGetters('voicebox', [
                'voiceboxSettings',
                'deleteLabel',
                'attachLabel',
                'isDeleteRequesting',
                'isAttachRequesting',
                'isPinRequesting',
                'isEmailRequesting',
                'isSettingsLoaded',
                'loadingState',
                'loadingError',
                'toggleDeleteState',
                'toggleDeleteError',
                'toggleAttachState',
                'toggleAttachError',
                'updatePinState',
                'updatePinError',
                'updateEmailState',
                'updateEmailError',
                'uploadProgress',
                'createBusyGreetingState',
                'createBusyGreetingError',
                'createBusyGreetingRequesting',
                'busyGreetingId',
                'unavailGreetingId',
                'playGreetingState',
                'playGreetingUrl'
            ]),
            busyFileUrl() {
                let getter = this.playGreetingUrl;
                return getter(this.busyGreetingId);
            },
            busyGreetingLoaded() {
                // TODO: Should be able to reduce this to a getter that does
                // not need id
                return this.playGreetingState(this.busyGreetingId) === 'succeeded';
            }
        },
        methods: {
            resetBusyFile() {
                this.$refs.createBusyGreeting.reset();
                this.$store.commit('voicebox/resetProgress');
            },
            uploadBusyGreeting(file) {
                this.$store.dispatch('voicebox/uploadGreetingSound', {
                    dir: 'busy',
                    file: file
                });
            },
            abort() {
                this.$store.dispatch('voicebox/abortPreviousRequest');
            },
            deleteBusy() {
                 this.$store.dispatch('voicebox/deleteGreeting', this.busyGreetingId);
            },
            loadGreetings() {
                this.$store.dispatch('voicebox/loadGreetings');
            },
            playBusyGreeting() {
                this.$store.dispatch('voicebox/playGreeting', this.busyGreetingId);
            },
            downloadVoiceMail() {
                this.$emit('download-voice-mail', this.voiceMail);
            },
            load() {
                this.playBusyGreeting();
                this.$refs.busyGreetingPlayer.setPlayingTrue();
                this.$refs.busyGreetingPlayer.setPausedFalse();
            }
        },
        watch: {
            loadingState(state) {
                if (state === 'requesting') {
                    startLoading();
                }
                else if (state === 'succeeded') {
                    stopLoading();
                }
                else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.loadingError);
                }
            },
            toggleDeleteState(state) {
                if (state === 'requesting') {
                    startLoading();
                }
                else if (state === 'succeeded') {
                    stopLoading();
                    showToast(this.$t('voicebox.toggleDeleteSuccessMessage'));
                }
                else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.toggleDeleteError);
                }
            },
            toggleAttachState(state) {
                if (state === 'requesting') {
                    startLoading();
                }
                else if (state === 'succeeded') {
                    stopLoading();
                    showToast(this.$t('voicebox.toggleAttachSuccessMessage'));
                }
                else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.toggleAttachError);
                }
            },
            updatePinState(state) {
                if (state === 'succeeded') {
                    showToast(this.$t('voicebox.updatePinSuccessMessage'));
                }
                else if (state === 'failed') {
                    showGlobalError(this.updatePinError);
                }
            },
            updateEmailState(state) {
                if (state === 'succeeded') {
                    showToast(this.$t('voicebox.updateEmailSuccessMessage'));
                }
                else if (state === 'failed') {
                    showGlobalError(this.updateEmailError);
                }
            },
            createBusyGreetingState(state) {
                if (state === 'succeeded') {
                    showToast(this.$t('voicebox.createBusyGreetingsSuccessMessage'));
                    this.resetBusyFile();
                    this.loadGreetings();
                }
                else if (state === 'failed') {
                    showGlobalError(this.createBusyGreetingError);
                    if (this.uploadProgress > 0) {
                        this.resetBusyFile();
                    }
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
