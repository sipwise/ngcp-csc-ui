<template>
    <csc-page
        ref="page"
        class="csc-list-page"
    >
        <q-list
            no-border
            inset-separator
            sparse
            multiline
        >
            <csc-conversation-item
                v-for="(item, index) in items"
                :key="item._id"
                :item="item"
                @init-call="initCall"
                @download-fax="downloadFax"
                @download-voice-mail="downloadVoiceMail"
                @play-voice-mail="playVoiceMail"
            />
        </q-list>
        <div
            v-if="isNextPageRequesting"
            class="row justify-center"
        >
            <q-spinner-dots
                color="primary"
                :size="40"
            />
        </div>
        <div
            v-if="!isNextPageRequesting && items.length === 0"
            class="row justify-center"
        >
           {{ $t('pages.conversations.emptyListMessage') }}
        </div>
        <q-scroll-observable
            @scroll="scroll"
        />
    </csc-page>
</template>

<script>
    import {
        mapState,
        mapGetters
    } from 'vuex'
    import CscPage from '../../CscPage'
    import CscConversationItem from './CscConversationItem'
    import {
        startLoading,
        stopLoading,
        showGlobalError,
        showToast
    } from '../../../helpers/ui'
    import {
        QScrollObservable,
        scroll,
        QList,
        QSpinnerDots
    } from 'quasar-framework'
    export default {
        data () {
            return {
                scrollEventEmitted: false
            }
        },
        components: {
            CscPage,
            CscConversationItem,
            QScrollObservable,
            QList,
            QSpinnerDots
        },
        mounted() {
            this.$store.commit('conversations/resetList');
        },
        computed: {
            ...mapState('conversations', [
                'downloadFaxState',
                'downloadVoiceMailState',
                'downloadFaxError',
                'downloadVoiceMailError'
            ]),
            ...mapGetters('conversations', [
                'items',
                'isNextPageRequesting'
            ])
        },
        methods: {
            scroll(data) {
                if(!this.isNextPageRequesting && !this.scrollEventEmitted && data.direction === 'down' &&
                    data.position > scroll.getScrollHeight(this.$refs.page.$el) - window.innerHeight + 30) {
                    this.scrollEventEmitted = true;
                    this.nextPage();
                }
                else if(data.position <= scroll.getScrollHeight(this.$refs.page.$el) - window.innerHeight + 30) {
                    this.scrollEventEmitted = false;
                }
            },
            nextPage() {
                this.$store.dispatch('conversations/nextPage');
            },
            initCall(call) {
                this.$store.dispatch('call/start', {
                    number: call.number,
                    localMedia: call.media
                });
            },
            downloadFax(fax) {
                this.$store.dispatch('conversations/downloadFax', fax.id);
            },
            downloadVoiceMail(voiceMail) {
                this.$store.dispatch('conversations/downloadVoiceMail', voiceMail.id);
            },
            playVoiceMail(voiceMail) {
                this.$store.dispatch('conversations/playVoiceMail', {
                    id: voiceMail.id,
                    format: voiceMail.format
                });
            }
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

    .csc-voice-mail-item
        .csc-item-buttons
            position absolute
            right 16px

    .csc-item-buttons
        .q-btn
            padding-left 8px;
            padding-right 8px;

</style>
