<template>
	<div>
		<div
			class="row justify-center q-gutter-x-sm q-pt-sm"
		>
			<div
				class="col col-3"
			>
				<csc-input
					v-model="data.name"
					clearable
					autofocus
					dense
					hide-bottom-space
					:error="$v.data.name.$error"
					:error-message="seatNameErrorMessage"
					:disable="loading"
					:readonly="loading"
					:label="$t('pbxConfig.name')"
					@input="$v.data.name.$touch"
				>
					<template
						v-slot:prepend
					>
						<q-icon
							name="person"
						/>
					</template>
				</csc-input>
				<csc-input
					v-model="data.extension"
					clearable
					dense
					hide-bottom-space
					:error="$v.data.extension.$error"
					:error-message="extensionErrorMessage"
					:disable="loading"
					:readonly="loading"
					:label="$t('pbxConfig.extension')"
					@input="$v.data.extension.$touch"
				>
					<template
						v-slot:prepend
					>
						<q-icon
							name="call"
						/>
					</template>
				</csc-input>
				<csc-input-password-retype
					v-model="data.password"
					:disable="loading"
					dense
				/>
			</div>
			<div
				class="col col-3"
			>
				<q-select
					v-model="data.aliasNumbers"
					clearable
					dense
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
					dense
					multiple
					use-chips
					emit-value
					map-options
					:disable="loading"
					:readonly="loading"
					:label="$t('pbxConfig.groups')"
					:options="groupOptions"
				>
					<template
						v-slot:prepend
					>
						<q-icon
							name="group"
						/>
					</template>
				</q-select>
				<q-select
					v-model="data.soundSet"
					radio
					dense
					emit-value
					map-options
					:disable="loading"
					:readonly="loading"
					:label="$t('pbxConfig.soundSet')"
					:options="soundSetOptions"
				>
					<template
						v-slot:prepend
					>
						<q-icon
							name="queue_music"
						/>
					</template>
				</q-select>
				<q-toggle
					v-model="data.clirIntrapbx"
					:label="$t('pbxConfig.toggleIntraPbx')"
					:disable="loading"
					class="q-pa-md"
					dense
				/>
			</div>
		</div>
		<div
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
				:label="$t('pbxConfig.createSeat')"
				@click="save()"
			/>
		</div>
	</div>
</template>

<script>
import {
	required,
	maxLength,
	numeric
} from 'vuelidate/lib/validators'
import CscInput from 'components/form/CscInput'
import CscInputPasswordRetype from 'components/form/CscInputPasswordRetype'
export default {
	name: 'CscPbxSeatAddForm',
	components: {
		CscInputPasswordRetype,
		CscInput
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
				password: {
					password: '',
					passwordRetype: ''
				},
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
			this.$emit('save', {
				name: this.data.name,
				extension: this.data.extension,
				webPassword: this.data.password.password,
				aliasNumbers: this.data.aliasNumbers,
				groups: this.data.groups,
				soundSet: this.data.soundSet,
				clirIntrapbx: this.data.clirIntrapbx
			})
		},
		reset () {
			this.data = this.getDefaults()
			this.$v.$reset()
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
