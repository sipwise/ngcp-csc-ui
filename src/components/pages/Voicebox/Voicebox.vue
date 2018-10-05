
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
            v-if="isBusyGreetingLoaded"
            ref="uploadBusyGreeting"
            :progress="uploadProgress"
            :requesting="uploadBusyGreetingRequesting"
            :id="busyGreetingId"
            file-types=".wav,.mp3"
            @reset="resetBusyFile"
            @upload="uploadBusyGreeting"
            @abort="abort"
        >
            <slot slot="status-label">
                <div
                    class="csc-black-label"
                >
                    {{ busyGreetingLabel }}
                </div>
            </slot>
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
            QBtn
        },
        created() {
            this.$store.dispatch('voicebox/getVoiceboxSettings');
            this.loadBusyGreeting();
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
                'uploadProgress',
                'uploadBusyGreetingState',
                'uploadBusyGreetingError',
                'uploadBusyGreetingRequesting',
                'busyGreetingId',
                'unavailGreetingId',
                'deleteGreetingState',
                'deleteGreetingError',
                'isBusyGreetingLoaded'
            ]),
            busyGreetingLabel() {
                return this.busyGreetingId ? this.$t('voicebox.label.voicemailSet') :
                    this.$t('voicebox.label.voicemailNotSet')
            }
        },
        methods: {
            resetBusyFile() {
                this.$refs.uploadBusyGreeting.reset();
                this.$store.commit('voicebox/resetProgress');
            },
            uploadBusyGreeting(file) {
                this.$store.dispatch('voicebox/uploadGreeting', {
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
            loadBusyGreeting() {
                this.$store.dispatch('voicebox/loadBusyGreeting');
            }
        },
        watch: {
            loadSettingsState(state) {
                if (state === 'requesting') {
                    startLoading();
                }
                else if (state === 'succeeded') {
                    stopLoading();
                }
                else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.loadSettingsError);
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
            uploadBusyGreetingState(state) {
                if (state === 'succeeded') {
                    showToast(this.$t('voicebox.uploadGreetingSuccessMessage'));
                    this.resetBusyFile();
                    this.loadBusyGreeting();
                }
                else if (state === 'failed') {
                    showGlobalError(this.uploadBusyGreetingError);
                    if (this.uploadProgress > 0) {
                        this.resetBusyFile();
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
</style>
