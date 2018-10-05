
<template>
    <div>
        <q-field
            class="csc-form-field upload-field"
            icon="music_note"
        >
            <label
                for="voicemail-file-upload"
                class="upload-label"
            >
                {{ $t('voicebox.label.busyGreeting') }}
            </label>
            <span
                v-show="selectedFile.length === 0"
            >
                <slot name="status-label" />
            </span>
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
                v-show="selectedFile.length === 0 && id"
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
                flat
                color="primary"
                @click="$refs.upload.click()"
                icon="folder"
            >
                {{ selectLabel }}
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
            'fileTypes',
            'id'
        ],
        data () {
            return {
                selectedFile: '',
                file: null
            }
        },
        components: {
            QField,
            QInput,
            QBtn,
            QProgress,
            QChip
        },
        computed: {
            selectLabel() {
                return this.id ? this.$t('buttons.selectNew') :
                    this.$t('buttons.select');
            }
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

        .reset-button
            padding 0

            .q-icon
                margin 0

        .upload-filename
            color $black
            margin-bottom 10px

        .q-field-icon
            margin-top 20px

        .inactive-label
            color $secondary

        .active-label
            color $primary

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
