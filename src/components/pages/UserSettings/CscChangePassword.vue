<template>
	<div>
		<q-slide-transition>
			<div
				v-if="!inputEnabled"
			>
				<q-btn
					icon="lock"
					flat
					color="primary"
					:label="$t('userSettings.changePassword')"
					@click="enableInput"
				/>
			</div>
		</q-slide-transition>
		<q-slide-transition>
			<div
				v-if="inputEnabled"
			>
				<div
					class="q-mb-md"
				>
					<q-input
						v-model.trim="newPassword"
						type="password"
						clearable
						:label="$t('userSettings.newPasswordLabel')"
					>
						<template
							v-slot:prepend
						>
							<q-icon
								name="lock"
							/>
						</template>
					</q-input>
					<q-input
						v-model.trim="newPasswordRetyped"
						type="password"
						clearable
						:label="$t('userSettings.newPasswordRetypedLabel')"
					>
						<template
							v-slot:prepend
						>
							<q-icon
								name="lock"
							/>
						</template>
					</q-input>
				</div>
				<div
					class="row justify-start"
				>
					<q-btn
						flat
						color="default"
						icon="clear"
						@click="cancel"
					>
						{{ $t('buttons.cancel') }}
					</q-btn>
					<q-btn
						flat
						color="primary"
						icon="done"
						:disable="!isValid"
						@click="openConfirmDialog"
					>
						{{ $t('userSettings.saveNewPassword') }}
					</q-btn>
				</div>
			</div>
		</q-slide-transition>
		<csc-object-spinner
			v-if="loading"
			:loading="loading"
		/>
	</div>
</template>

<script>
import CscObjectSpinner from '../../CscObjectSpinner'

export default {
	name: 'CscChangePassword',
	components: {
		CscObjectSpinner
	},
	props: {
		subscriber: {
			type: Object,
			default: null
		},
		loading: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			inputEnabled: false,
			newPassword: '',
			newPasswordRetyped: ''
		}
	},
	computed: {
		isValid () {
			return this.newPassword !== '' && this.newPassword === this.newPasswordRetyped
		}
	},
	watch: {
	},
	mounted () {
	},
	methods: {
		enableInput () {
			this.inputEnabled = true
			this.reset()
		},
		cancel () {
			this.inputEnabled = false
			this.reset()
		},
		reset () {
			this.newPassword = ''
			this.newPasswordRetyped = ''
		},
		submit () {
			this.$emit('change', this.newPassword)
		},
		openConfirmDialog () {
			this.$q.dialog({
				title: this.$t('userSettings.changePasswordDialogTitle'),
				message: this.$t('userSettings.changePasswordDialogText'),
				color: 'primary',
				cancel: true,
				persistent: true
			}).onOk(data => {
				this.submit()
			})
		}
	}
}
</script>
