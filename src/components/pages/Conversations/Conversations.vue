<template>
    <csc-page
        ref="page"
        class="csc-list-page"
    >
        <q-tabs
            inverted
            color="primary"
            align="justify"
            v-model="selectedTab"
            class="conversations-tabs"
        >
            <q-tab
                default
                name="call-fax-voicemail"
                slot="title"
                icon="mail"
                label="All"
                :items="items"
                @click="filterByType('call-fax-voicemail')"
            />
            <q-tab
                name="call"
                slot="title"
                icon="call"
                label="Calls"
                :items="items"
                @click="filterByType('call')"
            />
            <q-tab
                name="fax"
                slot="title"
                icon="fa-fax"
                label="Faxes"
                :items="items"
                @click="filterByType('fax')"
            />
            <q-tab
                name="voicemail"
                slot="title"
                icon="voicemail"
                label="Voicemails"
                :items="items"
                @click="filterByType('voicemail')"
            />
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
                {{ noResultsMessage }}
            </div>
            <q-scroll-observable
                @scroll="scroll"
            />
        </q-tabs>
    </csc-page>
</template>

<script>
    import {
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
        QSpinnerDots,
        dom,
        QTabs,
        QTab,
        QTabPane
    } from 'quasar-framework'
    const { offset } = dom
    export default {
        data () {
            return {
                scrollEventEmitted: false,
                selectedTab: 'call-fax-voicemail',
                tabs: [
                    { label: this.$t('pages.conversations.tabLabelAll'), value: 'call-fax-voicemail' },
                    { label: this.$t('pages.conversations.tabLabelCalls'), value: 'call'},
                    { label: this.$t('pages.conversations.tabLabelFaxes'), value: 'fax'},
                    { label: this.$t('pages.conversations.tabLabelVoicemails'), value: 'voicemail'}
                ]
            }
        },
        components: {
            CscPage,
            CscConversationItem,
            QScrollObservable,
            QList,
            QSpinnerDots,
            QTabs,
            QTab,
            QTabPane
        },
        mounted() {
            this.$store.commit('conversations/resetList');
        },
        computed: {
            ...mapGetters('conversations', [
                'items',
                'isNextPageRequesting',
                'downloadFaxState',
                'downloadVoiceMailState',
                'downloadFaxError',
                'downloadVoiceMailError',
                'itemsReloaded',
                'reloadItemsError'
            ]),
            ...mapGetters('call', [
                'callState'
            ]),
            noResultsMessage() {
                if(this.selectedTab === 'call-fax-voicemail') {
                    return this.$t('pages.conversations.emptyListMessage');
                }
                else if(this.selectedTab === 'call') {
                    return this.$t('pages.conversations.noCallsMessage');
                }
                else if(this.selectedTab === 'fax') {
                    return this.$t('pages.conversations.noFaxesMessage');
                }
                else if(this.selectedTab === 'voicemail') {
                    return this.$t('pages.conversations.noVoicemailsMessage');
                }
            }
        },
        methods: {
            scroll(data) {
                if(!this.isNextPageRequesting && !this.scrollEventEmitted && data.direction === 'down' &&
                    data.position > scroll.getScrollHeight(this.$refs.page.$el) - window.innerHeight + 30) {
                    this.scrollEventEmitted = true;
                    this.nextPage(this.selectedTab);
                }
                else if(data.position <= scroll.getScrollHeight(this.$refs.page.$el) - window.innerHeight + 30) {
                    this.scrollEventEmitted = false;
                }
            },
            nextPage(type) {
                this.$store.dispatch('conversations/nextPage', type);
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
            },
            reloadItems() {
                this.$store.dispatch('conversations/reloadItems', {
                    retryCount: 1,
                    type: this.selectedTab
                });
            },
            filterByType(type) {
                this.$store.commit('conversations/resetList');
                this.$store.dispatch('conversations/nextPage', type);
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
            },
            reloadItemsState(state) {
                if (state === 'failed') {
                    showGlobalError(this.reloadItemsError);
                }
            },
            callState(newState, oldState) {
                let endedA = newState === 'ended';
                let endedB = oldState === 'established' && newState === 'input';
                let endedC = oldState === 'ringing' && newState === 'input';
                let endedD = oldState === 'incoming' && newState === 'input';
                if (endedA && ((this.selectedTab === 'call') || (this.selectedTab === 'call-fax-voicemail'))
                    || endedB && ((this.selectedTab === 'call') || (this.selectedTab === 'call-fax-voicemail'))
                    || endedC && ((this.selectedTab === 'call') || (this.selectedTab === 'call-fax-voicemail'))
                    || endedD && ((this.selectedTab === 'call') || (this.selectedTab === 'call-fax-voicemail'))) {
                    this.reloadItems();
                }
            },
            itemsReloaded(state) {
                let offsetTop = offset(this.$el).top;
                if (state && offsetTop < -15) {
                    window.scrollTo(0, 0);
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
