
<template>
    <div>
        <q-field class="csc-form-field upload-field">
            <label
                for="voicemail-file-upload"
                class="upload-label"
            >
                <div class="upload-label">
                    {{ $t('voicebox.label.busyGreeting') }}
                </div>
                <div
                    v-show="requesting"
                    class="row no-wrap progress-field"
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
                <div class="upload-filename">
                    {{ selectedFile }}
                </div>
                <span
                    v-show="selectedFile.length === 0"
                >
                    <slot name="extra-buttons" />
                </span>
                <q-btn
                    v-show="selectedFile.length > 0"
                    flat
                    color="negative"
                    icon="cancel"
                    @click="cancel"
                >
                    {{ $t('buttons.cancel') }}
                </q-btn>
                <q-btn
                    v-show="!requesting"
                    class="upload-button"
                    flat
                    dark
                    @click="$refs.upload.click()"
                    icon="folder"
                >
                    {{ $t('buttons.select') }}
                </q-btn>
                <q-btn
                    flat
                    v-show="selectedFile.length > 0 && !requesting"
                    color="primary"
                    icon="cloud_upload"
                    @click="upload"
                >
                    {{ $t('buttons.upload') }}
                </q-btn>
            </label>
            <input
                ref="upload"
                id="voicemail-file-upload"
                type="file"
                :accept="fileTypes"
                @change="processFile($event)"
            />
        </q-field>
    </div>
</template>

<script>
    import {
        QField,
        QInput,
        QBtn,
        QProgress,
        QChip
    } from 'quasar-framework'
    export default {
        name: 'csc-upload-file',
        props: [
            'progress',
            'requesting',
            'fileTypes'
        ],
        data () {
            return {
                selectedFile: '',
                file: null,
                tpro: 100
            }
        },
        components: {
            QField,
            QInput,
            QBtn,
            QProgress,
            QChip
        },
        methods: {
            cancel() {
                if (this.requesting) {
                    this.abort();
                }
                else if (this.selectedFile.length > 0) {
                    this.$emit('reset');
                }
            },
            reset() {
                this.file = null;
                this.selectedFile = '';
                this.$refs.upload.value = '';
            },
            processFile(event) {
                let file = event.target.files[0];
                let fileName = file ? file.name : '';
                let fileNameSplit = fileName.split('.');
                let extension = fileNameSplit[1] ? fileNameSplit[1] : null;
                if (fileName.length > 22 && extension) {
                    fileName = `${fileName.substring(0, 14)}...${extension}`;
                }
                else if (fileName.length > 22 && !extension) {
                    fileName = `${fileName.substring(0, 17)}...`;
                }
                this.file = file;
                this.selectedFile = fileName;
            },
            upload() {
                this.$emit('upload', this.file);
            },
            abort() {
                this.$emit('abort');
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../themes/quasar.variables.styl'

    #voicemail-file-upload
        display none

    .upload-field
        margin-bottom 10px

        .upload-label
            display block
            color $csc-label
            font-size 16px
            margin-bottom 5px

        .upload-button
            color black

        .reset-button
            padding 0

            .q-icon
                margin 0

        .upload-filename
            color $black
            margin-bottom 10px

    .progress-field
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
