<template>
	<div
		v-if="group.destinations.length > 0"
		class="csc-cf-group"
	>
		<div
			class="row csc-cf-destination-cont"
		>
			<div
				class="col col-xs-12 col-md-4 text-right csc-cf-group-title-bold"
			>
				{{ groupTitle }}
				<span
					v-if="groupSourceset"
				>
					{{ $t('pages.newCallForward.conditionBtnLabelPrefix') }}
					<span class="csc-cf-from-link">
						{{ $t('pages.newCallForward.fromLabelShort') +'"'+ groupSourceset +'"' }}
					</span>
					<q-popover
						ref="sourcesList"
						class="csc-cf-number-form"
						@open="showSources()"
					>
						<csc-new-call-forward-edit-sources
							ref="editSources"
							:source-set-name="groupSourceset"
							:source-set-id="sourceSet.id"
							:group-name="group.name"
							:group-id="group.id"
						/>
					</q-popover>

				</span>
				<span
					v-if="groupTimeset && !isRange"
				>
					{{ $t('pages.newCallForward.conditionBtnLabelPrefix') }}
					<span class="csc-cf-from-link">
						{{ $t('pages.newCallForward.dateIsShort') + groupTimeset }}
					</span>
					<q-popover
						ref="day"
						class="csc-cf-popover-top-valign"
						@open="showQDate()"
					>
						<q-datetime
							ref="dayWidget"
							v-model="dayModel"
							clear-label="REMOVE"
							:min="today"
						/>
					</q-popover>
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
					</span>
					<q-popover
						ref="daterange"
						class="csc-cf-calendar-day"
						@open="showDateRange()"
					>
						<csc-new-call-forward-date-range
							ref="dateRangePopover"
							:group-name="group.name"
							:group-id="group.id"
							:group-time-range="groupTimeRangeObj"
							@open-daterange-popover="rangeChanged()"
							@confirm-delete="showConfirmDeleteTimesetDialog()"
						/>
						<csc-confirm-dialog
							ref="confirmDeleteTimesetDialog"
							title-icon="delete"
							:title="$t('pages.newCallForward.cancelTimesetDialogTitle', {name: groupTimeRange})"
							:message="$t('pages.newCallForward.cancelTimesetText', {name: groupTimeRange})"
							@confirm="deleteTimeset"
						/>
					</q-popover>
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
					<q-popover
						ref="weekdayEditPanel"
						class="csc-cf-number-form"
						@open="showWeekdayEditForm()"
					>
						<csc-new-call-forward-add-weekday-form
							:id="timeSet.id"
							ref="weekdayEditForm"
							:days="times"
							:enabled="true"
							:group-name="group.name"
							:group-id="group.id"
						/>
					</q-popover>
				</span>
				<span
					v-if="isTempGroup || (!isTempGroup && !(groupSourceset && groupTimeset || groupSourceset && isWeekdays || groupTimeset && isWeekdays ))"
					class="csc-cf-destination-add-condition"
				>
					{{ $t('pages.newCallForward.conditionBtnLabelPrefix') }}
					<span class="csc-cf-from-link">
						{{ $t('pages.newCallForward.conditionBtnLabel') }}
					</span>
					<q-popover
						ref="conditions"
						@open="showConditions()"
						@close="showConditionForm()"
					>
						<csc-new-call-forward-condition-type-select
							ref="addCondition"
							:disable-sourceset-menu="isTempGroup || !groupSourceset"
							:disable-timeset-menu="isTempGroup || !groupTimeset && !isRange && !isWeekdays"
							:disable-date-range-menu="isTempGroup || !groupTimeset && !isRange && !isWeekdays"
							:disable-weekdays-menu="isTempGroup || !groupTimeset && !isRange && !isWeekdays"
							:enabled="true"
							:group-name="group.name"
							:group-id="group.id"
						/>
					</q-popover>
					<span>
						<q-popover
							ref="onlineSourceset"
							class="csc-cf-number-form csc-cf-popover-left-align"
							:class="{ 'csc-cf-popover-hide': toggleConditionFromForm}"
							@open="showSourcesetForm()"
							@close="resetToggleCondition(); resetAction()"
						>
							<csc-new-call-forward-add-sourceset-form
								ref="addSourceSet"
								:enabled="true"
								:group-name="group.name"
								:group-id="group.id"
							/>
						</q-popover>
					</span>
					<span>
						<q-popover
							ref="day"
							class="csc-cf-popover-left-align csc-cf-popover-top-valign"
							:class="{ 'csc-cf-popover-hide': toggleIsDatePanel}"
							@open="showQDate()"
							@close="resetAction()"
						>
							<q-datetime
								ref="dayWidget"
								v-model="dayModel"
								anchor="bottom right"
								no-clear
								:min="today"
							/>
						</q-popover>
					</span>
					<span>
						<q-popover
							ref="daterange"
							class="csc-cf-popover-left-align csc-cf-calendar-day"
							:class="{ 'csc-cf-popover-hide': toggleIsRangePanel}"
							@open="showDateRange()"
							@close="resetAction()"
						>
							<csc-new-call-forward-date-range
								ref="dateRangePopover"
								:group-name="group.name"
								:group-id="group.id"
								:no-clear="true"
								@open-daterange-popover="rangeChanged()"
							/>
						</q-popover>
					</span>
					<span>
						<q-popover
							ref="weekdayPanel"
							class="csc-cf-number-form csc-cf-popover-left-align"
							:class="{ 'csc-cf-popover-hide': toggleWeekdayPanel}"
							@open="showWeekdayPanel()"
							@close="resetWeekdayCondition(); resetAction()"
						>
							<csc-new-call-forward-add-weekday-form
								ref="weekdayForm"
								:enabled="true"
								:group-name="group.name"
								:group-id="group.id"
							/>
						</q-popover>
					</span>
				</span>
			</div>
			<div class="col text-left col-xs-12 col-md-2 csc-cf-dest-number-cont">
				<q-toggle
					v-model="isEnabled"
					@input="toggleGroupChange"
				/>
			</div>
			<div class="col col-xs-12 col-md-5 csc-cf-group-actions">
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
					class="csc-call-spinner"
					color="primary"
					:size="24"
				/>
			</div>
		</div>

		<div
			v-if="isTimeoutOrUnconditional"
			class="csc-cf-destination-cont row"
		>
			<div
				class="col col-xs-12 col-md-4 text-right"
				:class="{ 'csc-cf-destination-disabled': !isEnabled }"
			>
				{{ toggleLabel }}
			</div>
			<div
				class="col col-xs-12 col-md-2 text-left csc-cf-self-number-cont"
			>
				{{ subscriberDisplayName }}
			</div>

			<div
				class="col col-xs-12 col-md-6"
			/>
		</div>

		<div
			v-for="(destination, index) in group.destinations"
			:key="index"
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
			<div class="col col-xs-12 col-md-4 text-right" />
			<div
				v-if="showAddDestBtn"
				class="col col-xs-12 col-md-2 text-left"
				:class="{ 'csc-cf-destination-disabled': !isEnabled }"
			>
				<div
					class="csc-cf-destination-add-destination"
				>
					<q-icon
						name="add"
						color="primary"
						size="24px"
					/>

					{{ $t('pages.newCallForward.addDestinationLabel') }}
				</div>
				<q-popover
					ref="destTypeForm"
					class="csc-cf-group-popover-bottom"
					@open="showDestTypeForm()"
					@close="showNext()"
				>
					<csc-new-call-forward-destination-type-form
						ref="selectDestinationType"
					/>
				</q-popover>
				<q-popover
					ref="numberForm"
					class="csc-cf-number-form csc-cf-group-popover-bottom"
					:class="{ 'csc-cf-popover-hide': toggleNumberForm }"
					@open="showNewDestNumber()"
				>
					<csc-new-call-forward-add-destination-form
						ref="addDestinationForm"
						:group-name="group.name"
						:group-id="group.id"
					/>
				</q-popover>
			</div>
			<div class="col col-xs-12 col-md-6 " />
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
import CscNewCallForwardConditionTypeSelect from './CscNewCallForwardConditionTypeSelect'
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
		CscNewCallForwardConditionTypeSelect,
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
			today: new Date()
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
			'getFirstDestinationInCreation'
		]),
		showAddDestBtn () {
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
			let retVal = false, time
			if (this.timeSet && this.timeSet.times && this.timeSet.times.length > 0) {
				time = this.timeSet.times[0]
				retVal = {
					dateFrom: moment(new Date(parseInt(time.year.split('-')[0]), parseInt(time.month.split('-')[0]) - 1, parseInt(time.mday.split('-')[0]), parseInt(time.hour.split('-')[0]), parseInt(time.minute.split('-')[0]), 0, 0)).format(),
					dateTo: moment(new Date(parseInt(time.year.split('-')[1]), parseInt(time.month.split('-')[1]) - 1, parseInt(time.mday.split('-')[1]), parseInt(time.hour.split('-')[1]), parseInt(time.minute.split('-')[1]), 0, 0)).format()
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
			let times = _.get(this.timeSet, 'times', [])
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
					return
				}
				const time = this.timeSet.times[0]
				const dateN = new Date(parseInt(time.year), parseInt(time.month) - 1, parseInt(time.mday), 0, 0, 0, 0)
				return dateN
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
				this.$refs.conditions.open()
			}
		}
	},
	async mounted () {
		try {
			if (!this.firstDestinationInCreation) {
				this.isEnabled = await this.$store.dispatch('newCallForward/isGroupEnabled', { groupName: this.group.name, id: this.group.id })
			}
			await this.updateSourcesetNames()
			await this.updateTimeSetNames()
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
			switch (this.$refs.selectDestinationType.action) {
			case 'destination':
				this.toggleNumberForm = false
				this.$refs.numberForm.open()
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

			firstDestinationCmp.$refs.destTypeForm.open()
		},
		showConditionForm () {
			if (this.isTempGroup) {
				this.showFirstDestMenu()
				return
			}
			const action = this.$refs.addCondition.action
			switch (action) {
			case 'addFromCondition':
				this.toggleConditionFromForm = false
				this.$refs.onlineSourceset.open()
				break
			case 'addDateIsCondition':
				this.toggleIsDatePanel = false
				this.$refs.day.open()
				break
			case 'addDateRangeCondition':
				this.toggleIsRangePanel = false
				this.$refs.daterange.open()
				break
			case 'addWeekdayCondition':
				this.toggleWeekdayPanel = false
				this.$refs.weekdayPanel.open()
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
			this.$refs.conditions.open()
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
			this.$refs.addCondition.action = null
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
		showQDateContainer () {
			this.toggleIsDatePanel = false
			this.$refs.day.open()
		},
		showQDate () {
			this.$refs.dayWidget.open()
		},
		showDateRange () {
			this.$refs.dateRangePopover.add()
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
					this.$store.dispatch('newCallForward/addTimesetToGroup', {
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
			this.$refs.daterange.open()
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-cf-group
        width 100%
    .csc-cf-group-title-bold
        text-align right
        font-weight bold
    .csc-cf-group-cont
        position relative
    .csc-cf-destination-label
        text-align right
    .csc-cf-destination-value
        text-align center
    .csc-cf-destination-add-condition
        font-size 16px
    .csc-cf-destination-add-destination
        padding-left 25px
        width 250px
        white-space nowrap
        overflow hidden
        text-overflow ellipsis
        color $primary
        cursor pointer
    .csc-cf-group-popover-bottom
        margin-left 30px
    .csc-cf-popover-left-align
        margin-left -120px
    .csc-cf-popover-top-valign
        margin-top -40px
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
