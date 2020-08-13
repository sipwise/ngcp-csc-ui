<template>
    <csc-page
        ref="page"
        :is-list="true"
    >
        <q-tabs
            inverted
            color="primary"
            align="justify"
            v-model="selectedTab"
            id="csc-conversations-tabs"
        >
            <q-tab
                default
                name="call-fax-voicemail"
                slot="title"
                icon="inbox"
                :label="labelAll"
                @click="filterByType('call-fax-voicemail')"
            />
            <q-tab
                name="call"
                slot="title"
                icon="call"
                :label="labelCalls"
                @click="filterByType('call')"
            />
            <q-tab
                name="fax"
                slot="title"
                icon="description"
                :label="labelFaxes"
                @click="filterByType('fax')"
            />
            <q-tab
                name="voicemail"
                slot="title"
                icon="voicemail"
                :label="labelVoicemails"
                @click="filterByType('voicemail')"
            />
        </q-tabs>

        <div class="csc-conversations-filter-container">
            <div
                class="csc-conversations-filters-title"
            >
                    <q-btn
                        flat
                        icon="fa-filter"
                        color="primary"
                        v-if="showDaterangeFilter"
                        @click="toggleDaterangeFilter()"
                    >
                        {{$t('pages.conversations.filterByTimeRange')}}
                    </q-btn>
            </div>
            <div
                class="csc-conversations-filter-fields-container"
                v-if="!showDaterangeFilter"
            >
                <div>
                    <q-field
                      dark
                      class="csc-conversations-daterange-container"
                      :helper="$t('pages.conversations.filterByTimeRangeHelper')"
                    >
                        <q-datetime-range
                            dark
                            ref="filterTimeRange"
                            type="datetime"
                            v-model="dateFilterRange"
                            format="DD/MM/YYYY - hh:mm"
                            @change="filterByDaterange()"
                        />

                    </q-field>
                </div>
                <div class="csc-conversations-filter-buttons">
                    <q-btn
                        flat
                        icon="clear"
                        color="white"
                        @click="resetDaterangeFilters"
                    >
                        {{ $t('pages.conversations.closeDaterangeFilters') }}
                    </q-btn>
                    <q-btn
                        flat
                        icon="fa-filter"
                        color="red"
                        @click="emptyDaterangeFilters"
                    >
                        {{$t('pages.conversations.resetFilterByTimerange')}}
                    </q-btn>
                </div>
            </div>
        </div>

        <div
            id="csc-conversation-content"
        >

            <q-list
                v-if="items.length > 0"
                no-border
                striped-odd
                multiline
                id="csc-conversation-list"
            >
                <csc-conversation-item
                    class="csc-list-item csc-conversation-list-item"
                    v-for="item in items"
                    :key="item._id"
                    :item="item"
                    :call-available="isCallEnabled"
                    :blocked-incoming="blockedIncoming(item)"
                    :blocked-outgoing="blockedOutgoing(item)"
                    @start-call="startCall"
                    @download-fax="downloadFax"
                    @download-voice-mail="downloadVoiceMail"
                    @play-voice-mail="playVoiceMail"
                    @toggle-block-incoming="toggleBlockIncoming"
                    @toggle-block-outgoing="toggleBlockOutgoing"
                    @toggle-block-both="toggleBlockBoth"
                    @delete-voicemail="$refs.confirmDeletionDialog.open();deletionId=$event.id"
                />
            </q-list>
            <div
                v-else-if="!isNextPageRequesting && items.length === 0"
                class="row justify-center csc-conversation-list-message"
            >
                {{ noResultsMessage }}
            </div>
            <div
                v-if="isNextPageRequesting || startFiltering"
                class="row justify-center"
            >
                <q-spinner-dots
                    color="primary"
                    :size="40"
                />
            </div>
        </div>
        <q-scroll-observable
            @scroll="scroll"
        />
        <q-btn
          v-back-to-top.animate="backToTopProps"
          round
          color="primary"
          :class="backToTopClasses"
        >
            <q-icon name="keyboard_arrow_up" />
        </q-btn>
        <csc-remove-dialog
            ref="confirmDeletionDialog"
            title-icon="delete"
            :title="$t('conversations.deleteVoicemailTitle')"
            :message="$t('conversations.deleteVoicemailText')"
            @remove="deleteVoicemail({id:deletionId, tab: selectedTab})"
            @cancel="deletionId=null"
        />
    </csc-page>
</template>

<script>
    import platformMixin from '../../../mixins/platform'
    import {
        mapGetters,
        mapActions
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
        QDatetimeRange,
        QField,
        QScrollObservable,
        scroll,
        QList,
        QSpinnerDots,
        dom,
        QTabs,
        QTab,
        QTabPane,
        BackToTop,
        QBtn,
        QIcon
    } from 'quasar-framework'
    import CscRemoveDialog from "../../CscRemoveDialog";
    const offset = dom.offset;
    export default {
        data () {
            return {
                deletionId: null,
                scrollEventEmitted: false,
                selectedTab: 'call-fax-voicemail',
                dateFilterRange: {
                    from: null,
                    to: null
                },
                showDaterangeFilter: true,
                startFiltering: false,
                tabs: [
                    {
                        label: this.$t('pages.conversations.tabLabelAll'),
                        value: 'call-fax-voicemail'
                    },
                    {
                        label: this.$t('pages.conversations.tabLabelCalls'),
                        value: 'call'
                    },
                    {
                        label: this.$t('pages.conversations.tabLabelFaxes'),
                        value: 'fax'
                    },
                    {
                        label: this.$t('pages.conversations.tabLabelVoicemails'),
                        value: 'voicemail'
                    }
                ]
            }
        },
        mixins: [
            platformMixin
        ],
        components: {
            QDatetimeRange,
            QField,
            CscRemoveDialog,
            CscPage,
            CscConversationItem,
            QScrollObservable,
            QList,
            QSpinnerDots,
            QTabs,
            QTab,
            QTabPane,
            QBtn,
            QIcon
        },
        directives: {
            BackToTop
        },
        created() {
            this.$store.commit('conversations/resetList');
            this.$store.dispatch('conversations/getBlockedNumbers');
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
                'reloadItemsError',
                'toggleBlockedState',
                'lastToggledType',
                'isNumberIncomingBlocked',
                'isNumberOutgoingBlocked'
            ]),
            ...mapGetters('call', [
                'callState',
                'isCallEnabled'
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
            },
            backToTopProps() {
                return {offset: 100, duration: 200};
            },
            labelAll() {
                if(this.isMobile) {
                    return '';
                }
                else {
                    return this.$t('pages.conversations.tabLabelAll');
                }
            },
            labelCalls() {
                if(this.isMobile) {
                    return '';
                }
                else {
                    return this.$t('pages.conversations.tabLabelCalls');
                }
            },
            labelFaxes() {
                if(this.isMobile) {
                    return '';
                }
                else {
                    return this.$t('pages.conversations.tabLabelFaxes');
                }
            },
            labelVoicemails() {
                if(this.isMobile) {
                    return '';
                }
                else {
                    return this.$t('pages.conversations.tabLabelVoicemails');
                }
            },
            isCalling() {
                return this.callState === 'initiating' ||
                    this.callState === 'ringing' ||
                    this.callState === 'established' ||
                    this.callState === 'incoming';
            },
            backToTopClasses() {
                let classes = [
                    'fixed-bottom-right',
                    'animate-pop',
                    'csc-back-to-top',
                    'transition-generic'
                ];
                if(this.isCalling) {
                    classes.push('csc-back-to-top-calling');
                }
                return classes;
            },
            openFilter(){
                this.$refs.filterTimeRange.open();
            }
        },
        methods: {
            ...mapActions('conversations', [
                'deleteVoicemail'
            ]),
            scroll(data) {
                if(!this.isNextPageRequesting && !this.scrollEventEmitted && data.direction === 'down' &&
                    data.position > scroll.getScrollHeight(this.$refs.page.$el) - window.innerHeight - 90) {
                    this.scrollEventEmitted = true;
                    this.nextPage({
                        type: this.selectedTab,
                        from: this.dateFilterRange.from,
                        to: this.dateFilterRange.to
                    });
                }
                else if(data.position <= scroll.getScrollHeight(this.$refs.page.$el) - window.innerHeight - 90) {
                    this.scrollEventEmitted = false;
                }
            },
            nextPage(type) {
                if(type === 'call-fax-voicemail') {
                    type = null;
                }
                this.$store.dispatch('conversations/nextPage', {
                    type: type,
                    from: this.dateFilterRange.from,
                    to: this.dateFilterRange.to
                });
            },
            startCall(number) {
                this.$store.commit('call/numberInputChanged', number);
                this.$router.push('home');
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
                let type = this.selectedTab;
                if(type === 'call-fax-voicemail') {
                    type = null;
                }
                this.$store.dispatch('conversations/reloadItems', {
                    retryCount: 1,
                    type: type,
                    from: this.dateFilterRange.from,
                    to: this.dateFilterRange.to
                });
            },
            filterByType(type) {
                if(type !== this.selectedTab) {
                    this.$store.commit('conversations/resetList');
                    this.$store.dispatch('conversations/nextPage', {
                        type: type,
                        from: this.dateFilterRange.from,
                        to: this.dateFilterRange.to
                    });
                }
            },
            filterByDaterange(){
                this.$store.commit('conversations/resetList');
                this.nextPage({
                    filterByDaterange: true,
                    type: this.selectedTab,
                    from: this.dateFilterRange.from,
                    to: this.dateFilterRange.to
                });
            },
            resetDaterangeFilters(){
                this.emptyDaterangeFilters();
                this.toggleDaterangeFilter();
            },
            emptyDaterangeFilters(){
                this.dateFilterRange.from = null;
                this.dateFilterRange.to = null;
                this.filterByDaterange();
            },
            toggleBlockIncoming(options) {
                this.$store.dispatch('conversations/toggleBlockIncoming', options);
            },
            toggleBlockOutgoing(options) {
                this.$store.dispatch('conversations/toggleBlockOutgoing', options);
            },
            toggleBlockBoth(options) {
                this.$store.dispatch('conversations/toggleBlockBoth', options);
            },
            blockedIncoming(item) {
                if (item.direction === 'out') {
                    return this.isNumberIncomingBlocked(item.callee);
                }
                else {
                    return this.isNumberIncomingBlocked(item.caller);
                }

            },
            blockedOutgoing(item) {
                if (item.direction === 'out') {
                    return this.isNumberOutgoingBlocked(item.callee);
                }
                else {
                    return this.isNumberOutgoingBlocked(item.caller);
                }
            },
            toggleDaterangeFilter(){
                this.showDaterangeFilter = !this.showDaterangeFilter;
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
            },
            toggleBlockedState(state) {
                if (state === 'requesting') {
                    startLoading();
                }
                else if (state === 'failed') {
                    stopLoading();
                }
                else if (state === 'succeeded') {
                    stopLoading();
                    showToast(this.$t('pages.conversations.toggledSuccessMessage', {
                        type: this.lastToggledType
                    }));
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl'
    #csc-conversations-tabs
        position sticky
        top $header-height
        z-index 12
        background-color $secondary
        .q-tab
            .q-tab-icon
                font-size 24px
    #csc-conversation-content
        padding-top $flex-gutter-lg
    .csc-back-to-top
        margin 0 15px 15px 0
    .csc-back-to-top.csc-back-to-top-calling
        bottom $call-footer-height-big + 15px
    .csc-conversation-list-item
        padding $flex-gutter-sm
    .csc-conversations-filter-container
        text-align center
        color $secondary
    .csc-conversations-filter-fields-container
        margin-top -15px
    .csc-conversations-daterange-container
        width 450px
        display inline-block
    .csc-conversations-filter-buttons
        margin-top 15px
    .csc-conversations-filters-title
        margin-top 50px
        display inline-block
        .q-field-label-inner
            color $primary
            font-weight bold
            span
                width 100%
                text-align left
                min-width 150px
    .csc-conversations-clear-btn
        cursor pointer
        font-size 20px
        margin-left 10px
    .q-datetime-range-left
        margin-right 10px
    .q-datetime-weekdays
        color $tertiary
    .q-datetime-days div:not(.q-datetime-day-active),
    .q-datetime-dark
        color $white !important
    .q-datetime-range .q-icon,
    .q-datetime-range .q-item-icon
        color $primary !important
    .q-datetime-range.row .q-datetime-range-right,
    .q-datetime-range.row .q-datetime-range-left
        padding-left 20px
</style>
