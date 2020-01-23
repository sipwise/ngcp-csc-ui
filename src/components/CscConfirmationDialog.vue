<template>
    <csc-dialog
        ref="dialogComp"
        :title="title"
        :titleIcon="titleIcon"
        :opened="opened"
    >
        <div
            slot="content"
        >
            {{ message }}
        </div>
        <q-btn
            slot="actions"
            icon="exit_to_app"
            color="primary"
            id="dialog-confirm-btn"
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
