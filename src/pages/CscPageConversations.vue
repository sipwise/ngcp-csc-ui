<template>
    <csc-page-sticky-tabs
        id="csc-page-conversations"
        ref="pageSticky"
        :value="selectedTab"
    >
        <template
            v-slot:tabs
        >
            <q-tab
                v-for="tab in tabs"
                :key="tab.value"
                :name="tab.value"
                :icon="tab.icon"
                :label="tab.label"
                :default="tab.value === selectedTab"
                @click="selectTab(tab.value)"
            />
        </template>
        <template
            v-slot:toolbar
        >
            <csc-conversations-filter
                id="csc-conversations-filter"
                v-model="filter"
                class="q-pb-sm"
                :loading="isNextPageRequesting"
                :disable="isNextPageRequesting"
                @input="filterTab(selectedTab)"
            />
        </template>
        <q-infinite-scroll
            ref="infiniteScroll"
            :offset="500"
            @load="loadNextPage"
        >
            <template
                slot="loading"
            >
                <csc-list-spinner
                    class="q-pa-lg"
                />
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
                    class="q-pa-lg text-center"
                >
                    {{ noResultsMessage }}
                </div>
                <q-page-scroller
                    color="primary"
                />
            </div>
        </q-infinite-scroll>
        <csc-remove-dialog
            ref="confirmDeletionDialog"
            title-icon="delete"
            title-icon-color="negative"
            :title="$t('Remove Voicemail')"
            :message="$t('You are about to remove this Voicemail')"
            @remove="deleteVoicemail({id:deletionId, tab: selectedTab})"
            @cancel="deletionId=null"
        />
    </csc-page-sticky-tabs>
</template>

<script>
import platformMixin from 'src/mixins/platform'
import {
    mapGetters,
    mapActions,
    mapState
} from 'vuex'
import CscPageStickyTabs from 'components/CscPageStickyTabs'
import CscListSpinner from 'components/CscListSpinner'
import CscConversationItem from 'components/pages/Conversations/CscConversationItem'
import CscConversationsFilter from 'components/pages/Conversations/CscConversationsFilter'
import CscRemoveDialog from 'components/CscRemoveDialog'
export default {
    name: 'CscConversations',
    components: {
        CscRemoveDialog,
        CscConversationsFilter,
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
            topMargin: 0,
            deletionId: null,
            selectedTab: 'call-fax-voicemail'
        }
    },
    computed: {
        tabs () {
            return [
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
                {
                    label: this.$t('Voicemails'),
                    value: 'voicemail',
                    icon: 'voicemail'
                },
                {
                    label: this.$t('Faxes'),
                    value: 'fax',
                    icon: 'description'
                }
            ]
        },
        ...mapState('conversations', [
            'reachedLastPage'
        ]),
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
        pageStyle () {
            return {
                paddingTop: this.topMargin + 'px'
            }
        },
        noResultsMessage () {
            if (this.selectedTab === 'call-fax-voicemail') {
                return this.$t('No Calls, Voicemails or Faxes found')
            } else if (this.selectedTab === 'call') {
                return this.$t('No Calls found')
            } else if (this.selectedTab === 'fax') {
                return this.$t('No Faxes found')
            } else if (this.selectedTab === 'voicemail') {
                return this.$t('No Voicemails found')
            } else {
                return ''
            }
        },
        labelAll () {
            if (this.isMobile) {
                return ''
            } else {
                return this.$t('All')
            }
        },
        labelCalls () {
            if (this.isMobile) {
                return ''
            } else {
                return this.$t('Calls')
            }
        },
        labelFaxes () {
            if (this.isMobile) {
                return ''
            } else {
                return this.$t('Faxes')
            }
        },
        labelVoicemails () {
            if (this.isMobile) {
                return ''
            } else {
                return this.$t('Voicemails')
            }
        }
    },
    async mounted () {
        this.topMargin = this.$refs.pageSticky.$el.offsetHeight
        this.$store.commit('conversations/resetList')
        await this.$store.dispatch('conversations/getBlockedNumbers')
        this.$refs.infiniteScroll.poll()
    },
    methods: {
        loadNextPage (index, done) {
            let type = this.selectedTab
            if (this.selectedTab === 'call-fax-voicemail') {
                type = null
            }
            this.$store.dispatch('conversations/nextPage', {
                type: type,
                index: index,
                filter: this.filter,
                done: done
            })
        },
        selectTab (tabName) {
            if (this.selectedTab !== tabName) {
                this.forceTabReload(tabName)
            }
        },
        forceTabReload (tabName) {
            this.selectedTab = tabName
            this.$store.commit('conversations/resetList')
            this.$refs.infiniteScroll.reset()
            if (this.reachedLastPage) {
                this.$refs.infiniteScroll.resume()
                this.$refs.infiniteScroll.trigger()
            } else {
                this.$refs.infiniteScroll.poll()
            }
        },
        filterTab (tabName) {
            this.forceTabReload(tabName)
        },
        async reload () {
            this.$store.commit('conversations/resetList')
        },
        ...mapActions('conversations', [
            'deleteVoicemail'
        ]),
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
        toggleBlockIncoming (options) {
            this.$store.dispatch('conversations/toggleBlockIncoming', options).finally(() => {
                this.reload()
            })
        },
        toggleBlockOutgoing (options) {
            this.$store.dispatch('conversations/toggleBlockOutgoing', options)
        },
        toggleBlockBoth (options) {
            this.$store.dispatch('conversations/toggleBlockBoth', options)
        },
        blockedIncoming (item) {
            if (item.direction === 'out') {
                return this.isNumberIncomingBlocked(item.callee)
            } else {
                return this.isNumberIncomingBlocked(item.caller)
            }
        },
        blockedOutgoing (item) {
            if (item.direction === 'out') {
                return this.isNumberOutgoingBlocked(item.callee)
            } else {
                return this.isNumberOutgoingBlocked(item.caller)
            }
        }
    }
}
</script>
