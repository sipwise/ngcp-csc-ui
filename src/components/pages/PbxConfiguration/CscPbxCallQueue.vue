<template>
	<csc-list-item
		ref="listItem"
		icon="filter_none"
		:odd="odd"
		:loading="loading"
		:expanded="expanded"
		@toggle="toggle"
	>
		<template
			slot="title"
		>
			<csc-list-item-title
				:icon="getTitleIcon"
			>
				{{ subscriber | displayName }}
			</csc-list-item-title>
			<q-slide-transition>
				<csc-list-item-subtitle
					v-if="!expanded"
				>
					{{ $t('pbxConfig.callQueueMaxLength') }}: {{ getDefaultData().max_queue_length }}
				</csc-list-item-subtitle>
			</q-slide-transition>
			<q-slide-transition>
				<csc-list-item-subtitle
					v-if="!expanded"
				>
					{{ $t('pbxConfig.callQueueWrapUpTime') }}: {{ getDefaultData().queue_wrap_up_time }}
				</csc-list-item-subtitle>
			</q-slide-transition>
		</template>
		<template slot="menu">
			<csc-list-menu-item
				icon="delete"
				icon-color="negative"
				@click="remove"
			>
				{{ $t('buttons.remove') }}
			</csc-list-menu-item>
		</template>
		<template
			slot="body"
		>
			<q-input
				v-model="changes.max_queue_length"
				:label="$t('pbxConfig.callQueueMaxLength')"
				:error="$v.changes.max_queue_length.$error"
				:error-message="queueMaxLengthErrorMessage"
				@input="$v.changes.max_queue_length.$touch"
				@keyup.enter="save"
			>
				<template
					v-if="hasMaxQueueLengthChanged"
					v-slot:append
				>
					<csc-input-button-save
						v-if="!$v.changes.max_queue_length.$error"
						@click.stop="save"
					/>
					<csc-input-button-reset
						@click.stop="resetMaxQueueLength"
					/>
				</template>
			</q-input>
			<q-input
				v-model="changes.queue_wrap_up_time"
				:suffix="$t('pbxConfig.seconds')"
				:label="$t('pbxConfig.callQueueWrapUpTime')"
				:error="$v.changes.queue_wrap_up_time.$error"
				:error-message="queueWrapUpTimeErrorMessage"
				@input="$v.changes.queue_wrap_up_time.$touch"
				@keyup.enter="save"
			>
				<template
					v-if="hasQueueWrapUpTimeChanged"
					v-slot:append
				>
					<csc-input-button-save
						v-if="!$v.changes.queue_wrap_up_time.$error"
						@click.stop="save"
					/>
					<csc-input-button-reset
						@click.stop="resetQueueWrapUpTime"
					/>
				</template>
			</q-input>
		</template>
	</csc-list-item>
</template>

<script>
import {
	minValue,
	maxValue,
	numeric
} from 'vuelidate/lib/validators'
import CscListItem from '../../CscListItem'
import CscListItemTitle from '../../CscListItemTitle'
import CscListItemSubtitle from '../../CscListItemSubtitle'
import CscListMenuItem from '../../CscListMenuItem'
import CscInputButtonSave from 'components/form/CscInputButtonSave'
import CscInputButtonReset from 'components/form/CscInputButtonReset'
export default {
	name: 'CscPbxCallQueue',
	components: {
		CscInputButtonReset,
		CscInputButtonSave,
		CscListItem,
		CscListItemTitle,
		CscListItemSubtitle,
		CscListMenuItem
	},
	props: {
		odd: {
			type: Boolean,
			default: false
		},
		expanded: {
			type: Boolean,
			default: false
		},
		callQueue: {
			type: Object,
			default: null
		},
		subscriber: {
			type: Object,
			default: null
		},
		loading: {
			type: Boolean,
			default: false
		},
		defaultMaxQueueLength: {
			type: Number,
			default: 10
		},
		defaultQueueWrapUpTime: {
			type: Number,
			default: 300
		}
	},
	data () {
		return {
			changes: this.getDefaultData()
		}
	},
	validations: {
		changes: {
			max_queue_length: {
				numeric,
				minValue: minValue(1),
				maxValue: maxValue(99999)
			},
			queue_wrap_up_time: {
				numeric,
				minValue: minValue(1),
				maxValue: maxValue(99999)
			}
		}
	},
	computed: {
		getTitleIcon () {
			let icon = 'person'
			if (this.subscriber.is_pbx_group) {
				icon = 'group'
			} else if (this.subscriber.is_pbx_pilot) {
				icon = 'person_outline'
			}
			return icon
		},
		hasMaxQueueLengthChanged () {
			return this.callQueue.max_queue_length !== this.changes.max_queue_length
		},
		hasQueueWrapUpTimeChanged () {
			return this.callQueue.queue_wrap_up_time !== this.changes.queue_wrap_up_time
		},
		queueMaxLengthErrorMessage () {
			if (!this.$v.changes.max_queue_length.numeric) {
				return this.$t('validationErrors.numeric', {
					field: this.$t('pbxConfig.queueLength')
				})
			} else if (!this.$v.changes.max_queue_length.minValue) {
				return this.$t('validationErrors.minValueSecond', {
					field: this.$t('pbxConfig.queueLength'),
					minValue: this.$v.changes.max_queue_length.$params.minValue.min
				})
			} else if (!this.$v.changes.max_queue_length.maxValue) {
				return this.$t('validationErrors.maxValueSecond', {
					field: this.$t('pbxConfig.queueLength'),
					maxValue: this.$v.changes.max_queue_length.$params.maxValue.max
				})
			} else {
				return ''
			}
		},
		queueWrapUpTimeErrorMessage () {
			if (!this.$v.changes.queue_wrap_up_time.numeric) {
				return this.$t('validationErrors.numeric', {
					field: this.$t('pbxConfig.wrapUpTime')
				})
			} else if (!this.$v.changes.queue_wrap_up_time.minValue) {
				return this.$t('validationErrors.minValueSecond', {
					field: this.$t('pbxConfig.wrapUpTime'),
					minValue: this.$v.changes.queue_wrap_up_time.$params.minValue.min
				})
			} else if (!this.$v.changes.queue_wrap_up_time.maxValue) {
				return this.$t('validationErrors.maxValueSecond', {
					field: this.$t('pbxConfig.wrapUpTime'),
					maxValue: this.$v.changes.queue_wrap_up_time.$params.maxValue.max
				})
			} else {
				return ''
			}
		}
	},
	watch: {
		callQueue () {
			this.changes = this.getDefaultData()
		}
	},
	methods: {
		remove () {
			if (this.$refs.listItem) {
				this.$refs.listItem.closePopoverMenu()
			}
			this.$emit('remove', this.callQueue.id)
		},
		toggle () {
			if (this.expanded) {
				this.$emit('collapse')
			} else {
				this.$emit('expand')
			}
		},
		resetMaxQueueLength () {
			this.changes.max_queue_length = this.getDefaultData().max_queue_length
		},
		resetQueueWrapUpTime () {
			this.changes.queue_wrap_up_time = this.getDefaultData().queue_wrap_up_time
		},
		getDefaultData () {
			return {
				max_queue_length: this.callQueue.max_queue_length || this.defaultMaxQueueLength,
				queue_wrap_up_time: this.callQueue.queue_wrap_up_time || this.defaultQueueWrapUpTime
			}
		},
		save () {
			if (this.hasMaxQueueLengthChanged && !this.$v.changes.max_queue_length.$error) {
				this.$emit('save-max-queue-length', {
					callQueueId: this.callQueue.id,
					maxQueueLength: this.changes.max_queue_length
				})
			}
			if (this.hasQueueWrapUpTimeChanged && !this.$v.changes.queue_wrap_up_time.$error) {
				this.$emit('save-queue-wrap-up-time', {
					callQueueId: this.callQueue.id,
					queueWrapUpTime: this.changes.queue_wrap_up_time
				})
			}
		}
	}
}
</script>
