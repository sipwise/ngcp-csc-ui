
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
                    :label="$t('voicebox.label.busyGreeting')"
                    :value="busyGreetingLabel"
                    :progress="uploadProgress"
                    :uploading="uploadBusyGreetingRequesting"
                    :uploaded="busyGreetingId !== null"
                    @upload="uploadBusyGreeting"
                    @abort="abort"
                    @reset="deleteBusy"
                />

                <!--<q-field-->
                    <!--icon="music_note"-->
                <!--&gt;-->
                    <!--<q-input-->
                        <!--readonly-->
                        <!--:float-label="$t('voicebox.label.busyGreeting')"-->
                        <!--:value="busyGreetingLabel"-->
                        <!--:after="busyGreetingButtons"-->
                    <!--/>-->
                    <!--<input-->
                        <!--v-show="false"-->
                        <!--ref="busyGreetingUpload"-->
                        <!--type="file"-->
                        <!--@change="busyGreetingFileChange"-->
                    <!--/>-->
                <!--</q-field>-->

                <!--<csc-upload-file-->
                    <!--ref="uploadBusyGreeting"-->
                    <!--:progress="uploadProgress"-->
                    <!--:requesting="uploadBusyGreetingRequesting"-->
                    <!--:id="busyGreetingId"-->
                    <!--file-types=".wav,.mp3"-->
                    <!--@reset="resetBusyFile"-->
                    <!--@upload="uploadBusyGreeting"-->
                    <!--@abort="abort"-->
                <!--&gt;-->
                    <!--<div-->
                        <!--slot="status-label"-->
                        <!--:class="busyGreetingLabelClasses"-->
                    <!--&gt;-->
                        <!--{{ busyGreetingLabel }}-->
                    <!--</div>-->
                    <!--<q-btn-->
                        <!--slot="extra-buttons"-->
                        <!--flat-->
                        <!--color="negative"-->
                        <!--icon="delete"-->
                        <!--@click="deleteBusy"-->
                    <!--&gt;-->
                        <!--{{ $t('buttons.remove') }}-->
                    <!--</q-btn>-->
                <!--</csc-upload-file>-->
            </div>
        </div>
    </csc-page>
</template>

<script>
    import {
        QBtn,
        QField,
        QInput,
        Dialog
    } from 'quasar-framework'
    import { mapGetters } from 'vuex'
    import CscPage from '../../CscPage'
    import CscVoiceboxSettings from './CscVoiceboxSettings'
    import CscSoundFileUpload from '../../form/CscSoundFileUpload'
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
            CscSoundFileUpload,
            CscPage,
            CscVoiceboxSettings,
            QBtn,
            QField,
            QInput
        },
        mounted() {
            this.$store.dispatch('voicebox/getVoiceboxSettings');
            this.loadBusyGreeting();
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
                'uploadProgress',
                'uploadBusyGreetingState',
                'uploadBusyGreetingError',
                'uploadBusyGreetingRequesting',
                'busyGreetingId',
                'unavailGreetingId',
                'deleteGreetingState',
                'deleteGreetingError',
                'isBusyGreetingLoaded',
                'busyGreetingLabel'
            ]),
            busyGreetingLabelClasses() {
                let classes = ['csc-upload-file-label'];
                if(this.busyGreetingId) {
                    classes.push('active-label');
                }
                else {
                    classes.push('inactive-label');
                }
                return classes;
            },
            busyGreetingButtons() {
                let buttons = [];
                let self = this;
                buttons.push({
                        icon: 'folder',
                        error: false,
                        handler (event) {
                            event.stopPropagation();
                            self.$refs.busyGreetingUpload.click();
                        }
                    }
                );
                return buttons;
            }
        },
        methods: {
            busyGreetingFileChange() {

            },
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
                            label: self.$t('buttons.reset'),
                            color: 'negative',
                            handler () {
                                store.dispatch('voicebox/deleteGreeting', self.busyGreetingId)
                            }
                        }
                    ]
                });
            },
            loadBusyGreeting() {
                this.$store.dispatch('voicebox/loadBusyGreeting');
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
    @import '../../../themes/quasar.variables';

    .csc-upload-file-label
        margin-bottom $flex-gutter-sm

</style>
