<template>
	<csc-dialog
		:value="value"
		:loading="loading"
		title-icon="vpn_key"
		title="Change password"
		ref="dialog"
		@input="$emit('input')"
		class="csc-pbx-password-dialog"
	>
		<div
			slot="content"
		>
			<csc-change-password-form
				ref="changePasswordForm"
				:loading="loading"
				@validation-succeeded="validationSucceeded"
			/>
		</div>
		<div
			slot="actions"
		>
			<q-btn
				icon="check"
				unelevated
				color="primary"
				:disable="loading"
				:loading="loading"
				@click="$refs.changePasswordForm.submit()"
			>
				{{ $t('buttons.save') }}
			</q-btn>
		</div>
	</csc-dialog>
</template>
<script>
import {
	QBtn
} from 'quasar-framework'
import CscChangePasswordForm from './form/CscChangePasswordForm'
import CscDialog from './CscDialog'
export default {
	name: 'csc-change-password-dialog',
	components: {
		CscDialog,
		CscChangePasswordForm,
		QBtn
	},
	props: {
		value: {
			type: Boolean,
			default: false
		},
		loading: {
			type: Boolean,
			default: false
		}
	},
	methods: {
		validationSucceeded (payload) {
			this.$emit('change-password', payload)
		},
		open(){
			this.$refs.dialog.open();
			this.$refs.changePasswordForm.resetForm();
		},
		close(){
			this.$refs.dialog.close();
		}
	}
}
</script>
<style lang="stylus" rel="stylesheet/stylus">
	.csc-pbx-password-dialog
		.csc-dialog-actions,
		.csc-dialog-content
			padding 15px
			.q-input
				width 100%
				min-width 270px
			.q-if:before,
			.q-icon
				color white
			.Password__strength-meter:after,
			.Password__strength-meter:before
				border-color #3b3440
			.Password
				width 100%
				margin 20px 0px 30px
</style>
