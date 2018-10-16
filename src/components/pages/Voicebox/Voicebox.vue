
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
            :progress="uploadBusyProgress"
            :requesting="uploadBusyGreetingRequesting"
            :id="busyGreetingId"
            :label="this.$t('voicebox.label.busyGreeting')"
            file-types=".wav,.mp3"
            @reset="resetBusyFile"
            @upload="uploadBusyGreeting"
            @abort="abortBusy"
        >
            <slot slot="status-label">
                <div
                    :class="{
                        'inactive-label': !busyGreetingId,
                        'active-label': busyGreetingId
                    }"
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
        <csc-upload-file
            v-if="isUnavailGreetingLoaded"
            ref="uploadUnavailGreeting"
            :progress="uploadUnavailProgress"
            :requesting="uploadUnavailGreetingRequesting"
            :id="unavailGreetingId"
            :label="this.$t('voicebox.label.unavailGreeting')"
            file-types=".wav,.mp3"
            @reset="resetUnavailFile"
            @upload="uploadUnavailGreeting"
            @abort="abortUnavail"
        >
            <slot slot="status-label">
                <div
                    :class="{
                        'inactive-label': !unavailGreetingId,
                        'active-label': unavailGreetingId
                    }"
                >
                    {{ unavailGreetingLabel }}
                </div>
            </slot>
            <slot slot="extra-buttons">
                <q-btn
                    flat
                    color="negative"
                    icon="delete"
                    @click="deleteUnavail"
                >
                    {{ $t('buttons.remove') }}
                </q-btn>
            </slot>
        </csc-upload-file>
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
            this.loadUnavailGreeting();
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
                'isBusyGreetingLoaded',
                'isUnavailGreetingLoaded'
            ]),
            busyGreetingLabel() {
                return this.busyGreetingId ? this.$t('voicebox.label.customSoundActive') :
                    this.$t('voicebox.label.defaultSoundActive')
            },
            unavailGreetingLabel() {
                return this.unavailGreetingId ? this.$t('voicebox.label.customSoundActive') :
                    this.$t('voicebox.label.defaultSoundActive')
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
                    dir: 'busy',
                    file: file
                });
            },
            uploadUnavailGreeting(file) {
                this.$store.dispatch('voicebox/uploadUnavailGreeting', {
                    dir: 'unavail',
                    file: file
                });
            },
            abortBusy() {
                this.$store.dispatch('voicebox/abortPreviousRequest', 'busy');
            },
            abortUnavail() {
                this.$store.dispatch('voicebox/abortPreviousRequest', 'unavail');
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
                        self.$t('buttons.cancel'),
                        {
                            label: self.$t('buttons.remove'),
                            color: 'negative',
                            handler () {
                                store.dispatch('voicebox/deleteGreeting', self.busyGreetingId)
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
                        self.$t('buttons.cancel'),
                        {
                            label: self.$t('buttons.remove'),
                            color: 'negative',
                            handler () {
                                store.dispatch('voicebox/deleteGreeting', self.unavailGreetingId)
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
                    if (this.uploadBusyProgress > 0) {
                        this.resetBusyFile();
                    }
                }
            },
            uploadUnavailGreetingState(state) {
                if (state === 'succeeded') {
                    showToast(this.$t('voicebox.uploadGreetingSuccessMessage'));
                    this.resetUnavailFile();
                    this.loadUnavailGreeting();
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
</style>
