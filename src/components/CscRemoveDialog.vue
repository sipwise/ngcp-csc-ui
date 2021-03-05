<template>
    <csc-dialog
        ref="dialogComp"
        :title="title"
        :title-icon="titleIcon"
        :opened="opened"
        @cancel="cancel"
    >
        <div
            slot="content"
        >
            {{ message }}
        </div>
        <q-btn
            slot="actions"
            icon="delete"
            color="negative"
            flat
            @click="remove"
        >
            {{ $t('Remove') }}
        </q-btn>
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
    data () {
        return {
        }
    },
    methods: {
        show () {
            this.open()
        },
        open () {
            this.$refs.dialogComp.open()
        },
        close () {
            this.$refs.dialogComp.close()
        },
        remove () {
            this.close()
            this.$emit('remove')
            this.$emit('ok')
        },
        cancel () {
            this.$emit('cancel')
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
