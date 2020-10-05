<template>
	<csc-page
		:style="pageStyle"
	>
		<q-page-sticky
			ref="pageSticky"
			class="bg-secondary q-pt-lg"
			style="z-index: 10"
			expand
			position="top"
		>
			<q-tabs
				:value="selectedTab"
				class="col-sm-12 col-md-8"
				align="justify"
				inline-label
				active-color="primary"
				dense
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
			</q-tabs>
			<q-separator />
		</q-page-sticky>
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
					class="col-sm-12 col-md-8"
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
			:title="$t('conversations.deleteVoicemailTitle')"
			:message="$t('conversations.deleteVoicemailText')"
			@remove="deleteVoicemail({id:deletionId, tab: selectedTab})"
			@cancel="deletionId=null"
		/>
	</csc-page>
</template>

<script>
import platformMixin from 'src/mixins/platform'
import {
	mapGetters,
	mapActions,
	mapState
} from 'vuex'
import CscPage from 'components/CscPage'
import CscConversationItem from 'components/pages/Conversations/CscConversationItem'
import CscRemoveDialog from 'components/CscRemoveDialog'
import CscListSpinner from 'components/CscListSpinner'
export default {
	name: 'CscConversations',
	components: {
		CscListSpinner,
		CscRemoveDialog,
		CscPage,
		CscConversationItem
	},
	mixins: [
		platformMixin
	],
	data () {
		return {
			topMargin: 0,
			deletionId: null,
			selectedTab: 'call-fax-voicemail'
		}
	},
	computed: {
		tabs () {
			return [
				{
					label: this.$t('pages.conversations.tabLabelAll'),
					value: 'call-fax-voicemail',
					icon: 'inbox'
				},
				{
					label: this.$t('pages.conversations.tabLabelCalls'),
					value: 'call',
					icon: 'call'
				},
				{
					label: this.$t('pages.conversations.tabLabelVoicemails'),
					value: 'voicemail',
					icon: 'voicemail'
				},
				{
					label: this.$t('pages.conversations.tabLabelFaxes'),
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
				return this.$t('pages.conversations.emptyListMessage')
			} else if (this.selectedTab === 'call') {
				return this.$t('pages.conversations.noCallsMessage')
			} else if (this.selectedTab === 'fax') {
				return this.$t('pages.conversations.noFaxesMessage')
			} else if (this.selectedTab === 'voicemail') {
				return this.$t('pages.conversations.noVoicemailsMessage')
			} else {
				return ''
			}
		},
		labelAll () {
			if (this.isMobile) {
				return ''
			} else {
				return this.$t('pages.conversations.tabLabelAll')
			}
		},
		labelCalls () {
			if (this.isMobile) {
				return ''
			} else {
				return this.$t('pages.conversations.tabLabelCalls')
			}
		},
		labelFaxes () {
			if (this.isMobile) {
				return ''
			} else {
				return this.$t('pages.conversations.tabLabelFaxes')
			}
		},
		labelVoicemails () {
			if (this.isMobile) {
				return ''
			} else {
				return this.$t('pages.conversations.tabLabelVoicemails')
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
				done: done
			})
		},
		async selectTab (tabName) {
			if (this.selectedTab !== tabName) {
				this.selectedTab = tabName
				this.$store.commit('conversations/resetList')
				this.$refs.infiniteScroll.reset()
				if (this.reachedLastPage) {
					this.$refs.infiniteScroll.resume()
					this.$refs.infiniteScroll.trigger()
				} else {
					this.$refs.infiniteScroll.poll()
				}
			}
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
		reloadItems () {
			let type = this.selectedTab
			if (type === 'call-fax-voicemail') {
				type = null
			}
			this.$store.dispatch('conversations/reloadItems', {
				retryCount: 1,
				type: type
			})
		},
		filterByType (type) {
			if (type !== this.selectedTab) {
				this.$store.commit('conversations/resetList')
				this.$store.dispatch('conversations/nextPage', type)
			}
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

<style lang="stylus" rel="stylesheet/stylus">
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
</style>
