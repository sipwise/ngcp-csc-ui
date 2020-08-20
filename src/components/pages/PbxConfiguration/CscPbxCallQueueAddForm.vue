<template>
	<div>
		<q-select
			v-model="data.subscriber_id"
			emit-value
			map-options
			:disable="loading || subscriberOptionsLoading"
			:readonly="loading"
			:label="$t('pbxConfig.queueExtensionName')"
			:options="options"
		/>
		<q-input
			v-model="data.max_queue_length"
			:error="$v.data.max_queue_length.$error"
			:error-message="maxQueueLengthErrorMessage"
			:disable="loading"
			:readonly="loading"
			:label="$t('pbxConfig.queueLength')"
			default="3"
			@input="$v.data.max_queue_length.$touch"
		/>
		<q-input
			v-model="data.queue_wrap_up_time"
			:error="$v.data.queue_wrap_up_time.$error"
			:error-message="wrapUpTimeErrorMessage"
			:disable="loading"
			:readonly="loading"
			:label="$t('pbxConfig.wrapUpTime')"
			:suffix="$t('pbxConfig.seconds')"
			@input="$v.data.queue_wrap_up_time.$touch"
		/>
		<div
			class="csc-form-actions row justify-center"
		>
			<q-btn
				v-if="!loading"
				flat
				color="default"
				icon="clear"
				@click="cancel()"
			>
				{{ $t('buttons.cancel') }}
			</q-btn>
			<q-btn
				v-if="!loading"
				flat
				:disable="$v.data.$invalid"
				color="primary"
				icon="filter_none"
				@click="save()"
			>
				{{ $t('pbxConfig.createConfig') }}
			</q-btn>
		</div>
		<csc-object-spinner
			v-if="loading"
			:loading="loading"
		/>
	</div>
</template>

<script>
import {
	required,
	maxValue,
	minValue,
	numeric
} from 'vuelidate/lib/validators'
import CscObjectSpinner from '../../CscObjectSpinner'

export default {
	name: 'CscPbxCallQueueAddForm',
	components: {
		CscObjectSpinner
	},
	props: {
		options: {
			type: Array,
			default () {
				return []
			}
		},
		loading: {
			type: Boolean,
			default: false
		},
		subscriberOptionsLoading: {
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
	validations: {
		data: {
			subscriber_id: {
				required
			},
			max_queue_length: {
				numeric,
				minValue: minValue(1),
				maxValue: maxValue(3600)
			},
			queue_wrap_up_time: {
				numeric,
				minValue: minValue(1),
				maxValue: maxValue(3600)
			}
		}
	},
	data () {
		return {
			data: this.getDefaults()
		}
	},
	computed: {
		maxQueueLengthErrorMessage () {
			if (!this.$v.data.max_queue_length.numeric) {
				return this.$t('validationErrors.numeric', {
					field: this.$t('pbxConfig.queueLength')
				})
			} else if (!this.$v.data.max_queue_length.minValue) {
				return this.$t('validationErrors.minValueSecond', {
					field: this.$t('pbxConfig.queueLength'),
					minValue: this.$v.data.max_queue_length.$params.minValue.min
				})
			} else if (!this.$v.data.max_queue_length.maxValue) {
				return this.$t('validationErrors.maxValueSecond', {
					field: this.$t('pbxConfig.queueLength'),
					maxValue: this.$v.data.max_queue_length.$params.maxValue.max
				})
			} else {
				return ''
			}
		},
		wrapUpTimeErrorMessage () {
			if (!this.$v.data.queue_wrap_up_time.numeric) {
				return this.$t('validationErrors.numeric', {
					field: this.$t('pbxConfig.wrapUpTime')
				})
			} else if (!this.$v.data.queue_wrap_up_time.minValue) {
				return this.$t('validationErrors.minValueSecond', {
					field: this.$t('pbxConfig.wrapUpTime'),
					minValue: this.$v.data.queue_wrap_up_time.$params.minValue.min
				})
			} else if (!this.$v.data.queue_wrap_up_time.maxValue) {
				return this.$t('validationErrors.maxValueSecond', {
					field: this.$t('pbxConfig.wrapUpTime'),
					maxValue: this.$v.data.queue_wrap_up_time.$params.maxValue.max
				})
			} else {
				return ''
			}
		}
	},
	mounted () {
		this.$emit('ready')
	},
	methods: {
		getDefaults () {
			return {
				subscriber_id: null,
				max_queue_length: this.defaultMaxQueueLength,
				queue_wrap_up_time: this.defaultWrapUpTime
			}
		},
		cancel () {
			this.$emit('cancel')
		},
		save () {
			this.$emit('submit', this.data)
		},
		reset () {
			this.data = this.getDefaults()
			this.$v.$reset()
		}
	}
}
</script>
