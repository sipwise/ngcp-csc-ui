<template>
	<div
		v-if="enabled"
	>
		<div
			v-if="disableSourcesetMenu"
			class="csc-cf-dest-type"
			@click="addFromCondition()"
		>
			{{ $t('pages.newCallForward.fromLabel') }}
		</div>
		<div
			v-if="disableTimesetMenu"
			class="csc-cf-dest-type"
			@click="addDateIsCondition()"
		>
			{{ $t('pages.newCallForward.dateIsLabel') }}
		</div>
		<div
			v-if="disableDateRangeMenu"
			ref="daterangeItem"
			class="csc-cf-dest-type"
			@click="addDateRangeCondition()"
		>
			{{ $t('pages.newCallForward.dateRangeLabel') }}
		</div>
		<div
			v-if="disableWeekdaysMenu"
			class="csc-cf-dest-type"
			@click="addWeekdayCondition()"
		>
			{{ $t('pages.newCallForward.weekdaysLabel') }}
		</div>
	</div>
</template>

<script>
export default {
	name: 'CscNewCallForwardConditionTypeSelect',
	props: {
		groupId: {
			type: String,
			default: null
		},
		groupName: {
			type: String,
			default: ''
		},
		disableSourcesetMenu: {
			type: Boolean,
			default: false
		},
		disableTimesetMenu: {
			type: Boolean,
			default: false
		},
		disableDateRangeMenu: {
			type: Boolean,
			default: false
		},
		disableWeekdaysMenu: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			enabled: true,
			action: null,
			timesetName: null
		}
	},
	computed: {
		allFieldsFilled () {
			return this.rangeDateModel.from !== null &&
				this.rangeDateModel.to !== null &&
				this.rangeTimeModel.from !== null &&
				this.rangeTimeModel.to !== null
		}
	},
	mounted () {
		this.timesetName = 'timeset-' + this.groupId
	},
	methods: {
		addFromCondition () {
			this.action = 'addFromCondition'
			this.$parent.close()
		},
		addDateIsCondition () {
			this.action = 'addDateIsCondition'
			this.$parent.close()
		},
		addDateRangeCondition () {
			this.action = 'addDateRangeCondition'
			this.$parent.close()
		},
		addWeekdayCondition () {
			this.action = 'addWeekdayCondition'
			this.$parent.close()
		},
		cancel () {
			this.action = null
			this.enabled = false
			this.$parent.close()
		},
		add () {
			this.enabled = true
		},
		close () {
			this.action = null
			this.enabled = false
			this.$parent.close()
		},
		showQDate () {
			this.$refs.dayWidget.open()
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-cf-dest-type
        min-width 100px
        padding 10px
        cursor pointer
    .csc-cf-dest-type:hover
        background $main-menu-item-hover-background
    .csc-cf-calendar-day
        padding 20px
        min-width 400px
    .q-datetime-weekdays
        color $tertiary
</style>
