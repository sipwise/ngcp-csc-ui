<template>
	<div>
		<div class="row">
			<div
				class="col-xs-12 col-md-6"
			>
				<csc-input-saveable
					v-model="data.destination"
					icon="email"
					:label="$t('Destination Email')"
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
					:label="$t('File Type')"
					:options="fileTypeOptions"
					@input="updatePropertyData('filetype')"
				/>
			</div>
			<div
				class="col-xs-12 col-md-6"
			>
				<q-toggle
					v-model="data.incoming"
					:label="$t('Deliver Incoming Faxes')"
					:disable="loading"
					@input="updatePropertyData('incoming')"
				/>
				<q-toggle
					v-model="data.outgoing"
					:label="$t('Deliver Outgoing Faxes')"
					:disable="loading"
					@input="updatePropertyData('outgoing')"
				/>
				<q-toggle
					v-model="data.status"
					:label="$t('Receive Reports')"
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
				:label="$t('Cancel')"
				@click="cancel()"
			/>
			<q-btn
				flat
				color="primary"
				icon="done"
				:loading="loading"
				:disable="$v.data.$invalid || loading"
				:label="$t('Create destination')"
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
				return this.$t('{field} is required', {
					field: this.$t('Destination Email')
				})
			} else if (!this.$v.data.destination.email) {
				return this.$t('Input a valid email address')
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
