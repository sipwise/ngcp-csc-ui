<template>
    <csc-dialog
        ref="dialogComp"
        :title="title"
        :titleIcon="titleIcon"
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
            {{ $t('buttons.remove') }}
        </q-btn>
    </csc-dialog>
</template>

<script>
    import {
        QBtn
    } from 'quasar-framework'
    import CscDialog from './CscDialog'
    export default {
        name: 'csc-remove-dialog',
        data () {
            return {
            }
        },
        props: [
            'title',
            'titleIcon',
            'message',
            'opened'
        ],
        components: {
            QBtn,
            CscDialog
        },
        methods: {
            open() {
                this.$refs.dialogComp.open();
            },
            close() {
                this.$refs.dialogComp.close();
            },
            remove() {
                this.close();
                this.$emit('remove');
            },
            cancel() {
                this.$emit('cancel');
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
