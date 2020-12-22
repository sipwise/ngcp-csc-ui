<template>
	<div class="csc-form">
		<csc-input-saveable
			v-model="data.destination"
			icon="email"
			:label="$t('Renew Notify Email')"
			:disable="disabled"
			:readonly="loading"
			:error="$v.data.destination.$error"
			:error-message="destinationErrorMessage"
			:value-changed="!isAddNewMode && data.destination !== initialData.destination"
			@input="$v.data.destination.$touch"
			@keypress.space.prevent
			@keydown.space.prevent
			@keyup.space.prevent
			@undo="data.destination = initialData.destination"
			@save="updatePropertyData('destination')"
		>
			<csc-tooltip>
				{{ $t('Destination email to send the secret key renew notification to.') }}
			</csc-tooltip>
		</csc-input-saveable>
		<div
			v-if="isAddNewMode"
			class="csc-form-actions row justify-center"
		>
			<q-btn
				flat
				color="default"
				icon="clear"
				:disable="loading"
				:label="$t('Cancel')"
				@click="cancel()"
			/>
			<q-btn
				flat
				color="primary"
				icon="done"
				:loading="loading"
				:disable="$v.data.$invalid || loading"
				:label="$t('Add email')"
				@click="save()"
			/>
		</div>
	</div>
</template>

<script>
import { email, required } from 'vuelidate/lib/validators'
import CscInputSaveable from 'components/form/CscInputSaveable'
import CscTooltip from 'components/CscTooltip'

export default {
	name: 'CscMailToFaxRenewNotifyEmailForm',
	components: {
		CscTooltip,
		CscInputSaveable
	},
	props: {
		loading: {
			type: Boolean,
			default: false
		},
		disabled: {
			type: Boolean,
			default: false
		},
		initialData: {
			type: Object,
			default: () => ({
				destination: ''
			})
		},
		isAddNewMode: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			data: this.getDefaults()
		}
	},
	validations: {
		data: {
			destination: {
				required,
				email
			}
		}
	},
	computed: {
		destinationErrorMessage () {
			if (!this.$v.data.destination.required) {
				return this.$t('{field} is required', {
					field: this.$t('Email')
				})
			} else if (!this.$v.data.destination.email) {
				return this.$t('Input a valid email address')
			} else {
				return ''
			}
		}
	},
	methods: {
		getDefaults () {
			return { ...this.initialData }
		},
		cancel () {
			this.$emit('cancel')
		},
		save () {
			this.$emit('save', {
				...this.data
			})
		},
		reset () {
			this.data = this.getDefaults()
			this.$v.$reset()
		},
		updatePropertyData (propertyName) {
			this.$emit('update-property', {
				name: propertyName,
				value: this.data[propertyName]
			})
		}
	}
}
</script>
