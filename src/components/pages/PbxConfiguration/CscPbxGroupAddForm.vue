<template>
	<div>
		<div
			class="row justify-center q-gutter-lg q-mb-md"
		>
			<div
				class="col-3"
			>
				<q-input
					v-model="data.name"
					clearable
					autofocus
					hide-bottom-space
					:error="$v.data.name.$error"
					:error-message="groupNameErrorMessage"
					:disable="loading"
					:readonly="loading"
					:label="$t('Group Name')"
					data-cy="group-name"
					@input="$v.data.name.$touch"
				/>
				<q-input
					v-model="data.extension"
					clearable
					hide-bottom-space
					:error="$v.data.extension.$error"
					:error-message="extensionErrorMessage"
					:disable="loading"
					:readonly="loading"
					:label="$t('Extension')"
					:hint="getExtensionHint"
					data-cy="group-extension"
					@input="$v.data.extension.$touch"
				/>
				<q-select
					v-model="data.huntPolicy"
					radio
					emit-value
					map-options
					hide-bottom-space
					:disable="loading"
					:readonly="loading"
					:label="$t('Hunt Policy')"
					:options="huntPolicyOptions"
					data-cy="group-hunt-policy"
				/>
				<q-input
					v-model="data.huntTimeout"
					clearable
					hide-bottom-space
					:error="$v.data.huntTimeout.$error"
					:error-message="huntTimeoutErrorMessage"
					:disable="loading"
					:readonly="loading"
					:label="$t('Hunt Timeout')"
					:suffix="$t('seconds')"
					:min="1"
					:max="3600"
					data-cy="group-hunt-timeout"
					@input="$v.data.huntTimeout.$touch"
				/>
			</div>
			<div
				class="col-3"
			>
				<q-select
					v-model="data.aliasNumbers"
					multiple
					use-chips
					clearable
					emit-value
					map-options
					hide-bottom-space
					:disable="loading"
					:readonly="loading"
					:label="$t('Alias Numbers')"
					:options="aliasNumberOptions"
					data-cy="group-alias-numbers"
				/>
				<q-select
					v-model="data.seats"
					multiple
					use-chips
					clearable
					emit-value
					map-options
					hide-bottom-space
					:disable="loading"
					:readonly="loading"
					:label="$t('Seats')"
					:options="seatOptions"
					data-cy="group-seats"
				/>
				<q-select
					v-model="data.soundSet"
					radio
					emit-value
					map-options
					hide-bottom-space
					:disable="loading"
					:readonly="loading"
					:label="$t('Sound Set')"
					:options="soundSetOptions"
					data-cy="group-sound-set"
				/>
			</div>
		</div>
		<div class="csc-form-actions row justify-center">
			<q-btn
				v-if="!loading"
				flat
				color="default"
				icon="clear"
				data-cy="group-btn-clear"
				@mousedown.native="cancel()"
			>
				{{ $t('Cancel') }}
			</q-btn>
			<q-btn
				v-if="!loading"
				flat
				color="primary"
				icon="group"
				:disable="$v.data.$invalid"
				data-cy="group-btn-save"
				@click="save()"
			>
				{{ $t('Create group') }}
			</q-btn>
		</div>
		<csc-object-spinner
			v-if="loading"
			:loading="loading"
		/>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
	required,
	minValue,
	maxValue,
	maxLength,
	numeric,
	between
} from 'vuelidate/lib/validators'
import { inRange } from 'src/helpers/validation'
import CscObjectSpinner from '../../CscObjectSpinner'
export default {
	name: 'CscPbxGroupAddForm',
	components: {
		CscObjectSpinner
	},
	props: {
		huntPolicyOptions: {
			type: Array,
			default: () => []
		},
		aliasNumberOptions: {
			type: Array,
			default: () => []
		},
		seatOptions: {
			type: Array,
			default: () => []
		},
		soundSetOptions: {
			type: Array,
			default: () => []
		},
		loading: {
			type: Boolean,
			default: false
		}
	},
	validations: {
		data: {
			name: {
				required,
				maxLength: maxLength(64)
			},
			extension: {
				required,
				maxLength: maxLength(64),
				numeric,
				isInRange: function (value) {
					return inRange(value, this.getMinAllowedExtension, this.getMaxAllowedExtension, between)
				}
			},
			huntTimeout: {
				required,
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
		...mapGetters('pbx', [
			'getExtensionHint',
			'getMinAllowedExtension',
			'getMaxAllowedExtension'
		]),
		groupNameErrorMessage () {
			if (!this.$v.data.name.required) {
				return this.$t('{field} is required', {
					field: this.$t('Group Name')
				})
			} else if (!this.$v.data.name.maxLength) {
				return this.$t('{field} must have at most {maxLength} letters', {
					field: this.$t('Group Name'),
					maxLength: this.$v.data.name.$params.maxLength.max
				})
			} else {
				return ''
			}
		},
		extensionErrorMessage () {
			if (!this.$v.data.extension.required) {
				return this.$t('{field} is required', {
					field: this.$t('Extension')
				})
			} else if (!this.$v.data.extension.maxLength) {
				return this.$t('{field} must have at most {maxLength} letters', {
					field: this.$t('Extension'),
					maxLength: this.$v.data.extension.$params.maxLength.max
				})
			} else if (!this.$v.data.extension.numeric) {
				return this.$t('{field} must consist of numeric characters only', {
					field: this.$t('Extension')
				})
			} else if (!this.$v.data.extension.isInRange) {
				return this.getExtensionHint
			} else {
				return ''
			}
		},
		huntTimeoutErrorMessage () {
			if (!this.$v.data.huntTimeout.required) {
				return this.$t('{field} is required', {
					field: this.$t('Hunt timeout')
				})
			} else if (!this.$v.data.huntTimeout.numeric) {
				return this.$t('{field} must consist of numeric characters only', {
					field: this.$t('Hunt timeout')
				})
			} else if (!this.$v.data.huntTimeout.minValue) {
				return this.$t('{field} must be at least {minValue} second', {
					field: this.$t('Hunt timeout'),
					minValue: this.$v.data.huntTimeout.$params.minValue.min
				})
			} else if (!this.$v.data.huntTimeout.maxValue) {
				return this.$t('{field} must be maximum of {maxValue} seconds', {
					field: this.$t('Hunt timeout'),
					maxValue: this.$v.data.huntTimeout.$params.maxValue.max
				})
			} else {
				return ''
			}
		},
		groupModel () {
			return {
				name: this.data.name,
				extension: this.data.extension,
				huntPolicy: this.data.huntPolicy,
				huntTimeout: this.data.huntTimeout,
				aliasNumbers: this.data.aliasNumbers,
				seats: this.data.seats,
				soundSet: this.data.soundSet
			}
		}
	},
	created () {
		if (this.defaultSoundSet) {
			this.soundSet = this.defaultSoundSet
		}
	},
	methods: {
		getDefaults () {
			return {
				name: '',
				extension: '',
				huntPolicy: 'serial',
				huntTimeout: 10,
				aliasNumbers: [],
				seats: [],
				soundSet: null
			}
		},
		cancel () {
			this.$emit('cancel')
		},
		save () {
			this.$emit('save', this.groupModel)
		},
		reset () {
			this.data = this.getDefaults()
			this.$v.$reset()
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-pbx-group-add-form
        position: relative
    .csc-pbx-group-add-form
        .q-field:last-child
            margin-bottom: 36px
</style>
