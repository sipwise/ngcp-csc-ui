<template>
	<csc-page-sticky-tabs
		v-model="tab"
	>
		<template
			v-slot:tabs
		>
			<q-tab
				v-for="(sourceset, index) in destinations"
				:key="sourceset.sourcesetId || 0"
				:default="index === 0"
				:count="destinationsCount(sourceset.destinationGroups)"
				:name="sourceset.sourcesetName || 'always'"
				:label="sourceset.sourcesetName || $t('pages.callForward.everyCaller')"
				icon="people"
				@click="currentSourceSet = sourceset"
			/>
			<q-tab
				:label="$t('buttons.addNew')"
				name="addnew"
				icon="add"
			/>
		</template>
		<template
			v-if="tab !== 'always' && tab !== 'addnew'"
			v-slot:toolbar
		>
			<q-toolbar>
				<q-space />
				<q-btn
					flat
					color="negative"
					icon="delete"
					:label="deleteSourcesetLabel"
					@click="removeSourceset(currentSourceSet)"
				/>
				<q-space />
			</q-toolbar>
		</template>
		<template>
			<csc-list-spinner
				v-if="loading"
				class="q-pa-lg"
			/>
			<slot />
			<q-tab-panels
				v-if="!loading"
				ref="tabPanels"
				v-model="tab"
				class="bg-transparent"
				swipeable
			>
				<q-tab-panel
					v-for="sourceset in destinations"
					:key="sourceset.sourcesetId || 0"
					:name="sourceset.sourcesetName || 'always'"
				>
					<div
						v-if="sourceset.sourcesetId"
						class="row justify-center q-mb-sm"
					>
						<q-list
							class="col col-xs-12 col-md-8"
							dense
						>
							<q-item>
								<q-item-section
									side
								>
									<q-icon
										name="contact_phone"
										size="24px"
									/>
								</q-item-section>
								<q-item-section>
									<q-item-label
										header
										class="text-uppercase"
									>
										{{ $t('pages.callForward.sources.sourcesTitleMode', {
											mode: capitalizedMode(sourceset.sourcesetMode)}) }}
									</q-item-label>
								</q-item-section>
							</q-item>
							<q-item
								v-for="(sourceItem, index) in sourcesetSources(sourceset.sourcesetId)"
								:key="index"
								:class="'csc-item-' + ((index % 2 === 0)?'odd':'even')"
							>
								<q-item-section>
									{{ sourceItem.source }}
								</q-item-section>
								<q-item-section
									side
								>
									<csc-more-menu>
										<csc-popup-menu-item
											color="negative"
											icon="delete"
											:label="$t('buttons.remove')"
											@click="removeSource(sourceset, sourceItem.source, index)"
										/>
									</csc-more-menu>
								</q-item-section>
							</q-item>
						</q-list>
					</div>
					<div
						v-if="sourceset.sourcesetId"
						class="row justify-center q-mb-lg"
					>
						<div
							class="col col-xs-12 col-md-8"
						>
							<q-btn
								v-if="!sourcesetsFormEnabled"
								flat
								color="primary"
								icon="add"
								@click="openForm()"
							>
								{{ $t('pages.callForward.sources.addSourceButton') }}
							</q-btn>
							<csc-sourcesets-form
								v-if="sourcesetsFormEnabled"
								ref="sourcesetsForm"
								:sourceset-id="sourceset.sourcesetId"
								:form-enabled="addSourceFormEnabled"
								@add-source="addSource"
								@source-form-close="closeForm"
							/>
						</div>
					</div>
					<div
						class="row justify-center"
					>
						<csc-call-forward-destinations
							class="col col-xs-12 col-md-8"
							:sourceset="sourceset.sourcesetId"
							:timeset="timesetName"
							:destinations="sourceset.destinationGroups"
						/>
					</div>
				</q-tab-panel>
				<q-tab-panel
					name="addnew"
					class="row justify-center"
				>
					<q-list
						class="col col-xs-12 col-md-8"
					>
						<q-item
							class="no-padding"
						>
							<q-item-section>
								<q-input
									v-model="sourcesetName"
									autofocus
									:label="$t('pages.callForward.sources.sourceset')"
									color="primary"
									dense
									@keyup.enter="addSourceset()"
								/>
							</q-item-section>
							<q-item-section>
								<q-input
									v-model="source"
									:label="$t('pages.callForward.sources.source')"
									color="primary"
									dense
									@keyup.enter="addSourceset()"
								/>
							</q-item-section>
							<q-item-section>
								<q-select
									v-model="mode"
									:options="modes"
									dense
									emit-value
									map-options
									color="primary"
								/>
							</q-item-section>
							<q-item-section
								side
							>
								<q-btn
									flat
									icon="check"
									color="primary"
									dense
									:disable="!isValid"
									class="sourceset-add-button"
									@click="addSourceset()"
								>
									{{ $t('buttons.save') }}
								</q-btn>
							</q-item-section>
						</q-item>
					</q-list>
				</q-tab-panel>
			</q-tab-panels>
		</template>
	</csc-page-sticky-tabs>
</template>

<script>
import CscCallForwardDestinations from './CscCallForwardDestinations'
import {
	mapGetters
} from 'vuex'
import {
	showGlobalError,
	showToast
} from 'src/helpers/ui'
import {
	Alert
} from 'src/quasar-legacy'
import CscPageStickyTabs from 'components/CscPageStickyTabs'
import CscListSpinner from 'components/CscListSpinner'
import CscSourcesetsForm from 'components/pages/CallForward/CscSourcesetsForm'
import CscMoreMenu from 'components/CscMoreMenu'
import CscPopupMenuItem from 'components/CscPopupMenuItem'

export default {
	name: 'CscSourcesets',
	components: {
		CscPopupMenuItem,
		CscMoreMenu,
		CscSourcesetsForm,
		CscListSpinner,
		CscPageStickyTabs,
		CscCallForwardDestinations
	},
	props: {
		destinations: {
			type: Array,
			default: undefined
		},
		sourcesets: {
			type: Array,
			default: undefined
		},
		timesetName: {
			type: String,
			default: null
		},
		loading: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			currentSourceSet: null,
			sourcesetName: '',
			source: '',
			mode: 'whitelist',
			modes: [
				{
					label: this.$t('pages.callForward.whitelist'),
					value: 'whitelist'
				},
				{
					label: this.$t('pages.callForward.blacklist'),
					value: 'blacklist'
				}
			],
			tab: 'always',
			sourcesetsFormEnabled: false
		}
	},
	computed: {
		...mapGetters('callForward', [
			'addSourceState',
			'addSourceError',
			'lastAddedSource',
			'addSourceFormEnabled',
			'removeSourcesetError',
			'removeSourcesetState',
			'lastRemovedSourceset',
			'removeSourceState',
			'removeSourceError',
			'lastRemovedSource'
		]),
		isValid () {
			return this.source.length > 0 && this.sourcesetName.length > 0
		},
		deleteSourcesetLabel () {
			return this.$q.platform.is.mobile ? ''
				: this.$t('pages.callForward.sources.removeSourcesetButton')
		}
	},
	watch: {
		addSourceState (state) {
			if (state === 'requesting') {
			} else if (state === 'failed') {
				showGlobalError(this.addSourceError)
			} else if (state === 'succeeded') {
				showToast(this.$t('pages.callForward.sources.addSourceSuccessMessage', {
					source: this.lastAddedSource
				}))
				this.$store.dispatch('callForward/loadSourcesets')
				this.loadDestinations()
				this.closeForm()
			}
		},
		removeSourcesetState (state) {
			if (state === 'requesting') {
			} else if (state === 'failed') {
				showGlobalError(this.removeSourcesetError)
			} else if (state === 'succeeded') {
				showToast(this.$t('pages.callForward.sources.removeSourcesetSuccessMessage', {
					sourceset: this.lastRemovedSourceset
				}))
				this.loadAll()
				this.resetForm()
				this.$refs.tabPanels.goTo('always')
			}
		},
		removeSourceState (state) {
			if (state === 'requesting') {
			} else if (state === 'failed') {
				showGlobalError(this.removeSourceError)
			} else if (state === 'succeeded') {
				showToast(this.$t('pages.callForward.sources.removeSourceSuccessMessage', {
					source: this.lastRemovedSource
				}))
				this.loadAll()
			}
		}
	},
	methods: {
		removeSource (sourceset, source, index) {
			const sources = this.sourcesetSources(sourceset.sourcesetId)
			const isLastSource = sources.length === 1
			if (isLastSource) {
				this.alertDeleteLastSource()
			} else {
				this.$q.dialog({
					title: this.$t('pages.callForward.sources.removeSourceDialogTitle'),
					message: this.$t('pages.callForward.sources.removeSourceDialogText', {
						source: source
					}),
					color: 'negative',
					cancel: true,
					persistent: true
				}).onOk(data => {
					this.$store.dispatch('callForward/deleteSourceFromSourcesetByIndex', {
						sourceset: sourceset,
						sources: sources,
						sourceIndex: index
					})
				})
			}
		},
		alertDeleteLastSource () {
			Alert.create({
				enter: 'bounceInRight',
				leave: 'bounceOutRight',
				position: 'top-center',
				html: this.$t('pages.callForward.sources.removeLastSourceDialogText'),
				icon: 'warning',
				dismissible: true
			})
		},
		capitalizedMode (mode) {
			return `${mode.charAt(0).toUpperCase()}${mode.slice(1)}`
		},
		resetForm () {
			this.source = ''
			this.sourcesetName = ''
			this.mode = 'whitelist'
		},
		sourcesetSources (id) {
			const sourceset = this.sourcesets.filter((sourceset) => {
				return sourceset.id === id
			})[0]
			if (this.sourcesets[0] && sourceset) {
				return sourceset.sources
			} else {
				return []
			}
		},
		destinationsCount (groups) {
			const groupCollection = [
				{ name: 'busy', length: 0 },
				{ name: 'offline', length: 0 },
				{ name: 'online', length: 0 }
			]
			groupCollection.forEach((group) => {
				if (groups[group.name].length > 0) {
					let count = 0
					groups[group.name].forEach((destinationSet) => {
						count += destinationSet.destinations.length
					})
					group.length = count
				}
			})
			return groupCollection[0].length + groupCollection[1].length + groupCollection[2].length
		},
		tabId (id) {
			return id === null ? 0 : id
		},
		tabName (name) {
			return name === null ? 'Everybody' : name
		},
		addSourceset () {
			if (this.isValid) {
				this.$store.dispatch('callForward/createSourcesetWithSource', {
					sourcesetName: this.sourcesetName,
					source: this.source,
					mode: this.mode,
					timeset: this.timesetName
				})
			} else {
				showGlobalError(this.$t('pages.callForward.sources.fieldMissing'))
			}
		},
		openForm () {
			this.sourcesetsFormEnabled = true
		},
		closeForm () {
			this.$refs.sourcesetsForm[0].resetForm()
			this.sourcesetsFormEnabled = false
		},
		addSource (options) {
			this.$store.dispatch('callForward/appendSourceToSourceset', options)
		},
		removeSourceset (sourceset) {
			this.$q.dialog({
				title: this.$t('pages.callForward.sources.removeSourcesetDialogTitle'),
				message: this.$t('pages.callForward.sources.removeSourcesetDialogText', {
					sourceset: sourceset.sourcesetName
				}),
				color: 'negative',
				cancel: true,
				persistent: true
			}).onOk(data => {
				this.$store.dispatch('callForward/deleteSourcesetById', sourceset).finally(() => {
					this.$refs.tabPanels.goTo('always')
				})
			})
		},
		loadDestinations () {
			this.$store.dispatch('callForward/loadDestinations', {
				timeset: this.timesetName
			})
		},
		loadAll () {
			this.loadDestinations()
			this.$store.dispatch('callForward/loadSourcesets')
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
.q-item-highlight.source-item:hover
	background-color $item-highlight-color

.sourceset-tabs

	.q-tab-pane
		padding 12px 0 0 0

.sourceset-add-button
	margin-top 8px

.sources-section
	padding 0 0 20px 0

	.mobile-button > span > i
		margin 0

.sources-title
	color $secondary
	font-size 16px

.sources-icon
	margin-right 5px

</style>
