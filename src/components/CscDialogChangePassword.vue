<template>
    <csc-dialog
        ref="dialog"
        title-icon="vpn_key"
        :title="$t('Change login password')"
    >
        <template
            v-slot:actions
        >
            <q-btn
                icon="check"
                :label="$t('Confirm')"
                :disable="!ready"
                unelevated
                text-color="dark"
                color="primary"
                @click="okEvent"
            />
        </template>
        <csc-input-password-retype
            v-model="passwordRetype"
            dense
            @validation-failed="ready=false"
            @validation-succeeded="ready=true"
        />
    </csc-dialog>
</template>

<script>
import CscInputPasswordRetype from 'components/form/CscInputPasswordRetype'
import CscDialog from 'components/CscDialog'
export default {
    name: 'CscDialogChangePassword',
    components: {
        CscDialog,
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
        okEvent () {
            if (this.ready) {
                this.$emit('ok', this.passwordRetype.password)
                this.hide()
            }
        }
    }
}
</script>
