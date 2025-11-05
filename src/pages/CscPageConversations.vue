<template>
    <csc-page-sticky-tabs
        id="csc-page-conversations"
        ref="pageSticky"
        :value="selectedTab"
    >
        <template
            #tabs
        >
            <q-tab
                v-for="tab in tabs"
                :key="tab.value"
                :name="tab.value"
                :icon="tab.icon"
                :label="tab.label"
                :default="tab.value === selectedTab"
                :disable="listLoading"
                @click="selectTab(tab.value)"
            />
        </template>
        <template
            #toolbar
        >
            <csc-conversations-filter
                id="csc-conversations-filter"
                :value="filter"
                class="q-pb-sm"
                :loading="listLoading"
                :disable="listLoading"
                @input="filterTab($event, selectedTab)"
            />
            <csc-conversations-calls-filter
                v-if="selectedTab === 'call'"
                id="csc-conversations-calls-filter"
                class="q-pb-sm"
                :loading="listLoading"
                @filter="filterCallDirectionEvent"
            />
        </template>
        <q-infinite-scroll
            ref="infiniteScroll"
            :offset="500"
            @load="loadNextPage"
        >
            <template
                #loading
            >
                <div />
            </template>
            <div
                class="row justify-center"
            >
                <q-list
                    v-if="items.length > 0"
                    class="col-xs-12 col-md-8"
                    no-border
                >
                    <csc-conversation-item
                        v-for="(item, index) in items"
                        :key="item.type + '-' + item.id"
                        :item="item"
                        :class="'q-pa-md csc-item-' + ((index % 2 === 0)?'odd':'even')"
                        :call-available="isCallEnabled"
                        :blocked-incoming="blockedIncoming(item)"
                        :blocked-outgoing="blockedOutgoing(item)"
                        @start-call="startCall"
                        @get-voicemail-transcript="getVoicemailTranscription"
                        @download-fax="downloadFax"
                        @download-voice-mail="downloadVoiceMail"
                        @play-voice-mail="playVoiceMail"
                        @toggle-block-incoming="toggleBlockIncomingAction"
                        @toggle-block-outgoing="toggleBlockOutgoingAction"
                        @toggle-block-both="toggleBlockBothAction"
                        @add-to-phonebook="addToPhonebookAction"
                        @delete-voicemail="$refs.confirmDeletionDialog.show();deletionId=$event.id"
                        @delete-fax="$refs.confirmDeletionFaxDialog.show();deletionId=$event.id"
                    />
                </q-list>
                <div
                    v-else-if="!listLoading && items.length === 0"
                    class="col-xs-12 col-md-8 q-pa-lg text-center"
                    data-cy="conversations-empty"
                >
                    {{ noResultsMessage }}
                </div>
                <div
                    v-if="listLoading"
                    class="col-xs-12 col-md-8"
                >
                    <csc-list-spinner />
                </div>
            </div>
        </q-infinite-scroll>
        <csc-remove-dialog
            ref="confirmDeletionDialog"
            title-icon="delete"
            title-icon-color="negative"
            :title="$t('Remove Voicemail')"
            :message="$t('You are about to remove this Voicemail')"
            @remove="deleteVoicemailConfirmed({id:deletionId, tab: selectedTab})"
            @cancel="deletionId=null"
        />
        <csc-remove-dialog
            ref="confirmDeletionFaxDialog"
            title-icon="delete"
            title-icon-color="negative"
            :title="$t('Remove Fax')"
            :message="$t('You are about to remove this Fax')"
            @remove="deleteFaxConfirmed({id:deletionId, tab: selectedTab})"
            @cancel="deletionId=null"
        />
    </csc-page-sticky-tabs>
</template>

<script>
import CscListSpinner from 'components/CscListSpinner'
import CscPageStickyTabs from 'components/CscPageStickyTabs'
import CscRemoveDialog from 'components/CscRemoveDialog'
import CscConversationItem from 'components/pages/Conversations/CscConversationItem'
import CscConversationsCallsFilter from 'components/pages/Conversations/CscConversationsCallsFilter'
import CscConversationsFilter from 'components/pages/Conversations/CscConversationsFilter'
import { PROFILE_ATTRIBUTE_MAP } from 'src/constants'
import { showGlobalError } from 'src/helpers/ui'
import platformMixin from 'src/mixins/platform'
import { RequestState } from 'src/store/common'
import { mapWaitingActions } from 'vue-wait'
import {
    mapGetters, mapMutations,
    mapState
} from 'vuex'
export default {
    name: 'CscPageConversations',
    components: {
        CscRemoveDialog,
        CscConversationsFilter,
        CscConversationsCallsFilter,
        CscConversationItem,
        CscListSpinner,
        CscPageStickyTabs
    },
    mixins: [
        platformMixin
    ],
    data () {
        return {
            filter: undefined,
            filterDirection: undefined,
            topMargin: 0,
            deletionId: null,
            selectedTab: window.history.state.initialTab || 'call-fax-voicemail'
        }
    },
    computed: {
        ...mapGetters('user', [
            'isFaxFeatureEnabled',
            'hasSubscriberProfileAttribute'
        ]),
        ...mapState('conversations', [
            'reachedLastPage',
            'downloadVoiceMailState',
            'downloadVoiceMailError',
            'downloadFaxState',
            'downloadFaxError',
            'blockedIncomingState',
            'blockedIncomingError',
            'blockedOutgoingState',
            'blockedOutgoingError',
            'toggleBlockedState',
            'toggleBlockedError',
            'deletionState',
            'deletionError'
        ]),
        ...mapGetters('conversations', [
            'items',
            'isNumberIncomingBlocked',
            'isNumberOutgoingBlocked'
        ]),
        ...mapGetters('call', [
            'isCallEnabled'
        ]),
        tabs () {
            const tabs = [
                {
                    label: this.$t('All'),
                    value: 'call-fax-voicemail',
                    icon: 'inbox'
                },
                {
                    label: this.$t('Calls'),
                    value: 'call',
                    icon: 'call'
                },
                ...(this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.voiceMail) ? [{
                    label: this.$t('Voicemails'),
                    value: 'voicemail',
                    icon: 'voicemail'
                }] : []),
                ...(this.isFaxFeatureEnabled ? [{
                    label: this.$t('Faxes'),
                    value: 'fax',
                    icon: 'description'
                }] : [])
            ]

            if (tabs.length === 2) {
                return tabs.filter((tab) => tab.value !== 'call-fax-voicemail')
            }

            return tabs
        },
        pageStyle () {
            return {
                paddingTop: `${this.topMargin}px`
            }
        },
        noResultsMessage () {
            if (this.selectedTab === 'call-fax-voicemail') {
                if (!this.isFaxFeatureEnabled) {
                    return this.$t('No Calls or Voicemails found')
                }
                return this.$t('No Calls, Voicemails or Faxes found')
            } else if (this.selectedTab === 'call') {
                return this.$t('No Calls found')
            } else if (this.selectedTab === 'fax') {
                return this.$t('No Faxes found')
            } else if (this.selectedTab === 'voicemail') {
                return this.$t('No Voicemails found')
            }
            return ''
        },
        labelAll () {
            if (this.isMobile) {
                return ''
            }
            return this.$t('All')
        },
        labelCalls () {
            if (this.isMobile) {
                return ''
            }
            return this.$t('Calls')
        },
        labelFaxes () {
            if (this.isMobile) {
                return ''
            }
            return this.$t('Faxes')
        },
        labelVoicemails () {
            if (this.isMobile) {
                return ''
            }
            return this.$t('Voicemails')
        },
        listLoading () {
            return this.$wait.is('csc-conversations')
        }
    },
    watch: {
        downloadVoiceMailState (state) {
            if (state === RequestState.failed) {
                showGlobalError(this.downloadVoiceMailError)
            }
        },
        downloadFaxState (state) {
            if (state === RequestState.failed) {
                showGlobalError(this.downloadFaxError)
            }
        },
        blockedIncomingState (state) {
            if (state === RequestState.failed) {
                showGlobalError(this.blockedIncomingError)
            }
        },
        blockedOutgoingState (state) {
            if (state === RequestState.failed) {
                showGlobalError(this.blockedOutgoingError)
            }
        },
        toggleBlockedState (state) {
            if (state === RequestState.failed) {
                showGlobalError(this.toggleBlockedError)
            }
        },
        deletionState (state) {
            if (state === RequestState.failed) {
                showGlobalError(this.deletionError)
            }
        }
    },
    async mounted () {
        this.topMargin = this.$refs.pageSticky.$el.offsetHeight
        this.resetList()
        await this.$store.dispatch('conversations/getBlockedNumbers')
        this.$refs.infiniteScroll.poll()
    },
    methods: {
        ...mapWaitingActions('conversations', {
            nextPage: 'csc-conversations',
            deleteVoicemail: 'csc-conversations',
            getVoicemailTranscript: 'csc-conversations',
            toggleBlockIncoming: 'csc-conversations',
            toggleBlockOutgoing: 'csc-conversations',
            toggleBlockBoth: 'csc-conversations',
            deleteFax: 'csc-conversations'
        }),
        ...mapWaitingActions('transcriptions', {
            getVoicemailTranscript: 'csc-transcriptions'
        }),
        ...mapMutations('conversations', [
            'resetList'
        ]),
        async loadNextPage (index, done) {
            let type = this.selectedTab
            if (this.selectedTab === 'call-fax-voicemail') {
                type = null
            }
            const fullFilters = {}
            if (this.filter) {
                Object.assign(fullFilters, this.filter)
            }
            if (this.filterDirection) {
                Object.assign(fullFilters, this.filterDirection)
            }

            await this.nextPage({
                type,
                index,
                filter: fullFilters,
                done
            }).finally(() => {
                this.$wait.end('csc-conversations')
            })
        },
        selectTab (tabName) {
            if (this.selectedTab !== tabName) {
                this.filterDirection = undefined
                this.forceTabReload(tabName)
            }
        },
        forceTabReload (tabName) {
            this.selectedTab = tabName
            // Note: we have to set loading mark manually as a workaround that we cannot force infinitScroll to load data immediately
            this.$wait.start('csc-conversations')

            this.resetList()
            this.$refs.infiniteScroll.reset()
            if (this.reachedLastPage) {
                this.$refs.infiniteScroll.resume()
                this.$refs.infiniteScroll.trigger()
            } else {
                this.$refs.infiniteScroll.poll()
            }
        },
        forceReload () {
            this.forceTabReload(this.selectedTab)
        },
        filterTab (data, tabName) {
            this.filter = {
                from: data.from,
                to: data.to
            }
            this.forceTabReload(tabName)
        },
        startCall (number) {
            this.$store.commit('call/numberInputChanged', number)
            this.$router.push('home')
        },
        downloadFax (fax) {
            this.$store.dispatch('conversations/downloadFax', fax.id)
        },
        downloadVoiceMail (voiceMail) {
            this.$store.dispatch('conversations/downloadVoiceMail', voiceMail.id)
        },
        playVoiceMail (voiceMail) {
            this.$store.dispatch('conversations/playVoiceMail', {
                id: voiceMail.id,
                format: voiceMail.format
            })
        },
        async toggleBlockIncomingAction (options) {
            this.resetList()
            try {
                await this.toggleBlockIncoming(options)
            } finally {
                this.forceReload()
            }
        },
        async toggleBlockOutgoingAction (options) {
            this.resetList()
            try {
                await this.toggleBlockOutgoing(options)
            } finally {
                this.forceReload()
            }
        },
        async toggleBlockBothAction (options) {
            this.resetList()
            try {
                await this.toggleBlockBoth(options)
            } finally {
                this.forceReload()
            }
        },
        async deleteVoicemailConfirmed (payload) {
            this.resetList()
            try {
                await this.deleteVoicemail(payload)
            } finally {
                this.forceReload()
            }
        },
        async deleteFaxConfirmed (payload) {
            this.resetList()
            try {
                await this.deleteFax(payload)
            } finally {
                this.forceReload()
            }
        },
        blockedIncoming (item) {
            if (item.direction === 'out') {
                return this.isNumberIncomingBlocked(item.callee)
            }
            return this.isNumberIncomingBlocked(item.caller)
        },
        blockedOutgoing (item) {
            if (item.direction === 'out') {
                return this.isNumberOutgoingBlocked(item.callee)
            }
            return this.isNumberOutgoingBlocked(item.caller)
        },
        filterCallDirectionEvent (filter) {
            this.$scrollTo(this.$parent.$el)
            this.filterDirection = filter
            this.forceReload()
        },
        async getVoicemailTranscription (voicemailId) {
            await this.getVoicemailTranscript(voicemailId)
        },
        addToPhonebookAction (number) {
            this.$store.commit('user/setPhonebookNumber', number)
            this.$router.push('subscriber-phonebook/create')
        }
    }
}
</script>
