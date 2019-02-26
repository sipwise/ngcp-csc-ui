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
                :hide-player="!file"
            >
                <div
                    slot="additional"
                >
                    <q-toggle
                        :class="loopClasses"
                        :label="$t('pbxConfig.playingInLoop')"
                        v-model="loop"
                        :disable="true"
                        checked-icon="loop"
                        unchecked-icon="loop"
                    />
                    <q-tooltip>
                        {{ loopTooltipLabel }}
                    </q-tooltip>
                </div>
            </csc-sound-file-upload>
        </q-item-main>
    </q-item>
</template>

<script>
    import {
        QList,
        QItem,
        QItemMain,
        QToggle,
        QTooltip
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
            QToggle,
            QTooltip
        },
        data () {
            return {
                loop: this.hasLoop(),
                file: this.hasFile()
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
            },
            loopTooltipLabel() {
                return this.loop ?
                    this.$t('pbxConfig.dontPlayInLoop') :
                    this.$t('pbxConfig.playInLoop');
            }
        },
        methods: {
            hasLoop() {
                return !!this.item.loopplay;
            },
            hasFile() {
                return this.item.filename.length > 0;
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

</style>
