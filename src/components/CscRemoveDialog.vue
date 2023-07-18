<template>
    <csc-dialog
        ref="dialogComp"
        :title="title"
        :title-icon="titleIcon"
        v-bind="$attrs"
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
                v-close-popup
                icon="delete"
                data-cy="csc-dialog-delete"
                color="negative"
                flat
                @click="remove"
            >
                {{ $t('Remove') }}
            </q-btn>
        </template>
    </csc-dialog>
</template>

<script>
import CscDialog from './CscDialog'
export default {
    name: 'CscRemoveDialog',
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
        message: {
            type: String,
            default: ''
        },
        opened: {
            type: Boolean,
            default: false
        }
    },
    emits: ['ok', 'remove', 'cancel'],
    data () {
        return {
        }
    },
    methods: {
        show () {
            this.$refs.dialogComp.show()
        },
        hide () {
            this.$refs.dialogComp.hide()
        },
        remove () {
            this.$emit('remove')
            this.$emit('ok')
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">
</style>
