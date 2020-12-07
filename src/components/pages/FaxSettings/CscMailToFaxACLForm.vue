<template>
	<div>
		<div class="row">
			<div
				class="col"
			>
				<csc-input-saveable
					v-model="data.from_email"
					icon="email"
					:label="$t('From email')"
					:disable="disabled"
					:readonly="loading"
					:error="$v.data.from_email.$error"
					:error-message="fromEmailErrorMessage"
					:value-changed="!isAddNewMode && data.from_email !== initialData.from_email"
					@input="$v.data.from_email.$touch"
					@keypress.space.prevent
					@keydown.space.prevent
					@keyup.space.prevent
					@undo="data.from_email = initialData.from_email"
					@save="updatePropertyData('from_email')"
				>
					<csc-tooltip>
						{{ $t('Accepted email address to allow mail2fax transmission.') }}
					</csc-tooltip>
				</csc-input-saveable>
				<csc-input-saveable
					v-model="data.received_from"
					:label="$t('Received from IP')"
					:disable="disabled"
					:readonly="loading"
					:value-changed="!isAddNewMode && data.received_from !== initialData.received_from"
					@keypress.space.prevent
					@keydown.space.prevent
					@keyup.space.prevent
					@undo="data.received_from = initialData.received_from"
					@save="updatePropertyData('received_from')"
				>
					<csc-tooltip>
						{{ $t('Allow mail2fax emails only to this IP (the IP or hostname is present in the &quot;Received&quot; header).') }}
					</csc-tooltip>
				</csc-input-saveable>
				<csc-input-saveable
					v-model="data.destination"
					:label="$t('Destination')"
					:disable="disabled"
					:readonly="loading"
					:value-changed="!isAddNewMode && data.destination !== initialData.destination"
					@keypress.space.prevent
					@keydown.space.prevent
					@keyup.space.prevent
					@undo="data.destination = initialData.destination"
					@save="updatePropertyData('destination')"
				>
					<csc-tooltip>
						{{ $t('Allow mail2fax destination only to this number.') }}
					</csc-tooltip>
				</csc-input-saveable>

				<q-toggle
					v-model="data.use_regex"
					:label="$t('Use RegExp')"
					:hint="$t('Enable regex matching for &quot;Received from IP&quot; and &quot;Destination&quot; fields.')"
					:disable="loading"
					@input="updatePropertyData('use_regex')"
				>
					<csc-tooltip>
						{{ $t('Enable regex matching for &quot;Received from IP&quot; and &quot;Destination&quot; fields.') }}
					</csc-tooltip>
				</q-toggle>
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
				icon="person"
				:loading="loading"
				:disable="$v.data.$invalid || loading"
				label="Create ACL"
				@click="save()"
			/>
		</div>
	</div>
</template>

<script>
import { email } from 'vuelidate/lib/validators'
import CscInputSaveable from 'components/form/CscInputSaveable'
import CscTooltip from 'components/CscTooltip'

export default {
	name: 'CscMailToFaxACLForm',
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
				destination: '',
				from_email: '',
				received_from: '',
				use_regex: false
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
			from_email: {
				email
			}
		}
	},
	computed: {
		fromEmailErrorMessage () {
			if (!this.$v.data.from_email.email) {
				return this.$t('validationErrors.email')
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
