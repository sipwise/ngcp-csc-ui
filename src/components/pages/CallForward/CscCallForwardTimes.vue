<template>
	<div>
		<q-list
			v-if="times.length > 0"
			dense
			class="q-mb-sm"
		>
			<csc-call-forward-time
				v-for="(time, index) in times"
				:key="index"
				:class="'csc-item-' + ((index % 2 === 0)?'odd':'even')"
				:time="time"
				:index="index"
				@delete-time="deleteTime"
				@delete-last-time="deleteLastTime"
			/>
		</q-list>
		<div
			v-if="timesetTimesLoaded"
		>
			<csc-add-time-form
				v-if="activeTimeForm"
				ref="addFormExisting"
				type="existing"
				:timeset="timesetName"
			/>
			<q-btn
				v-else
				flat
				icon="add"
				color="primary"
				class="add-time"
				@click="enableAddForm()"
			>
				{{ $t('pages.callForward.times.addTimeButton') }}
			</q-btn>
		</div>
	</div>
</template>

<script>
import CscCallForwardTime from './CscCallForwardTime'
import CscAddTimeForm from './CscAddTimeForm'
export default {
	name: 'CscCallForwardTimes',
	components: {
		CscCallForwardTime,
		CscAddTimeForm
	},
	props: {
		times: {
			type: Array,
			default () {
				return []
			}
		},
		timesetName: {
			type: String,
			default: undefined
		},
		activeTimeForm: {
			type: Boolean,
			default: false
		},
		timesetTimesLoaded: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			addFormEnabled: false
		}
	},
	methods: {
		resetTimes () {
			this.$refs.addFormExisting.resetTimes()
		},
		enableAddForm () {
			this.$emit('enable-add-form')
		},
		deleteTime (data) {
			this.$emit('delete-time', data)
		},
		deleteLastTime (data) {
			this.$emit('delete-last-time', data)
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-call-forward-times
        padding 0

    .times-card
        max-width 100%
        margin auto
        margin-bottom 30px

    .add-time
        margin-top 0
</style>
