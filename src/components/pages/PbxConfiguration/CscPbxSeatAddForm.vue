<template>
	<div>
		<div
			class="row justify-center q-gutter-lg q-mb-md"
		>
			<div
				class="col col-3"
			>
				<q-input
					v-model="data.name"
					clearable
					autofocus
					hide-bottom-space
					:error="$v.data.name.$error"
					:error-message="seatNameErrorMessage"
					:disable="loading"
					:readonly="loading"
					:label="$t('pbxConfig.name')"
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
					:label="$t('pbxConfig.extension')"
					@input="$v.data.extension.$touch"
				/>
				<csc-change-password-form
					ref="changePasswordForm"
					:no-submit="true"
					@validation-succeeded="webPassValidationSucceeded"
				/>
			</div>
			<div
				class="col col-3"
			>
				<q-select
					v-model="data.aliasNumbers"
					clearable
					multiple
					use-chips
					emit-value
					map-options
					:disable="loading"
					:readonly="loading"
					:label="$t('pbxConfig.aliasNumbers')"
					:options="aliasNumberOptions"
				/>
				<q-select
					v-model="data.groups"
					clearable
					multiple
					use-chips
					emit-value
					map-options
					:disable="loading"
					:readonly="loading"
					:label="$t('pbxConfig.groups')"
					:options="groupOptions"
				/>
				<q-select
					v-model="data.soundSet"
					radio
					emit-value
					map-options
					:disable="loading"
					:readonly="loading"
					:label="$t('pbxConfig.soundSet')"
					:options="soundSetOptions"
				/>
				<q-toggle
					v-model="data.clirIntrapbx"
					:label="$t('pbxConfig.toggleIntraPbx')"
					:disable="loading"
					class="q-pa-md"
				/>
			</div>
		</div>
		<div
			class="row justify-center"
		>
			<div
				class="col col-4"
			>
				<q-btn
					v-if="!loading"
					flat
					color="default"
					icon="clear"
					:label="$t('buttons.cancel')"
					@click="cancel()"
				/>
				<q-btn
					v-if="!loading"
					flat
					color="primary"
					icon="person"
					:disable="$v.data.$invalid"
					:label="$t('pbxConfig.createSeat')"
					@click="save()"
				/>
				<csc-object-spinner
					v-if="loading"
					:loading="loading"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import {
	required,
	maxLength,
	numeric
} from 'vuelidate/lib/validators'
import CscObjectSpinner from '../../CscObjectSpinner'
import CscChangePasswordForm from '../../form/CscChangePasswordForm'
export default {
	name: 'CscPbxSeatAddForm',
	components: {
		CscObjectSpinner,
		CscChangePasswordForm
	},
	props: {
		loading: {
			type: Boolean,
			default: false
		},
		aliasNumberOptions: {
			type: Array,
			default: () => []
		},
		groupOptions: {
			type: Array,
			default: () => []
		},
		soundSetOptions: {
			type: Array,
			default: () => []
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
				numeric,
				maxLength: maxLength(64)
			},
			webPassword: {
				maxLength: maxLength(64)
			}
		}
	},
	data () {
		return {
			data: this.getDefaults()
		}
	},
	computed: {
		seatNameErrorMessage () {
			if (!this.$v.data.name.required) {
				return this.$t('validationErrors.fieldRequired', {
					field: this.$t('pbxConfig.seatName')
				})
			} else if (!this.$v.data.name.maxLength) {
				return this.$t('validationErrors.maxLength', {
					field: this.$t('pbxConfig.seatName'),
					maxLength: this.$v.data.name.$params.maxLength.max
				})
			} else {
				return ''
			}
		},
		extensionErrorMessage () {
			if (!this.$v.data.extension.required) {
				return this.$t('validationErrors.fieldRequired', {
					field: this.$t('pbxConfig.extension')
				})
			} else if (!this.$v.data.extension.maxLength) {
				return this.$t('validationErrors.maxLength', {
					field: this.$t('pbxConfig.extension'),
					maxLength: this.$v.data.extension.$params.maxLength.max
				})
			} else if (!this.$v.data.extension.numeric) {
				return this.$t('validationErrors.numeric', {
					field: this.$t('pbxConfig.extension')
				})
			} else {
				return ''
			}
		},
		webPasswordErrorMessage () {
			if (!this.$v.data.webPassword.required) {
				return this.$t('validationErrors.fieldRequired', {
					field: this.$t('pbxConfig.webPassword')
				})
			} else if (!this.$v.data.webPassword.maxLength) {
				return this.$t('validationErrors.maxLength', {
					field: this.$t('pbxConfig.webPassword'),
					maxLength: this.$v.data.webPassword.$params.maxLength.max
				})
			} else {
				return ''
			}
		},
		seatModel () {
			return {
				name: this.data.name,
				extension: this.data.extension,
				webPassword: this.data.webPassword,
				aliasNumbers: this.data.aliasNumbers,
				groups: this.data.groups,
				soundSet: this.data.soundSet,
				clirIntrapbx: this.data.clirIntrapbx
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
				webPassword: '',
				aliasNumbers: [],
				groups: [],
				soundSet: null,
				clirIntrapbx: false
			}
		},
		cancel () {
			this.$emit('cancel')
		},
		save () {
			this.$emit('save', this.seatModel)
			this.$refs.changePasswordForm.resetForm()
		},
		reset () {
			this.data = this.getDefaults()
			this.$v.$reset()
		},
		webPassValidationSucceeded (data) {
			this.data.webPassword = data.password
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
.Password__strength-meter
	margin-top 20px !important
.Password__strength-meter:after,
.Password__strength-meter:before
	border-color #3b3440 !important
.Password
	max-width 100%
</style>
