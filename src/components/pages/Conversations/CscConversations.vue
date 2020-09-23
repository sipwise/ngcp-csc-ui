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
		<!--		<q-tabs-->
		<!--			id="csc-conversations-tabs"-->
		<!--			v-model="selectedTab"-->
		<!--			inverted-->
		<!--			color="primary"-->
		<!--			align="justify"-->
		<!--		>-->
		<!--			<q-tab-->
		<!--				slot="title"-->
		<!--				default-->
		<!--				name="call-fax-voicemail"-->
		<!--				icon="inbox"-->
		<!--				:label="labelAll"-->
		<!--				@click="filterByType('call-fax-voicemail')"-->
		<!--			/>-->
		<!--			<q-tab-->
		<!--				slot="title"-->
		<!--				name="call"-->
		<!--				icon="call"-->
		<!--				:label="labelCalls"-->
		<!--				@click="filterByType('call')"-->
		<!--			/>-->
		<!--			<q-tab-->
		<!--				slot="title"-->
		<!--				name="fax"-->
		<!--				icon="description"-->
		<!--				:label="labelFaxes"-->
		<!--				@click="filterByType('fax')"-->
		<!--			/>-->
		<!--			<q-tab-->
		<!--				slot="title"-->
		<!--				name="voicemail"-->
		<!--				icon="voicemail"-->
		<!--				:label="labelVoicemails"-->
		<!--				@click="filterByType('voicemail')"-->
		<!--			/>-->
		<!--		</q-tabs>-->
		<!--		<div-->
		<!--			id="csc-conversation-content"-->
		<!--		>-->
		<!--			<q-list-->
		<!--				v-if="items.length > 0"-->
		<!--				id="csc-conversation-list"-->
		<!--				no-border-->
		<!--				striped-odd-->
		<!--				multiline-->
		<!--			>-->
		<!--				<csc-conversation-item-->
		<!--					v-for="item in items"-->
		<!--					:key="item._id"-->
		<!--					class="csc-list-item csc-conversation-list-item"-->
		<!--					:item="item"-->
		<!--					:call-available="isCallEnabled"-->
		<!--					:blocked-incoming="blockedIncoming(item)"-->
		<!--					:blocked-outgoing="blockedOutgoing(item)"-->
		<!--					@start-call="startCall"-->
		<!--					@download-fax="downloadFax"-->
		<!--					@download-voice-mail="downloadVoiceMail"-->
		<!--					@play-voice-mail="playVoiceMail"-->
		<!--					@toggle-block-incoming="toggleBlockIncoming"-->
		<!--					@toggle-block-outgoing="toggleBlockOutgoing"-->
		<!--					@toggle-block-both="toggleBlockBoth"-->
		<!--					@delete-voicemail="$refs.confirmDeletionDialog.open();deletionId=$event.id"-->
		<!--				/>-->
		<!--			</q-list>-->
		<!--			<div-->
		<!--				v-else-if="!isNextPageRequesting && items.length === 0"-->
		<!--				class="row justify-center csc-conversation-list-message"-->
		<!--			>-->
		<!--				{{ noResultsMessage }}-->
		<!--			</div>-->
		<!--			<div-->
		<!--				v-if="isNextPageRequesting"-->
		<!--				class="row justify-center"-->
		<!--			>-->
		<!--				<q-spinner-dots-->
		<!--					color="primary"-->
		<!--					:size="40"-->
		<!--				/>-->
		<!--			</div>-->
		<!--		</div>-->
		<!--		&lt;!&ndash;		<q-scroll-observable&ndash;&gt;-->
		<!--		&lt;!&ndash;			@scroll="scroll"&ndash;&gt;-->
		<!--		&lt;!&ndash;		/>&ndash;&gt;-->
		<!--		<q-page-scroller-->
		<!--			position="bottom-right"-->
		<!--			:scroll-offset="100"-->
		<!--		>-->
		<!--			<q-btn-->
		<!--				round-->
		<!--				color="primary"-->
		<!--				:class="backToTopClasses"-->
		<!--			>-->
		<!--				<q-icon-->
		<!--					name="keyboard_arrow_up"-->
		<!--				/>-->
		<!--			</q-btn>-->
		<!--		</q-page-scroller>-->
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
	mapActions,
	mapState
} from 'vuex'
import CscPage from '../../CscPage'
import CscConversationItem from './CscConversationItem'
import CscRemoveDialog from '../../CscRemoveDialog'
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
		// isCalling () {
		// 	return this.callState === 'initiating' ||
		// 		this.callState === 'ringing' ||
		// 		this.callState === 'established' ||
		// 		this.callState === 'incoming'
		// },
		// backToTopClasses () {
		// 	const classes = [
		// 		'fixed-bottom-right',
		// 		'animate-pop',
		// 		'csc-back-to-top',
		// 		'transition-generic'
		// 	]
		// 	if (this.isCalling) {
		// 		classes.push('csc-back-to-top-calling')
		// 	}
		// 	return classes
		// }
	},
	watch: {
		// downloadVoiceMailState (state) {
		// 	if (state === 'requesting') {
		// 		startLoading()
		// 	} else if (state === 'failed') {
		// 		stopLoading()
		// 		showGlobalError(this.downloadVoiceMailError || this.$t('pages.conversations.downloadVoiceMailErrorMessage'))
		// 	} else if (state === 'succeeded') {
		// 		stopLoading()
		// 		showToast(this.$t('pages.conversations.downloadVoiceMailSuccessMessage'))
		// 	}
		// },
		// downloadFaxState (state) {
		// 	if (state === 'requesting') {
		// 		startLoading()
		// 	} else if (state === 'failed') {
		// 		stopLoading()
		// 		showGlobalError(this.downloadFaxError || this.$t('pages.conversations.downloadFaxErrorMessage'))
		// 	} else if (state === 'succeeded') {
		// 		stopLoading()
		// 		showToast(this.$t('pages.conversations.downloadFaxSuccessMessage'))
		// 	}
		// },
		// reloadItemsState (state) {
		// 	if (state === 'failed') {
		// 		showGlobalError(this.reloadItemsError)
		// 	}
		// },
		// callState (newState, oldState) {
		// 	const endedA = newState === 'ended'
		// 	const endedB = oldState === 'established' && newState === 'input'
		// 	const endedC = oldState === 'ringing' && newState === 'input'
		// 	const endedD = oldState === 'incoming' && newState === 'input'
		// 	const isCallTab = this.selectedTab === 'call' || this.selectedTab === 'call-fax-voicemail'
		// 	if (isCallTab && (endedA || endedB || endedC || endedD)) {
		// 		this.reloadItems()
		// 	}
		// },
		// itemsReloaded (state) {
		// 	const offsetTop = offset(this.$el).top
		// 	if (state && offsetTop < -15) {
		// 		window.scrollTo(0, 0)
		// 	}
		// },
		// toggleBlockedState (state) {
		// 	if (state === 'requesting') {
		// 		startLoading()
		// 	} else if (state === 'failed') {
		// 		stopLoading()
		// 	} else if (state === 'succeeded') {
		// 		stopLoading()
		// 		showToast(this.$t('pages.conversations.toggledSuccessMessage', {
		// 			type: this.lastToggledType
		// 		}))
		// 	}
		// }
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
