<template>
	<div
		v-if="group.destinations.length > 0"
		class="csc-cf-group"
	>
		<div
			class="row csc-cf-destination-cont csc-cf-group-header"
		>
			<div
				class="col-xs-4 col-md-4 text-right csc-cf-group-title-bold"
			>
				{{ groupTitle }}
				<span
					v-if="groupSourceset"
				>
					{{ $t('pages.newCallForward.conditionBtnLabelPrefix') }}
					<span class="csc-cf-from-link">
						{{ $t('pages.newCallForward.fromLabelShort') +'"'+ groupSourceset +'"' }}
					</span>
					<q-menu
						ref="sourcesList"
						:target="$refs.target"
						@show="showSources()"
					>
						<csc-new-call-forward-edit-sources
							ref="editSources"
							class="q-pa-md"
							:source-set-name="groupSourceset"
							:source-set-id="sourceSet.id"
							:group-name="group.name"
							:group-id="group.id"
							@close="()=>{this.$refs.sourcesList.hide}"
						/>
					</q-menu>

				</span>
				<span
					v-if="groupTimeset && !isRange"
				>
					{{ $t('pages.newCallForward.conditionBtnLabelPrefix') }}
					<span class="csc-cf-from-link">
						{{ $t('pages.newCallForward.dateIsShort') + groupTimeset }}
					</span>
					<q-menu
						ref="dayWidget"
					>
						<q-date
							v-model="dayModel"
							:options="minDate"
							:no-unset="true"
						>
							<div class="row items-center justify-end q-gutter-sm">
								<q-btn
									v-close-popup
									flat
									color="primary"
									icon="clear"
								>
									{{ $t('buttons.close') }}
								</q-btn>
								<q-btn
									v-close-popup
									flat
									color="red"
									icon="delete"
									@click="showConfirmDeleteTimesetDialog"
								>
									{{ $t('buttons.remove') }}
								</q-btn>
							</div>
						</q-date>
					</q-menu>
					<csc-confirm-dialog
						ref="confirmDeleteTimesetDialog"
						title-icon="delete"
						:title="$t('pages.newCallForward.cancelTimesetDialogTitle', {name: groupTimeset})"
						:message="$t('pages.newCallForward.cancelTimesetText', {name: groupTimeset})"
						@confirm="deleteTimeset"
					/>

				</span>
				<span
					v-if="groupTimeset && isRange"
				>
					{{ $t('pages.newCallForward.conditionBtnLabelPrefix') }}
					<span
						ref="isRangeLink"
						class="csc-cf-from-link"
					>
						{{ $t('pages.newCallForward.dateRangeShort') + groupTimeRange }}
						<q-menu
							ref="daterange"
							@hide="resetAction()"
						>
							<csc-new-call-forward-date-range
								ref="dateRangePopover"
								class="q-pa-md"
								:group-name="group.name"
								:group-id="group.id"
								:group-time-range="groupTimeRangeObj"
								@confirm-delete="showConfirmDeleteTimesetDialog()"
								@close="() => {this.$refs.daterange.hide()}"
							/>
							<csc-confirm-dialog
								ref="confirmDeleteTimesetDialog"
								title-icon="delete"
								:title="$t('pages.newCallForward.cancelTimesetDialogTitle', {name: groupTimeRange})"
								:message="$t('pages.newCallForward.cancelTimesetText', {name: groupTimeRange})"
								@confirm="deleteTimeset"
							/>
						</q-menu>
					</span>
				</span>
				<span
					v-if="isWeekdays"
				>
					{{ $t('pages.newCallForward.conditionBtnLabelPrefix') }}
					<span
						ref="isWeekdayLink"
						class="csc-cf-from-link"
					>
						{{ weekdaysLabelShort + groupWeekdays }}
					</span>
					<q-menu
						ref="weekdayEditPanel"
						@show="showWeekdayEditForm()"
					>
						<csc-new-call-forward-add-weekday-form
							:id="timeSet.id"
							ref="weekdayEditForm"
							class="q-pa-md"
							:days="times"
							:enabled="true"
							:group-name="group.name"
							:group-id="group.id"
						/>
					</q-menu>
				</span>
				<span
					v-if="isTempGroup || (!isTempGroup && !(groupSourceset && groupTimeset || groupSourceset && isWeekdays || groupTimeset && isWeekdays ))"
					class="csc-cf-destination-add-condition"
				>
					{{ $t('pages.newCallForward.conditionBtnLabelPrefix') }}
					<span class="csc-cf-from-link">
						{{ $t('pages.newCallForward.conditionBtnLabel') }}
					</span>
					<q-menu
						ref="conditions"
						:auto-close="true"
						@hide="showConditionForm()"
					>
						<q-list>
							<q-item
								v-if="isTempGroup || !groupSourceset"
								ref="addFromConditionItem"
								v-close-popup
								clickable
								@click="()=>{action = 'addFromCondition'}"
							>
								<q-item-section>{{ $t('pages.newCallForward.fromLabel') }}</q-item-section>
							</q-item>
							<q-item
								v-if="isTempGroup || !groupTimeset && !isRange && !isWeekdays"
								v-close-popup
								clickable
								@click="()=>{action = 'addDateIsCondition'}"
							>
								<q-item-section>{{ $t('pages.newCallForward.dateIsLabel') }}</q-item-section>
							</q-item>
							<q-item
								v-if="isTempGroup || !groupTimeset && !isRange && !isWeekdays"
								v-close-popup
								clickable
								@click="()=>{action = 'addDateRangeCondition'}"
							>
								<q-item-section>{{ $t('pages.newCallForward.dateRangeLabel') }}</q-item-section>
							</q-item>
							<q-item
								v-if="isTempGroup || !groupTimeset && !isRange && !isWeekdays"
								v-close-popup
								clickable
								@click="()=>{action = 'addWeekdayCondition'}"
							>
								<q-item-section>{{ $t('pages.newCallForward.weekdaysLabel') }}</q-item-section>
							</q-item>
						</q-list>
					</q-menu>
					<span>
						<q-menu
							ref="onlineSourceset"
							@show="showSourcesetForm()"
							@hide="resetToggleCondition(); resetAction()"
						>
							<csc-new-call-forward-add-sourceset-form
								ref="addSourceSet"
								class="q-pa-md"
								:enabled="true"
								:group-name="group.name"
								:group-id="group.id"
								@close="()=>{this.$refs.onlineSourceset.hide()}"
							/>
						</q-menu>
					</span>
					<span>
						<q-menu
							ref="dayWidgetFromMenu"
							@hide="resetAction()"
						>
							<q-date
								v-model="dayModel"
								:options="minDate"
								:no-unset="true"
							>
								<div class="row items-center justify-end q-gutter-sm">
									<q-btn
										v-close-popup
										flat
										color="primary"
										icon="clear"
									>
										{{ $t('buttons.close') }}
									</q-btn>
									<q-btn
										v-close-popup
										flat
										color="red"
										icon="delete"
										@click="showConfirmDeleteTimesetDialog"
									>
										{{ $t('buttons.remove') }}
									</q-btn>
								</div>
							</q-date>
						</q-menu>
					</span>
					<span>
						<q-menu
							ref="daterangeFromMenu"
							@hide="resetAction()"
						>
							<csc-new-call-forward-date-range
								ref="dateRangePopover"
								class="q-pa-md"
								:group-name="group.name"
								:group-id="group.id"
								:no-clear="true"
								@close="() => {this.$refs.daterangeFromMenu.hide()}"
							/>
						</q-menu>
					</span>
					<span>
						<q-menu
							ref="weekdayPanel"
							@show="showWeekdayPanel()"
							@hide="resetWeekdayCondition(); resetAction()"
						>
							<csc-new-call-forward-add-weekday-form
								ref="weekdayForm"
								class="q-pa-md"
								:enabled="true"
								:group-name="group.name"
								:group-id="group.id"
							/>
						</q-menu>
					</span>
				</span>
			</div>
			<div class="text-left col-xs-2 col-md-2 csc-cf-dest-number-cont csc-cf-toggle-group">
				<q-toggle
					v-model="isEnabled"
					@input="toggleGroupChange"
				/>
			</div>
			<div class="col-xs-5 col-md-5 csc-cf-group-actions">
				<q-icon
					name="delete"
					color="negative"
					size="24px"
					@click="showConfirmDialog"
				/>
				<csc-confirm-dialog
					ref="confirmDialog"
					title-icon="delete"
					:title="$t('pages.newCallForward.cancelGroupDialogTitle', {groupName: group.name})"
					:message="$t('pages.newCallForward.cancelGroupDialogText', {groupName: group.name})"
					@confirm="confirmDeleteGroup"
				/>
				<q-spinner-dots
					v-if="groupIsLoading"
					class="q-ml-auto"
					color="primary"
					:size="24"
				/>
			</div>
		</div>

		<div
			v-if="isTimeoutOrUnconditional"
			class="csc-cf-destination-cont row"
			:class="{ 'csc-cf-destination-disabled': !isEnabled }"
		>
			<div
				class="col-xs-4 col-md-4 text-right"
			>
				{{ toggleLabel }}
			</div>
			<div
				class="text-left col-xs-2 col-md-2 csc-cf-dest-number-cont"
			>
				{{ subscriberDisplayName }}
			</div>

			<div
				class="col-xs-6 col-md-6"
			/>
		</div>

		<div
			v-for="(destination, index) in group.destinations"
			:key="destination.display_id"
		>
			<csc-new-call-forward-destination
				ref="destination"
				:destination="getDestination(index)"
				:index="index"
				:group-id="group.id"
				:group-name="group.name"
				:all-calls-fwd="(['csc-unconditional', 'csc-busy', 'csc-offline'].includes(group.name) && index === 0)"
				:class="{ 'csc-cf-destination-disabled': !isEnabled }"
			/>
		</div>
		<div
			class="row csc-cf-destination-cont"
		>
			<div class="col-xs-4 col-md-4 text-right" />
			<div
				v-if="showAddDestBtn"
				class="col-xs-2 col-md-2 text-left"
				:class="{ 'csc-cf-destination-disabled': !isEnabled }"
			>
				<div
					class="csc-cf-destination-add-destination"
				>
					<q-btn
						flat
						color="primary"
						class=""
					>
						<q-icon
							name="add"
							color="primary"
							size="24px"
						/>
						{{ $t('pages.newCallForward.addDestinationLabel') }}
						<q-menu
							ref="destTypeForm"
							:auto-close="true"
							@show="showDestTypeForm()"
							@hide="showNext()"
						>
							<csc-new-call-forward-destination-type-form
								ref="selectDestinationType"
							/>
						</q-menu>
					</q-btn>
				</div>
				<q-menu
					ref="numberForm"
					:no-parent-event="true"
					:class="{ 'csc-cf-popover-hide': toggleNumberForm }"
					@show="showNewDestNumber()"
				>
					<csc-new-call-forward-add-destination-form
						ref="addDestinationForm"
						class="q-pa-md"
						:enabled="true"
						:group-name="group.name"
						:group-id="group.id"
					/>
				</q-menu>
			</div>
			<div class="col-xs-6 col-md-6 " />
		</div>
	</div>
</template>

<script>
import moment from 'moment'
import _ from 'lodash'
import {
	mapGetters
} from 'vuex'
import {
	date
} from 'quasar'
import CscConfirmDialog from '../../CscConfirmationDialog'
import CscNewCallForwardDestination from './CscNewCallForwardDestination'
import CscNewCallForwardAddDestinationForm from './CscNewCallForwardAddDestinationForm'
import CscNewCallForwardEditSources from './CscNewCallForwardEditSources'
import CscNewCallForwardAddSourcesetForm from './CscNewCallForwardAddSourcesetForm'
import CscNewCallForwardAddWeekdayForm from './CscNewCallForwardAddWeekdayForm'
import CscNewCallForwardDestinationTypeForm from './CscNewCallForwardDestinationTypeForm'
import CscNewCallForwardDateRange from './CscNewCallForwardDateRange'
export default {
	name: 'CscCfGroup',
	components: {
		CscConfirmDialog,
		CscNewCallForwardDestination,
		CscNewCallForwardAddDestinationForm,
		CscNewCallForwardEditSources,
		CscNewCallForwardAddSourcesetForm,
		CscNewCallForwardAddWeekdayForm,
		CscNewCallForwardDestinationTypeForm,
		CscNewCallForwardDateRange
	},
	props: {
		group: {
			type: Object,
			default: null
		},
		toggleDefaultNumber: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			firstDestinationInCreation: false,
			toggleGroup: true,
			isEnabled: true,
			toggleNumberForm: true,
			toggleConditionFromForm: true,
			toggleWeekdayPanel: true,
			toggleIsDatePanel: true,
			toggleIsRangePanel: true,
			groupIsLoading: false,
			sourceSet: null,
			sources: [],
			timeSet: null,
			times: [],
			action: null,
			enabled: false,
			day: null,
			today: new Date().toString()
		}
	},
	computed: {
		...mapGetters('newCallForward', [
			'subscriberDisplayName',
			'getGroupsLoaders',
			'getOwnPhoneTimeout',
			'groupsCount',
			'getMappings',
			'getGroupsLoaders',
			'getSourcesets',
			'getTimesets',
			'getFirstDestinationInCreation',
			'getSelectedDestinationType'
		]),
		showAddDestBtn () {
			if (this.isTempGroup) {
				return false
			}
			for (const destination of this.group.destinations) {
				const dest = _.get(destination, 'destination', '')
				if (_.endsWith(dest, 'voicebox.local')) {
					return false
				}
			}
			return true
		},
		groupTitle () {
			let title
			switch (this.group.name) {
			case 'csc-unconditional':
			case 'csc-timeout':
				title = `${this.$t('pages.newCallForward.titles.timeoutGroup')}`
				break
			case 'csc-unconditional-from':
			case 'csc-timeout-from':
				title = `${this.$t('pages.newCallForward.titles.timeoutGroupFromPre')}`
				break
			case 'csc-offline':
				title = `${this.$t('pages.newCallForward.titles.offlineGroup')}`
				break
			case 'csc-busy':
				title = `${this.$t('pages.newCallForward.titles.busyGroup')}`
				break
			}
			return title
		},
		groupSourceset () {
			return this.sourceSet ? this.sourceSet.name : false
		},
		groupTimeset () {
			let retVal = false, dateN, time
			if (this.timeSet && this.timeSet.times && this.timeSet.times.length > 0) {
				time = this.timeSet.times[0]
				if (time.year && time.month && time.mday) {
					dateN = new Date(parseInt(time.year), parseInt(time.month) - 1, parseInt(time.mday), 0, 0, 0, 0)
					retVal = date.formatDate(dateN, 'ddd, MMM D YYYY')
				}
			}
			return retVal
		},
		groupTimeRange () {
			let retVal = false, startDateN, endDateN, time
			if (this.timeSet && this.timeSet.times && this.timeSet.times.length > 0) {
				time = this.timeSet.times[0]
				startDateN = new Date(parseInt(time.year.split('-')[0]), parseInt(time.month.split('-')[0]) - 1, parseInt(time.mday.split('-')[0]), 0, 0, 0, 0)
				endDateN = new Date(parseInt(time.year.split('-')[1]), parseInt(time.month.split('-')[1]) - 1, parseInt(time.mday.split('-')[1]), 0, 0, 0, 0)
				retVal = date.formatDate(startDateN, 'ddd, MMM D YYYY') + ' - ' + date.formatDate(endDateN, 'ddd, MMM D YYYY')
			}
			return retVal
		},
		groupTimeRangeObj () {
			let retVal = false, time, fromYear, fromMonth, fromDay, fromHour, fromMinute, toYear, toMonth, toDay, toHour, toMinute, dateFrom, dateTo
			if (this.timeSet && this.timeSet.times && this.timeSet.times.length > 0) {
				time = this.timeSet.times[0]
				fromYear = parseInt(time.year.split('-')[0])
				fromMonth = parseInt(time.month.split('-')[0]) - 1
				fromDay = parseInt(time.mday.split('-')[0])
				fromHour = time.hour && time.hour.includes('-') ? parseInt(time.hour.split('-')[0]) : null
				fromMinute = time.minute && time.minute.includes('-') ? parseInt(time.minute.split('-')[0]) : null
				toYear = parseInt(time.year.split('-')[1])
				toMonth = parseInt(time.month.split('-')[1]) - 1
				toDay = parseInt(time.mday.split('-')[1])
				toHour = time.hour && time.hour.includes('-') ? parseInt(time.hour.split('-')[1]) : null
				toMinute = time.minute && time.minute.includes('-') ? parseInt(time.minute.split('-')[1]) : null
				dateFrom = moment(new Date(fromYear, fromMonth, fromDay, fromHour, fromMinute), 0, 0)
				dateTo = moment(new Date(toYear, toMonth, toDay, toHour, toMinute), 0, 0)
				retVal = {
					dateFrom: fromHour ? dateFrom.format() : dateFrom.format('YYYY-MM-DD'),
					dateTo: toHour ? dateTo.format() : dateTo.format('YYYY-MM-DD')
				}
			}
			return retVal
		},
		isRange () {
			const isRange = this.timeSet &&
				this.timeSet.times &&
				this.timeSet.times.length > 0 &&
				this.timeSet.times[0].year &&
				this.timeSet.times[0].year.includes('-')
			return isRange
		},
		weekdaysLabelShort () {
			return this.timeSet.times.length > 1
				? `${this.$t('pages.newCallForward.weekdaysLabelShort')}`
				: `${this.$t('pages.newCallForward.weekdayLabelShort')}`
		},
		groupWeekdays () {
			let retVal = ''
			let times = _.cloneDeep(_.get(this.timeSet, 'times', []))
			times = times.sort((a, b) => (parseInt(a.wday) > parseInt(b.wday)) ? 1 : ((parseInt(b.wday) > parseInt(a.wday)) ? -1 : 0))
			times.forEach((time, index) => {
				const separator = (index === times.length - 1) ? '' : ', '
				switch (time.wday) {
				case '2':
					retVal += `${this.$t('pages.callForward.times.monday')}`
					break
				case '3':
					retVal += `${this.$t('pages.callForward.times.tuesday')}`
					break
				case '4':
					retVal += `${this.$t('pages.callForward.times.wednesday')}`
					break
				case '5':
					retVal += `${this.$t('pages.callForward.times.thursday')}`
					break
				case '6':
					retVal += `${this.$t('pages.callForward.times.friday')}`
					break
				case '7':
					retVal += `${this.$t('pages.callForward.times.saturday')}`
					break
				case '1':
					retVal += `${this.$t('pages.callForward.times.sunday')}`
					break
				}
				retVal += separator
			})
			return retVal
		},
		isWeekdays () {
			const isWeekdays = this.timeSet &&
				this.timeSet.times &&
				this.timeSet.times.length > 0 &&
				this.timeSet.times[0].wday &&
				this.timeSet.times[0].wday > 0
			return isWeekdays
		},
		isTempGroup () {
			return this.group.id.toString().includes('temp-')
		},
		isFirstDestInCreation () {
			return this.group.id.toString() === this.getFirstDestinationInCreation
		},
		toggleLabel () {
			return this.toggleDefaultNumber ? `${this.$t('pages.newCallForward.primarNumberEnabled')}` : `${this.$t('pages.newCallForward.primarNumberDisabled')}`
		},
		isTimeoutOrUnconditional () {
			return this.group.name.includes('unconditional') || this.group.name.includes('timeout')
		},
		dayModel: {
			get () {
				if (!this.timeSet) {
					return ''
				}
				const time = this.timeSet.times[0]
				const dateN = new Date(parseInt(time.year), parseInt(time.month) - 1, parseInt(time.mday), 0, 0, 0, 0)
				return date.formatDate(dateN, 'YYYY/MM/DD')
			},
			set (value) {
				if (value !== '') {
					this.addTimeToExistingTimeset(value)
				} else {
					this.showConfirmDeleteTimesetDialog()
				}
			}
		}
	},
	watch: {
		getSourcesets: function () {
			this.updateSourcesetNames()
		},
		getTimesets: function () {
			this.updateTimeSetNames()
		},
		getGroupsLoaders: function () {
			const groupLoaders = this.getGroupsLoaders
			this.groupIsLoading = groupLoaders.includes(this.group.id)
		},
		getFirstDestinationInCreation: function () {
			if (this.getFirstDestinationInCreation === this.group.id.toString() && this.$refs.conditions) {
				this.$refs.conditions.show()
			}
		}
	},
	async mounted () {
		try {
			if (!this.firstDestinationInCreation) {
				this.isEnabled = await this.$store.dispatch('newCallForward/isGroupEnabled', { groupName: this.group.name, id: this.group.id })
			}
			this.$store.dispatch('newCallForward/addGroupLoader', this.group.id)
			await this.updateSourcesetNames()
			await this.updateTimeSetNames()
			this.$store.dispatch('newCallForward/removeGroupLoader', this.group.id)
		} catch (err) {
			console.log(err)
		}
	},
	methods: {
		// we need to generate key because destinations have no id
		genKey () {
			return Math.random()
		},
		showNewDestNumber () {
			this.$refs.addDestinationForm.add()
		},
		async showNext () {
			switch (this.getSelectedDestinationType) {
			case 'destination':
				this.toggleNumberForm = false
				this.$refs.numberForm.show()
				break
			case 'voicemail':
				this.$store.dispatch('newCallForward/addGroupLoader', this.group.id)
				await this.$store.dispatch('newCallForward/addVoiceMail', this.group.id)
				this.$store.dispatch('newCallForward/loadForwardGroups')
				this.$store.dispatch('newCallForward/removeGroupLoader', this.group.id)
				break
			}
		},
		showFirstDestMenu () {
			const firstDestinationCmp = this.$refs.destination[0]
			firstDestinationCmp.firstDestinationInCreation = true
			if (this.group.name.includes('timeout') || this.group.name.includes('unconditional')) {
				firstDestinationCmp.movePopoverTimeoutToTop()
			} else {
				firstDestinationCmp.movePopoverToTop()
			}

			firstDestinationCmp.$refs.destTypeForm.show()
		},
		setCondition (action) {
			this.action = action
			this.$refs.conditions.hide()
		},
		showConditionForm () {
			if (this.isTempGroup) {
				this.showFirstDestMenu()
				return
			}
			const action = this.action
			switch (action) {
			case 'addFromCondition':
				this.toggleConditionFromForm = false
				this.$refs.onlineSourceset.show()
				break
			case 'addDateIsCondition':
				this.toggleIsDatePanel = false
				this.$refs.dayWidgetFromMenu.show()
				break
			case 'addDateRangeCondition':
				this.toggleIsRangePanel = false
				this.$refs.daterangeFromMenu.show()
				break
			case 'addWeekdayCondition':
				this.toggleWeekdayPanel = false
				this.$refs.weekdayPanel.show()
				break
			}
		},
		showDestTypeForm () {
			this.toggleNumberForm = true
			this.$refs.selectDestinationType.add()
		},
		showWeekdayEditForm () {
			this.$refs.weekdayEditForm.add()
		},
		getDestName (index) {
			return 'destination' + index
		},
		getDestination (index) {
			const destination = { ...this.group.destinations[index] }
			if (index === 0) {
				destination.timeout = !isNaN(this.getOwnPhoneTimeout) ? this.getOwnPhoneTimeout : 5
			} else {
				destination.timeout = this.group.destinations[index - 1].timeout
			}
			return destination
		},
		async toggleGroupChange () {
			this.$store.dispatch('newCallForward/addGroupLoader', this.group.id)
			await this.$store.dispatch('newCallForward/enableGroup', {
				groupName: this.group.name,
				id: this.group.id,
				enabled: this.isEnabled
			})
			this.$store.dispatch('newCallForward/removeGroupLoader', this.group.id)
		},
		openConditionsPopover () {
			this.$refs.conditions.show()
		},
		showConditions () {
			this.$refs.addCondition.add()
		},
		showSourcesetForm () {
			this.$refs.addSourceSet.add()
		},
		showWeekdayPanel () {
			this.$refs.weekdayForm.add()
		},
		showSources () {
			this.$refs.editSources.add()
		},
		resetToggleCondition () {
			this.toggleConditionFromForm = true
		},
		resetAction () {
			this.action = null
		},
		resetWeekdayCondition () {
			this.toggleWeekdayPanel = true
		},
		async updateSourcesetNames () {
			const mappings = this.getMappings
			const groupMappingId = await this.$store.dispatch('newCallForward/getMappingIdByGroupName', this.group.name)
			let groupMapping, sourceSet
			if (mappings[groupMappingId]) {
				groupMapping = mappings[groupMappingId].filter(($mapping) => {
					return $mapping.destinationset_id === this.group.id
				})
				sourceSet = groupMapping[0] && groupMapping[0].sourceset_id ? await this.$store.dispatch('newCallForward/getSourcesetById', groupMapping[0].sourceset_id) : null

				if (sourceSet) {
					this.sourceSet = sourceSet
					this.sources = this.sourceSet.sources
				} else {
					this.sourceSet = null
					this.sources = []
				}
			}
		},
		async updateTimeSetNames () {
			const mappings = this.getMappings
			const groupMappingId = await this.$store.dispatch('newCallForward/getMappingIdByGroupName', this.group.name)
			let groupMapping, timeSet
			if (mappings[groupMappingId]) {
				groupMapping = mappings[groupMappingId].filter(($mapping) => {
					return $mapping.destinationset_id === this.group.id
				})
				timeSet = groupMapping[0] && groupMapping[0].timeset_id ? await this.$store.dispatch('newCallForward/getTimesetById', groupMapping[0].timeset_id) : null
				if (timeSet) {
					this.timeSet = timeSet
					this.times = this.timeSet.times
				} else {
					this.timeSet = null
					this.times = []
				}
			}
		},
		showConfirmDialog () {
			this.$refs.confirmDialog.open()
		},
		async confirmDeleteGroup () {
			try {
				this.$store.dispatch('newCallForward/addGroupLoader', this.group.id)
				await this.$store.dispatch('newCallForward/deleteForwardGroup', this.group)
				this.$store.dispatch('newCallForward/loadForwardGroups')
				this.$store.dispatch('newCallForward/removeGroupLoader', this.group.id)
			} catch (e) {
				console.log(e)
			}
		},
		showConfirmDeleteTimesetDialog () {
			this.$refs.confirmDeleteTimesetDialog.open()
		},
		async deleteTimeset () {
			try {
				this.$store.dispatch('newCallForward/addGroupLoader', this.group.id)
				await this.$store.dispatch('newCallForward/deleteTimeset', this.timeSet.id)
				this.$store.dispatch('newCallForward/loadMappings')
				this.$store.dispatch('newCallForward/removeGroupLoader', this.group.id)
			} catch (e) {
				console.log(e)
			}
		},
		async addTimeToExistingTimeset (time) {
			try {
				let timseSetId
				if (!this.timeSet) {
					timseSetId = await this.$store.dispatch('newCallForward/createTimeSet', this.timesetName = 'timeset-' + this.group.id)
				} else {
					timseSetId = this.timeSet.id
				}
				this.$store.dispatch('newCallForward/addGroupLoader', this.group.id)
				this.day = {
					year: date.formatDate(time, 'YYYY'),
					month: date.formatDate(time, 'M'),
					mday: date.formatDate(time, 'D')
				}

				const updatedTimeset = await this.$store.dispatch('newCallForward/addTimeToTimeset', {
					id: timseSetId,
					time: this.day
				})

				if (!this.timeSet) {
					await this.$store.dispatch('newCallForward/addTimesetToGroup', {
						name: this.group.name,
						groupId: this.group.id,
						timeSetId: timseSetId
					})
				}
				this.$store.dispatch('newCallForward/setTimeset', updatedTimeset)
				this.$store.dispatch('newCallForward/removeGroupLoader', this.group.id)
			} catch (e) {
				console.log(e)
			}
		},
		rangeChanged () {
			this.$refs.daterange.show()
		},
		minDate (day) {
			return day >= date.formatDate(new Date(), 'YYYY/MM/DD')
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-cf-group
        width 100%
		.csc-cf-toggle-group
					height 25px !important
		.csc-cf-destination-cont
				width 100%
				margin-bottom 4px
    .csc-cf-group-title-bold
        font-weight bold
    .csc-cf-group-cont
        position relative
    .csc-cf-destination-label
        text-align right
    .csc-cf-destination-value
        text-align center
    .csc-cf-destination-add-condition
        font-size 14px
    .csc-cf-destination-add-destination
        width 250px
        white-space nowrap
        overflow hidden
        text-overflow ellipsis
        color $primary
        cursor pointer
    .csc-cf-from-link
        color $primary
        cursor pointer
	.csc-cf-group-actions
        cursor pointer
    .csc-cf-destination-disabled
        color $cf-disabled-label
        .csc-cf-destination-link
            color $cf-disabled-link
        .csc-cf-destination-actions
            .q-icon
                color $cf-disabled-btn !important
        .csc-cf-destination-add-destination
            color $cf-disabled-link
            .q-icon
                color $cf-disabled-link !important
    .row.q-datetime-controls.modal-buttons-top
        button:first-child
            color red !important
            &:before
                font-family: "Material Icons"
                content: "\e872"
                font-size 24px
                margin-right 10px

</style>
