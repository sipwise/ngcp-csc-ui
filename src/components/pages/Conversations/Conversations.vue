<template>
    <csc-page :title="$t('pages.conversations.title')">
        <csc-conversations :conversations="conversations" />
    </csc-page>
</template>

<script>
    import { mapState } from 'vuex'
    import CscPage from '../../CscPage'
    import CscConversations from './CscConversations'
    import { startLoading, stopLoading,
        showGlobalError, showToast } from '../../../helpers/ui'
    export default {
        data () {
            return {
            }
        },
        components: {
            CscPage,
            CscConversations
        },
        computed: {
            ...mapState('conversations', [
                'conversations',
                'downloadFaxState',
                'downloadVoiceMailState',
                'downloadFaxError',
                'downloadVoiceMailError'
            ])
        },
        watch: {
            downloadVoiceMailState(state) {
                if (state === 'requesting') {
                    startLoading();
                }
                else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.downloadVoiceMailError || this.$t('pages.conversations.downloadVoiceMailErrorMessage'));
                }
                else if (state === 'succeeded') {
                    stopLoading();
                    showToast(this.$t('pages.conversations.downloadVoiceMailSuccessMessage'));
                }
            },
            downloadFaxState(state) {
                if (state === 'requesting') {
                    startLoading();
                }
                else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.downloadFaxError || this.$t('pages.conversations.downloadFaxErrorMessage'));
                }
                else if (state === 'succeeded') {
                    stopLoading();
                    showToast(this.$t('pages.conversations.downloadFaxSuccessMessage'));
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .q-infinite-scroll-message
        margin-bottom 50px
</style>
