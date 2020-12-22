<template>
	<div>
		<q-input
			v-model="formData.stationName"
			autofocus
			hide-bottom-space
			:disable="loading"
			:readonly="loading"
			:label="$t('Station name')"
			:error="$v.formData.stationName.$error"
			:error-message="stationNameErrorMessage"
			@input="$v.formData.stationName.$touch"
		/>
		<q-input
			v-model="formData.identifier"
			hide-bottom-space
			:disable="loading"
			:readonly="loading"
			:label="$t('MAC address')"
			:error="$v.formData.identifier.$error"
			:error-message="identifierErrorMessage"
			@input="$v.formData.identifier.$touch"
		/>
		<csc-pbx-model-select
			v-model="formData.profile"
			:profiles="profiles"
			:profile-map="profileMap"
			:has-reset-button="true"
			@opened="$emit('model-select-opened')"
			@input="selectedProfile"
			@reset="resetProfile"
		/>
		<div
			class="csc-form-actions row justify-center"
		>
			<q-btn
				flat
				color="default"
				icon="clear"
				:disable="loading"
				@click="cancel"
			>
				{{ $t('Cancel') }}
			</q-btn>
			<q-btn
				flat
				color="primary"
				icon="done"
				:disable="$v.formData.$invalid || formData.profile === null || loading"
				@click="submit"
			>
				{{ $t('Create device') }}
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
	maxLength
} from 'vuelidate/lib/validators'
import {
	customMacAddress
} from 'src/helpers/validation'
import CscPbxModelSelect from './CscPbxModelSelect'
import CscObjectSpinner from '../../CscObjectSpinner'
export default {
	name: 'CscPbxDeviceAddForm',
	components: {
		CscObjectSpinner,
		CscPbxModelSelect
	},
	props: {
		loading: {
			type: Boolean,
			default: false
		},
		profiles: {
			type: Array,
			default: undefined
		},
		profileMap: {
			type: Object,
			default: null
		},
		modelImageMap: {
			type: Object,
			default: null
		}
	},
	validations: {
		formData: {
			stationName: {
				required,
				maxLength: maxLength(64)
			},
			identifier: {
				required,
				customMacAddress
			}
		}
	},
	data () {
		return {
			formData: this.getDefaultFormData()
		}
	},
	computed: {
		stationNameErrorMessage () {
			if (!this.$v.formData.stationName.required) {
				return this.$t('{field} is required', {
					field: this.$t('Station name')
				})
			} else if (!this.$v.formData.stationName.maxLength) {
				return this.$t('{field} must have at most {maxLength} letters', {
					field: this.$t('Station name'),
					maxLength: this.$v.formData.stationName.$params.maxLength.max
				})
			} else {
				return ''
			}
		},
		identifierErrorMessage () {
			if (!this.$v.formData.identifier.required) {
				return this.$t('{field} is required', {
					field: this.$t('MAC address')
				})
			} else if (!this.$v.formData.identifier.customMacAddress) {
				return this.$t('Input a valid mac address')
			} else {
				return ''
			}
		}
	},
	methods: {
		getDefaultFormData () {
			return {
				stationName: '',
				identifier: '',
				profile: null
			}
		},
		cancel () {
			this.$emit('cancel')
		},
		submit () {
			this.$emit('submit', this.formData)
		},
		reset () {
			this.formData = this.getDefaultFormData()
		},
		selectedProfile (profileId) {
			this.formData.profile = profileId
		},
		resetProfile () {
			this.formData.profile = null
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .form-actions
        margin-top 16px
        margin-bottom 8px
</style>
