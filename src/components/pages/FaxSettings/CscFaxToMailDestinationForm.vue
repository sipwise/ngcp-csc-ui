<template>
	<div>
		<div class="row">
			<div
				class="col-xs-12 col-md-6"
			>
				<csc-input-saveable
					v-model="data.destination"
					icon="email"
					:label="$t('faxSettings.destinationEmail')"
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
				/>
				<q-select
					v-model="data.filetype"
					dense
					emit-value
					map-options
					:disable="loading"
					:readonly="loading"
					:label="$t('faxSettings.fileType')"
					:options="fileTypeOptions"
					@input="updatePropertyData('filetype')"
				/>
			</div>
			<div
				class="col-xs-12 col-md-6"
			>
				<q-toggle
					v-model="data.incoming"
					:label="$t('faxSettings.deliverIncomingFaxes')"
					:disable="loading"
					@input="updatePropertyData('incoming')"
				/>
				<q-toggle
					v-model="data.outgoing"
					:label="$t('faxSettings.deliverOutgoingFaxes')"
					:disable="loading"
					@input="updatePropertyData('outgoing')"
				/>
				<q-toggle
					v-model="data.status"
					:label="$t('faxSettings.receiveReports')"
					:disable="loading"
					@input="updatePropertyData('status')"
				/>
			</div>
		</div>
		<div
			v-if="isAddNewMode"
			class="row justify-center"
		>
			<q-btn
				flat
				color="default"
				icon="clear"
				:disable="loading"
				:label="$t('buttons.cancel')"
				@click="cancel()"
			/>
			<q-btn
				flat
				color="primary"
				icon="done"
				:loading="loading"
				:disable="$v.data.$invalid || loading"
				:label="$t('faxSettings.createDestination')"
				@click="save()"
			/>
		</div>
	</div>
</template>

<script>
import { email, required } from 'vuelidate/lib/validators'
import CscInputSaveable from 'components/form/CscInputSaveable'

export default {
	name: 'CscFaxToMailDestinationForm',
	components: {
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
				destination: '',
				filetype: 'TIFF',
				incoming: true,
				outgoing: true,
				status: true
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
				return this.$t('validationErrors.fieldRequired', {
					field: this.$t('faxSettings.destinationEmail')
				})
			} else if (!this.$v.data.destination.email) {
				return this.$t('validationErrors.email')
			} else {
				return ''
			}
		},
		fileTypeOptions () {
			return ['TIFF', 'PS', 'PDF', 'PDF14']
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
