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
                :disabled="true"
                :hide-player="item.filename.length === 0"
                :no-float="true"
            >
                <q-toggle
                    slot="additional"
                    :class="loopClasses"
                    label="Loopplay"
                    v-model="loop"
                    :disable="true"
                    checked-icon="loop"
                    unchecked-icon="loop"
                />
            </csc-sound-file-upload>
        </q-item-main>
    </q-item>
</template>

<script>
    import {
        QList,
        QItem,
        QItemMain,
        QToggle
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
            QItemMain,
            QToggle
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
            },
            loopClasses() {
                let classes = ['csc-additional'];
                if(this.loop) {
                    classes.push('csc-toggle-enabled');
                }
                else {
                    classes.push('csc-toggle-disabled');
                }
                return classes;
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

        .q-field-icon
            padding-left 12px

        .csc-upload-field
            margin 0 0 10px 0

    .csc-item-expanded
        .csc-sound-item
            .q-item-main
                padding-top $flex-gutter-sm
                padding-bottom $flex-gutter-xs

            .q-field-label
                color $light

            .q-option-label
                color $light

            .csc-additional
                padding-right $flex-gutter-lg

</style>
