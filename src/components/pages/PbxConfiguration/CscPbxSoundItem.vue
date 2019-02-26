<template>
    <q-item
        highlight
        class="csc-sound-item"
    >
        <q-item-main>
            <csc-sound-file-upload
                :ref="refName"
                icon="music_note"
                file-types=".wav,.mp3"
                :label="handleName"
                :value="fileLabel"
                width="full"
                :disabled="true"
                :hide-player="item.filename.length === 0"
                :no-float="true"
            />
        </q-item-main>
    </q-item>
</template>

<script>
    import {
        QList,
        QItem,
        QItemSide,
        QItemMain,
        QItemTile,
        QBtn,
        QIcon,
        QCollapsible,
        QCheckbox
    } from 'quasar-framework'
    import CscSoundFileUpload from '../../form/CscSoundFileUpload'
    export default {
        name: 'csc-pbx-sound-item',
        props: {
            item: Object,
            group: String
        },
        components: {
            CscSoundFileUpload,
            QList,
            QItem,
            QItemSide,
            QItemMain,
            QItemTile,
            QBtn,
            QIcon,
            QCollapsible,
            QCheckbox
        },
        data () {
            return {
                loop: this.hasLoop()
            }
        },
        mounted() {
        },
        computed: {
            handleName() {
                return `${this.group}: ${this.item.handle}`;
            },
            refName() {
                return `handle-${this.item.handle}`;
            },
            fileLabel() {
                let noSound = this.$t('pbxConfig.noSoundUploaded');
                return this.item.filename.length > 0 ? this.item.filename : noSound;
            }
        },
        methods: {
            hasLoop() {
                return !!this.item.loopplay;
            }
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';

    .csc-sound-item
        .q-icon
            padding-left 12px

        .csc-upload-field
            margin 0 0 10px 0

    .csc-item-expanded
        .csc-sound-item
            .q-item-main
                padding-top $flex-gutter-sm
                padding-bottom $flex-gutter-xs

</style>
