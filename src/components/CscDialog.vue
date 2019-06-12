<template>
    <q-modal
        ref="modal"
        minimized
    >
        <div
            class="csc-dialog csc-share-dialog"
        >
            <div
                class="csc-dialog-title"
            >
                <q-icon
                    v-if="titleIcon"
                    :name="titleIcon"
                    size="24px"
                />
                <span
                    class="csc-dialog-title-text"
                >{{ title }}</span>
            </div>
            <div
                class="csc-dialog-content"
            >
                <slot
                    name="content"
                />
            </div>
            <div
                class="csc-dialog-actions row justify-end no-wrap"
            >
                <q-btn
                    icon="clear"
                    color="default"
                    flat
                    @click="cancel"
                >
                    {{ $t('buttons.cancel') }}
                </q-btn>
                <slot
                    name="actions"
                />
            </div>
        </div>
    </q-modal>
</template>

<script>
    import {
        QModal,
        QBtn,
        QIcon
    } from 'quasar-framework'
    export default {
        name: 'csc-dialog',
        data () {
            return {

            }
        },
        mounted() {
            if(this.opened) {
                this.open();
            }
        },
        props: [
            'title',
            'titleIcon',
            'opened'
        ],
        components: {
            QModal,
            QBtn,
            QIcon
        },
        watch: {
            opened(opened) {
                if(opened) {
                    this.open();
                }
                else {
                    this.close();
                }
            }
        },
        methods: {
            open() {
                this.$refs.modal.open();
            },
            close() {
                this.$refs.modal.close();
            },
            cancel() {
                this.close();
                this.$emit('cancel');
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../themes/quasar.variables.styl'
    .csc-dialog
        max-width 480px
        background-color $body-background
        .csc-dialog-title
            text-transform uppercase
            font-size 14px
            line-height 14px
            padding $flex-gutter-sm
            background-color $item-highlight-color
            .csc-dialog-title-text
                vertical-align middle
            i
                margin-right $flex-gutter-xs
                vertical-align middle
        .csc-dialog-content
            padding $flex-gutter-md
        .csc-dialog-actions
            padding $flex-gutter-sm
</style>
