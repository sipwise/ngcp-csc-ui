
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
        <csc-voicebox-greetings
            ref="createBusyGreeting"
            v-if="isSettingsLoaded"
            :progress="uploadProgress"
            :requesting="createBusyGreetingRequesting"
        />
    </csc-page>
</template>

<script>
    import { mapGetters } from 'vuex'
    import CscPage from '../../CscPage'
    import CscVoiceboxSettings from './CscVoiceboxSettings'
    import CscVoiceboxGreetings from './CscVoiceboxGreetings'
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
            CscVoiceboxGreetings
        },
        created() {
            this.$store.dispatch('voicebox/getVoiceboxSettings');
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
                'createBusyGreetingRequesting'
            ])
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
                    this.$refs.createBusyGreeting.resetFile();
                }
                else if (state === 'failed') {
                    showGlobalError(this.createBusyGreetingError);
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
