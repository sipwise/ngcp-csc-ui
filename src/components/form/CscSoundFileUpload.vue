<template>
    <q-field
        class="csc-upload-field"
        :icon="icon"
    >
        <q-input
            readonly
            :float-label="label"
            :value="inputValue"
            :after="inputButtons"
        />
        <input
            v-show="false"
            ref="fileUpload"
            type="file"
            @change="inputChange"
        />
        <div
            v-show="uploading"
            class="row no-wrap csc-upload-progress-field"
        >
            <q-chip
                square
                color="primary"
                class="upload-chip"
            >
                {{ `${progress}%` }}
            </q-chip>
            <q-progress
                stripe
                animate
                color="primary"
                :percentage="progress"
                class="upload-progress"
            />
        </div>
        <div
            class="csc-file-upload-actions"
        >
            <q-btn
                v-if="selectedFile != null"
                flat
                color="default"
                icon="clear"
                @click="cancel"
            >
                {{ $t('buttons.cancel') }}
            </q-btn>
            <q-btn
                flat
                v-if="selectedFile != null && !uploading"
                color="primary"
                icon="cloud_upload"
                @click="upload"
            >
                {{ $t('buttons.upload') }}
            </q-btn>
            <q-btn
                flat
                v-if="uploaded && selectedFile == null"
                color="primary"
                icon="undo"
                @click="undo"
            >
                {{ $t('buttons.resetDefaults') }}
            </q-btn>
        </div>
    </q-field>
</template>

<script>
    import {
        QInput,
        QField,
        QBtn,
        QChip,
        QProgress
    } from 'quasar-framework'
    export default {
        name: 'csc-sound-file-upload',
        components: {
            QInput,
            QField,
            QBtn,
            QChip,
            QProgress
        },
        props: [
            'icon',
            'label',
            'value',
            'uploading',
            'uploaded',
            'progress',
            'fileTypes'
        ],
        data () {
            return {
                selectedFile: null
            }
        },
        computed: {
            inputValue() {
                if(this.selectedFile === null) {
                    return this.value;
                }
                else {
                    return this.selectedFile.name;
                }
            },
            inputButtons() {
                let buttons = [];
                let self = this;
                buttons.push({
                        icon: 'folder',
                        error: false,
                        handler (event) {
                            event.stopPropagation();
                            self.$refs.fileUpload.click();
                        }
                    }
                );
                return buttons;
            }
        },
        methods: {
            inputChange(event) {
                this.selectedFile = event.target.files[0];
            },
            cancel() {
                this.selectedFile = null;
                this.$refs.fileUpload.value = null;
                if (this.uploading) {
                    this.abort();
                }
            },
            upload() {
                this.$emit('upload', this.selectedFile);
            },
            abort() {
                this.$emit('abort');
            },
            reset() {
                this.cancel();
            },
            undo() {
                this.$emit('reset');
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../themes/quasar.variables';

    .csc-file-upload-actions
        padding-top $flex-gutter-xs

    .csc-upload-field
        .q-field-icon
            color $primary

    .csc-upload-progress-field
        margin 10px 0 5px 0

        .upload-chip
            min-height 20px
            height 20px
            width 50px
            border-top-right-radius 0
            border-bottom-right-radius 0

        .upload-progress
            height 20px

</style>
