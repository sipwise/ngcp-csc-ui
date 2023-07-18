<template>
    <csc-dialog
        ref="dialogComp"
        :title="title"
        :title-icon="titleIcon"
        :title-icon-color="titleIconColor"
        :opened="opened"
        @close="onClose()"
    >
        <template
            #content
        >
            {{ message }}
        </template>
        <template
            #actions
        >
            <q-btn
                :icon="titleIcon"
                :color="color"
                flat
                @click="confirm"
            >
                {{ $t('Confirm') }}
            </q-btn>
        </template>
    </csc-dialog>
</template>

<script>
import CscDialog from './CscDialog'

export default {
    name: 'CscConfirmDialog',
    components: {
        CscDialog
    },
    props: {
        title: {
            type: String,
            default: ''
        },
        titleIcon: {
            type: String,
            default: ''
        },
        titleIconColor: {
            type: String,
            default: 'primary'
        },
        message: {
            type: String,
            default: ''
        },
        opened: {
            type: Boolean,
            default: false
        },
        color: {
            type: String,
            default: 'primary'
        }
    },
    emits: ['confirm', 'cancel', 'closed'],
    data () {
        return {
        }
    },
    methods: {
        open () {
            this.$refs.dialogComp.show()
        },
        close () {
            this.$refs.dialogComp.hide()
        },
        onClose () {
            this.$emit('closed')
        },
        cancel () {
            this.close()
            this.$emit('cancel')
        },
        confirm () {
            this.close()
            this.$emit('confirm')
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">
</style>
