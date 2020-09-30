<template>
	<csc-dialog-base
		ref="dialog"
		icon="vpn_key"
		title="Change Password"
		:ready="ready"
		v-bind="$attrs"
		v-on="$listeners"
		@hide="$emit('hide', $event)"
		@ok="ok"
	>
		<template
			v-slot:title
		>
			Change Password
		</template>
		<csc-input-password-retype
			v-model="passwordRetype"
			dense
			@validation-failed="ready=false"
			@validation-succeeded="ready=true"
		/>
	</csc-dialog-base>
</template>

<script>
import CscInputPasswordRetype from 'components/form/CscInputPasswordRetype'
import CscDialogBase from 'components/CscDialogBase'
export default {
	name: 'CscDialogChangePassword',
	components: {
		CscDialogBase,
		CscInputPasswordRetype
	},
	data () {
		return {
			ready: false,
			passwordRetype: {
				password: '',
				passwordRetype: ''
			}
		}
	},
	methods: {
		show () {
			this.$refs.dialog.show()
		},
		hide () {
			this.$refs.dialog.hide()
		},
		ok () {
			if (this.ready) {
				this.$emit('confirmed', this.passwordRetype.password)
			}
		}
	}
}
</script>
