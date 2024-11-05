<template>
    <csc-dialog
        ref="dialog"
        :value="value"
        :loading="loading"
        title-icon="vpn_key"
        :title="$t('Change password')"
        class="csc-pbx-password-dialog"
        @input="$emit('input')"
        @hide="$emit('dialog-closed')"
    >
        <template
            #content
        >
            <csc-change-password-form
                ref="changePasswordForm"
                :loading="loading"
                @validation-succeeded="validationSucceeded"
            />
        </template>
        <template
            #actions
        >
            <q-btn
                icon="check"
                unelevated
                color="primary"
                :disable="loading"
                :loading="loading"
                @click="$refs.changePasswordForm.submit()"
            >
                {{ $t('Save') }}
            </q-btn>
        </template>
    </csc-dialog>
</template>
<script>
import CscDialog from 'components/CscDialog'
import CscChangePasswordForm from 'components/form/CscChangePasswordForm'

export default {
    name: 'CscChangePasswordDialog',
    components: {
        CscDialog,
        CscChangePasswordForm
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
    emits: ['change-password', 'dialog-closed', 'input'],
    methods: {
        validationSucceeded (payload) {
            this.$emit('change-password', payload)
        },
        open () {
            this.$refs.dialog.show()
            this.$refs.changePasswordForm.resetForm()
        },
        close () {
            this.$refs.dialog.hide()
        }
    }
}
</script>
<style lang="sass" rel="stylesheet/sass">
    .csc-pbx-password-dialog
        .csc-dialog-actions,
        .csc-dialog-content
            padding: 15px
            .q-input
                width: 100%
                min-width: 270px
            .q-if:before,
            .q-icon
                color: white
            .Password__strength-meter:after,
            .Password__strength-meter:before
                border-color: #3b3440
            .Password
                width: 100%
                margin: 20px 0px 30px
</style>
