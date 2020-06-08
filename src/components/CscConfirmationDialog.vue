<template>
    <csc-dialog
        ref="dialogComp"
        :title="title"
        :titleIcon="titleIcon"
        :opened="opened"
        @close="onClose()"
    >
        <div
            slot="content"
        >
            {{ message }}
        </div>
        <q-btn
            slot="actions"
            :icon="titleIcon"
            color="primary"
            flat
            @click="confirm"
        >
            {{ $t('buttons.confirm') }}
        </q-btn>
    </csc-dialog>
</template>

<script>
    import {
        QBtn
    } from 'quasar-framework'
    import CscDialog from './CscDialog'
    export default {
        name: 'csc-confirm-dialog',
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
            onClose(){
                this.$emit('closed');
            },
            cancel() {
                this.close();
                this.$emit('cancel');
            },
            confirm() {
                this.close();
                this.$emit('confirm');
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
