<template>
    <csc-dialog
        ref="dialogComp"
        :title="$t('conferencing.shareDialogTitle')"
        :titleIcon="'link'"
    >
        <div
            slot="content"
        >
            <q-input
                ref="conferenceUrlInput"
                :value="conferenceUrl"
                dark
                readonly
                @focus="selectConferenceUrl"
            />
        </div>
        <q-btn
            slot="actions"
            color="primary"
            flat
            icon="link"
            @click="copy"
        >
            {{ $t('conferencing.copyLinkButtonLabel') }}
        </q-btn>
    </csc-dialog>
</template>

<script>
    import {
        QBtn,
        QInput
    } from 'quasar-framework'
    import CscDialog from '../../CscDialog'
    export default {
        name: 'csc-share-conference-dialog',
        data () {
            return {
            }
        },
        props: [
            'conferenceUrl'
        ],
        components: {
            QBtn,
            QInput,
            CscDialog
        },
        mounted() {
            this.selectConferenceUrl();
        },
        methods: {
            open() {
                this.$refs.dialogComp.open();
                this.$nextTick(()=>{
                    this.$refs.conferenceUrlInput.focus();
                });
            },
            close() {
                this.$refs.dialogComp.close();
            },
            copy() {
                this.$refs.conferenceUrlInput.select();
                document.execCommand('copy');
                this.close();
            },
            selectConferenceUrl() {
                this.$refs.conferenceUrlInput.select();
            }
        },
        computed: {}
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
