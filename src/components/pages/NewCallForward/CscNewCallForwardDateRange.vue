<template>
	<div
		v-if="enabled"
		class="csc-form"
	>
		<div
			class="csc-cf-daterange-popovers-container"
		>
			<q-datetime
				ref="dayFrom"
				v-model="dayFrom"
				class="csc-cf-datetime"
				type="date"
				format="DD/MM/YYYY"
				:min="today"
				@blur="openParent()"
			/>
			<q-datetime
				ref="dayTo"
				v-model="dayTo"
				class="csc-cf-datetime"
				type="date"
				format="DD/MM/YYYY"
				:min="dayFrom"
				@blur="openParent()"
			/>
			<q-datetime
				ref="hourFrom"
				v-model="hourFrom"
				class="csc-cf-datetime"
				type="time"
				format="HH:MM"
				@blur="openParent()"
			/>
			<q-datetime
				ref="hourTo"
				v-model="hourTo"
				class="csc-cf-datetime"
				type="time"
				format="HH:MM"
				:min="hourFrom"
				@blur="openParent()"
			/>
		</div>
		<div
			class="csc-cf-daterange-fields-cont csc-form-actions row justify-center csc-actions-cont"
		>
			<q-field
				dark
				label="Date range"
				:label-width="11"
				class="csc-cf-popover-daterange-title"
			/>
		</div>
		<div
			class="csc-cf-daterange-fields-cont csc-form-actions row justify-center csc-actions-cont"
		>
			<q-input
				v-model="dayFromFormatted"
				dark
				:placeholder="$t('pages.newCallForward.dateRangeStartDate')"
				:after="[
					{
						icon: 'today',
						handler () {
							openDayFrom();
						}
					}
				]"
				@click="openDayFrom()"
			/>
			<q-input
				v-model="dayToFormatted"
				dark
				:placeholder="$t('pages.newCallForward.dateRangeEndDate')"
				:after="[
					{
						icon: 'today',
						handler () {
							openDayTo();
						}
					}
				]"
				@click="openDayTo()"
			/>
		</div>
		<div
			class="csc-form-actions row justify-center csc-actions-cont"
		>
			<q-input
				v-model="hourFromFormatted"
				dark
				:placeholder="$t('pages.newCallForward.dateRangeStartTime')"
				:after="[
					{
						icon: 'access_time',
						handler () {
							openHourFrom();
						}
					}
				]"
				@click="openHourFrom()"
			/>
			<q-input
				v-model="hourToFormatted"
				dark
				:placeholder="$t('pages.newCallForward.dateRangeEndTime')"
				:after="[
					{
						icon: 'access_time',
						handler () {
							openHourTo();
						}
					}
				]"
				@click="openHourTo()"
			/>
		</div>
		<div
			class="csc-cf-daterange-btn-cont"
		>
			<q-btn
				v-if="!noClear"
				flat
				color="red"
				icon="delete"
				@mousedown.native="showRemoveDateRangeDialog()"
			>
				{{ $t('buttons.remove') }}
				<csc-confirm-dialog
					ref="confirmDeleteTimesetDialog"
					title-icon="delete"
					:title="$t('pages.newCallForward.cancelTimesetDialogTitle', {name: groupTimeRange})"
					:message="$t('pages.newCallForward.cancelTimesetText', {name: groupTimeRange})"
					@confirm="deleteTimeset"
				/>
			</q-btn>
			<q-btn
				flat
				color="default"
				icon="clear"
				@click="cancelTimerange(); resetTimeRange()"
			>
				{{ $t('buttons.cancel') }}
			</q-btn>
			<q-btn
				flat
				color="primary"
				icon="done"
				:disable="!allFieldsFilled"
				@click="save();"
			>
				{{ $t('buttons.save') }}
			</q-btn>
		</div>
	</div>
</template>

<script>
import CscConfirmDialog from '../../CscConfirmationDialog'
import {
	date
} from 'quasar'
export default {
	name: 'CscNewCallForwardDateRange',
	components: {
		CscConfirmDialog
	},
	props: {
		groupName: {
			type: String,
			default: ''
		},
		groupId: {
			type: String,
			default: null
		},
		groupTimeRange: {
			type: Object,
			default: null
		},
		noClear: {
			type: Boolean,
			default: false
		},
		id: {
			type: String,
			default: null
		}
	},
	data () {
		return {
			enabled: false,
			timesetId: null,
			timesetName: null,
			dayFrom: null,
			dayTo: null,
			hourFrom: null,
			hourTo: null,
			today: new Date(),
			dayRegExp: /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/i,
			timeRegExp: /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/
		}
	},
	computed: {
		dayFromFormatted () {
			let day = this.dayFrom ? this.dayFrom : ''
			if (day.toString().length > 0 && !day.match(this.dayRegExp)) {
				day = date.formatDate(day, 'DD/MM/YYYY')
			}
			return day
		},
		dayToFormatted () {
			let day = this.dayTo ? this.dayTo : ''
			if (day.toString().length > 0 && !day.match(this.dayRegExp)) {
				day = date.formatDate(day, 'DD/MM/YYYY')
			}
			return day
		},
		hourFromFormatted () {
			let time = this.hourFrom ? this.hourFrom : ''
			if (time.toString().length > 0 && !time.match(this.timeRegExp)) {
				time = date.formatDate(time, 'hh:mm')
			}
			return time
		},
		hourToFormatted () {
			let time = this.hourTo ? this.hourTo : ''
			if (time.toString().length > 0 && !time.match(this.timeRegExp)) {
				time = date.formatDate(time, 'hh:mm')
			}
			return time
		},
		allFieldsFilled () {
			return this.dayFrom !== null &&
				this.dayTo !== null &&
				this.hourFrom !== null &&
				this.hourTo !== null
		}
	},
	mounted () {
		this.setDaysAndTimes()
	},
	methods: {
		openParent () {
			this.$emit('open-daterange-popover')
		},
		openDayFrom () {
			this.$refs.dayFrom.open()
		},
		openDayTo () {
			this.$refs.dayTo.open()
		},
		openHourFrom () {
			this.$refs.hourFrom.open()
		},
		openHourTo () {
			this.$refs.hourTo.open()
		},
		cancel () {
			this.close()
		},
		close () {
			this.$parent.close()
			this.enabled = false
		},
		add () {
			this.enabled = true
		},
		showRemoveDialog () {
		},
		formatRange (startDate, endDate, startTime, endTime) {
			const startDateOnly = startDate.toString().split('T')[0]
			const endDateOnly = endDate.toString().split('T')[0]
			const startTimeOnly = startTime.toString().split('T')[1]
			const endTimeOnly = endTime.toString().split('T')[1]
			const getDateObj = date => (([year, month, day]) => ({ day, year, month }))(date.split('-'))
			const getTimeObj = time => (([hour, minute, second]) => ({ hour, minute, second }))(time.split(':'))
			const startDateObj = getDateObj(startDateOnly)
			const endDateObj = getDateObj(endDateOnly)
			const startTimeObj = getTimeObj(startTimeOnly)
			const endTimeObj = getTimeObj(endTimeOnly)
			return [
				{
					year: startDateObj.year + '-' + endDateObj.year,
					month: startDateObj.month + '-' + endDateObj.month,
					mday: startDateObj.day + '-' + endDateObj.day,
					hour: startTimeObj.hour + '-' + endTimeObj.hour,
					minute: startTimeObj.minute + '-' + endTimeObj.minute
				}
			]
		},
		async save () {
			this.$store.dispatch('newCallForward/addGroupLoader', this.groupId)
			const datesTimesInRange = this.formatRange(this.dayFrom, this.dayTo, this.hourFrom, this.hourTo)
			if (!this.timesetName) {
				this.timesetName = 'timeset-' + this.groupId
			}
			const timeSetId = await this.$store.dispatch('newCallForward/createTimeSet', this.timesetName)

			this.$store.dispatch('newCallForward/addTimesetToGroup', {
				name: this.groupName,
				groupId: this.groupId,
				timeSetId: timeSetId
			})
			const updatedTimeset = await this.$store.dispatch('newCallForward/addRangeToTimeset', {
				id: timeSetId,
				times: datesTimesInRange
			})
			this.$store.dispatch('newCallForward/setTimeset', updatedTimeset)
			this.$store.dispatch('newCallForward/removeGroupLoader', this.groupId)
			this.cancelTimerange()
		},
		async deleteTimeset () {
			try {
				this.$store.dispatch('newCallForward/addGroupLoader', this.groupId)
				await this.$store.dispatch('newCallForward/deleteTimeset', this.timesetId)
				this.$store.dispatch('newCallForward/loadMappings')
				this.$store.dispatch('newCallForward/removeGroupLoader', this.groupId)
			} catch (e) {
				console.log(e)
			}
		},
		resetTimeRange () {
			this.dayFrom = null
			this.dayTo = null
			this.hourFrom = null
			this.hourTo = null
		},
		cancelTimerange () {
			this.$parent.close()
			this.action = null
			this.enabled = false
		},
		setDaysAndTimes () {
			if (this.groupTimeRange) {
				this.dayFrom = this.groupTimeRange.dateFrom
				this.dayTo = this.groupTimeRange.dateTo
				this.hourFrom = this.groupTimeRange.dateFrom
				this.hourTo = this.groupTimeRange.dateTo
			} else {
				this.resetTimeRange()
			}
		},
		showRemoveDateRangeDialog () {
			this.$parent.close()
			this.$emit('confirm-delete')
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-cf-popover-daterange-title
        text-align center
        width 100%
        margin-left 40px
        margin-top 50px
        margin-bottom -60px
        .q-field-label-inner
            color $white
            margin-top -25px
            margin-bottom 10px
            font-weight bold
            span
                width 100%
                text-align center
    .csc-actions-cont
        margin-bottom 15px
        .q-input
            margin-left 10px
            margin-right 20px
            max-width 160px
    .csc-cf-daterange-fields-cont
        margin-top 73px !important
    .csc-cf-daterange-popovers-container
        width   100%
        height  1px !important
        margin-top -70px !important
        margin-bottom -30px !important
        position relative
    .csc-cf-datetime
        position absolute
        top 0
        left 0
    .csc-cf-daterange-btn-cont
        width 100%
        text-align center
    .q-datetime-days div:not(.q-datetime-day-active),
    .q-datetime-dark,
    .q-datetime-range .q-datetime-input .q-input-target,
    .q-datetime-range .q-icon,
    .q-datetime-range .q-if:before,
    .q-item-icon
        color $white !important
    .q-datetime-range.row .q-datetime-range-right,
    .q-datetime-range.row .q-datetime-range-left
        padding-left 20px

</style>
