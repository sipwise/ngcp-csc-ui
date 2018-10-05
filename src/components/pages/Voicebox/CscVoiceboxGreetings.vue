

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
                <q-btn
                    class="upload-button"
                    flat
                    dark
                    @click="$refs.voicemailUpload.click()"
                    icon-right="cloud_upload"
                >
                    {{ $t('buttons.uploadFile') }}
                </q-btn>
                <span class="upload-filename">
                    {{ selectedFile }}
                </span>
                <q-btn
                    class="reset-button"
                    v-if="selectedFile.length > 0"
                    flat
                    dark
                    @click="resetFile"
                    icon-right="cancel"
                />
            </label>
            <input
                ref="voicemailUpload"
                id="voicemail-file-upload"
                type="file"
                accept=".wav,.mp3,.ogg"
                @change="processFile($event)"
            />
        </q-field>
        <q-field>
            <q-btn
                flat
                v-if="selectedFile.length > 0"
                color="primary"
                icon-right="fa-save"
                @click="uploadBusyGreeting"
            >
                {{ $t('buttons.save') }}
            </q-btn>
        </q-field>
        <q-progress :percentage="progress" />
    </div>
</template>

<script>
    import {
        QField,
        QInput,
        QBtn,
        QProgress
    } from 'quasar-framework'
    export default {
        name: 'csc-voicebox-greetings',
        props: [
            'progress'
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
            QProgress
        },
        computed: {
        },
        methods: {
            resetFile() {
                this.file = null;
                this.selectedFile = '';
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
            uploadBusyGreeting() {
                console.log('uploadBusyGreeting');
                this.$store.dispatch('voicebox/createBusyGreeting', {
                    dir: 'busy',
                    file: this.file
                });
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl'

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
            color black

</style>
