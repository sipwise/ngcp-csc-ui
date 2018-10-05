
<template>
    <csc-page class="csc-simple-page">
        <div
            class="row"
        >
            <div
                class="col col-xs-12 col-md-6"
            >
                <csc-voicebox-settings
                    :attach="voiceboxAttach"
                    :delete="voiceboxDelete"
                    :pin="voiceboxPin"
                    :email="voiceboxEmail"
                    :deleteRequesting="isDeleteRequesting"
                    :attachRequesting="isAttachRequesting"
                    :pinRequesting="isPinRequesting"
                    :emailRequesting="isEmailRequesting"
                    :deleteLabel="deleteLabel"
                    :attachLabel="attachLabel"
                />
                <csc-sound-file-upload
                    ref="uploadBusyGreeting"
                    icon="music_note"
                    file-types=".wav,.mp3"
                    :label="$t('voicebox.label.busyGreeting')"
                    :value="busyGreetingLabel"
                    :progress="uploadBusyProgress"
                    :uploading="uploadBusyGreetingRequesting"
                    :uploaded="busyGreetingId !== null"
                    @upload="uploadBusyGreeting"
                    @abort="abortBusy"
                    @reset="deleteBusy"
                    @togglePlayer="togglePlayer"
                />
                <!--DONE: 1. Fix margins between upload and player-->
                <!--TODO: 2. Make sure player can handle change of files-->
                <!--TODO: 3. Fix class name or refactor class-->
                <csc-audio-player
                    v-show="showBusyPlayer"
                    ref="busyGreetingPlayer"
                    :file-url="busyFileUrl"
                    :loaded="busyGreetingLoaded"
                    class="csc-greeting-player"
                    @load="initBusyGreetingAudio"
                />
                <csc-sound-file-upload
                    ref="uploadUnavailGreeting"
                    icon="music_note"
                    file-types=".wav,.mp3"
                    :label="$t('voicebox.label.unavailGreeting')"
                    :value="unavailGreetingLabel"
                    :progress="uploadUnavailProgress"
                    :uploading="uploadUnavailGreetingRequesting"
                    :uploaded="unavailGreetingId !== null"
                    @upload="uploadUnavailGreeting"
                    @abort="abortUnavail"
                    @reset="deleteUnavail"
                />
            </div>
        </div>
    </csc-page>
</template>

<script>
    import {
        QBtn,
        Dialog
    } from 'quasar-framework'
    import { mapGetters } from 'vuex'
    import CscPage from '../../CscPage'
    import CscVoiceboxSettings from './CscVoiceboxSettings'
    import CscSoundFileUpload from '../../form/CscSoundFileUpload'
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
                platform: this.$q.platform.is,
                showBusyPlayer: false
            }
        },
        components: {
            CscSoundFileUpload,
            CscPage,
            CscVoiceboxSettings,
            CscAudioPlayer,
            QBtn
        },
        mounted() {
            this.$store.dispatch('voicebox/getVoiceboxSettings');
            this.loadBusyGreeting();
            this.loadUnavailGreeting();
        },
        computed: {
            ...mapGetters('voicebox', [
                'voiceboxAttach',
                'voiceboxDelete',
                'voiceboxEmail',
                'voiceboxPin',
                'deleteLabel',
                'attachLabel',
                'isDeleteRequesting',
                'isAttachRequesting',
                'isPinRequesting',
                'isEmailRequesting',
                'isSettingsLoaded',
                'loadSettingsState',
                'loadSettingsError',
                'toggleDeleteState',
                'toggleDeleteError',
                'toggleAttachState',
                'toggleAttachError',
                'updatePinState',
                'updatePinError',
                'updateEmailState',
                'updateEmailError',
                'uploadBusyProgress',
                'uploadUnavailProgress',
                'uploadBusyGreetingState',
                'uploadBusyGreetingError',
                'uploadBusyGreetingRequesting',
                'uploadUnavailGreetingState',
                'uploadUnavailGreetingError',
                'uploadUnavailGreetingRequesting',
                'busyGreetingId',
                'unavailGreetingId',
                'deleteGreetingState',
                'deleteGreetingError',
                'busyGreetingLabel',
                'unavailGreetingLabel',
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
            },
            soundFileFormat() {
                return this.platform.mozilla ? 'ogg' : 'mp3';
            }
        },
        methods: {
            resetBusyFile() {
                this.$refs.uploadBusyGreeting.reset();
                this.$store.commit('voicebox/resetBusyProgress');
            },
            resetUnavailFile() {
                this.$refs.uploadUnavailGreeting.reset();
                this.$store.commit('voicebox/resetUnavailProgress');
            },
            uploadBusyGreeting(file) {
                this.$store.dispatch('voicebox/uploadBusyGreeting', {
                    file: file
                });
            },
            uploadUnavailGreeting(file) {
                this.$store.dispatch('voicebox/uploadUnavailGreeting', {
                    file: file
                });
            },
            abortBusy() {
                this.$store.dispatch('voicebox/abortUploadBusyGreeting');
            },
            abortUnavail() {
                this.$store.dispatch('voicebox/abortUploadUnavailGreeting');
            },
            deleteBusy() {
                let self = this;
                let store = this.$store;
                Dialog.create({
                    title: self.$t('voicebox.deleteCustomDialogTitle'),
                    message: self.$t('voicebox.deleteCustomDialogText', {
                        type: 'busy'
                    }),
                    buttons: [
                    // NOTE: Button object does not have an 'icon' option key,
                    // so trying to add icon: 'clear' did not help
                        {
                            label: self.$t('buttons.cancel'),
                            color: 'dark'
                        },
                        {
                            label: self.$t('buttons.reset'),
                            color: 'primary',
                            handler () {
                                store.dispatch('voicebox/deleteGreeting', {
                                    id: self.busyGreetingId,
                                    type: 'busy'
                                })
                            }
                        }
                    ]
                });
            },
            deleteUnavail() {
                let self = this;
                let store = this.$store;
                Dialog.create({
                    title: self.$t('voicebox.deleteCustomDialogTitle'),
                    message: self.$t('voicebox.deleteCustomDialogText', {
                        type: 'unavailable'
                    }),
                    buttons: [
                        {
                            label: self.$t('buttons.cancel'),
                            color: 'dark'
                        },
                        {
                            label: self.$t('buttons.reset'),
                            color: 'primary',
                            handler () {
                                store.dispatch('voicebox/deleteGreeting', {
                                    id: self.unavailGreetingId,
                                    type: 'unavail'
                                })
                            }
                        }
                    ]
                });
            },
            loadBusyGreeting() {
                this.$store.dispatch('voicebox/loadBusyGreeting');
            },
            loadUnavailGreeting() {
                this.$store.dispatch('voicebox/loadUnavailGreeting');
            },
            playBusyGreeting() {
                this.$store.dispatch('voicebox/playGreeting', {
                    id: this.busyGreetingId,
                    format: this.soundFileFormat
                });
            },
            initBusyGreetingAudio() {
                this.playBusyGreeting();
                this.$refs.busyGreetingPlayer.setPlayingTrue();
                this.$refs.busyGreetingPlayer.setPausedFalse();
            },
            togglePlayer(state) {
                this.showBusyPlayer = state;
            }
        },
        watch: {
            loadSettingsState(state) {
                if (state === 'failed') {
                    showGlobalError(this.loadSettingsError);
                }
            },
            toggleDeleteState(state) {
                if (state === 'succeeded') {
                    showToast(this.$t('voicebox.toggleDeleteSuccessMessage'));
                }
                else if (state === 'failed') {
                    showGlobalError(this.toggleDeleteError);
                }
            },
            toggleAttachState(state) {
                if (state === 'succeeded') {
                    showToast(this.$t('voicebox.toggleAttachSuccessMessage'));
                }
                else if (state === 'failed') {
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
            uploadBusyGreetingState(state) {
                if (state === 'succeeded') {
                    showToast(this.$t('voicebox.uploadGreetingSuccessMessage'));
                    this.resetBusyFile();
                }
                else if (state === 'failed') {
                    showGlobalError(this.uploadBusyGreetingError);
                    if (this.uploadBusyProgress > 0) {
                        this.resetBusyFile();
                    }
                }
            },
            uploadUnavailGreetingState(state) {
                if (state === 'succeeded') {
                    showToast(this.$t('voicebox.uploadGreetingSuccessMessage'));
                    this.resetUnavailFile();
                }
                else if (state === 'failed') {
                    showGlobalError(this.uploadUnavailGreetingError);
                    if (this.uploadUnavailProgress > 0) {
                        this.resetUnavailFile();
                    }
                }
            },
            deleteGreetingState(state) {
                if (state === 'requesting') {
                    startLoading();
                }
                else if (state === 'succeeded') {
                    stopLoading();
                    showToast(this.$t('voicebox.deleteGreetingSuccessMessage'));
                }
                else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.deleteGreetingError);
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables';

    .csc-greeting-player
        padding 0
        margin-bottom 40px

</style>
