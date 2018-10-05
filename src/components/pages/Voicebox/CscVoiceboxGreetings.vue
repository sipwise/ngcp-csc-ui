
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
                <q-progress
                    v-show="requesting"
                    stripe
                    animate
                    color="primary"
                    :percentage="progress"
                />
                <div class="upload-filename">
                    {{ selectedFile }}
                </div>
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
                    @click="$refs.voicemailUpload.click()"
                    icon="folder"
                >
                    {{ $t('buttons.select') }}
                </q-btn>
                <q-btn
                    flat
                    v-show="selectedFile.length > 0 && !requesting"
                    color="primary"
                    icon="cloud_upload"
                    @click="uploadBusyGreeting"
                >
                    {{ $t('buttons.upload') }}
                </q-btn>
            </label>
            <input
                ref="voicemailUpload"
                id="voicemail-file-upload"
                type="file"
                accept=".wav,.mp3,.ogg"
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
        QProgress
    } from 'quasar-framework'
    export default {
        name: 'csc-voicebox-greetings',
        props: [
            'progress',
            'requesting'
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
            cancel() {
                console.log('cancel()');
                if (this.requesting) {
                    this.abortBusyUpload();
                }
                else if (this.selectedFile.length > 0) {
                    this.resetFile();
                }
            },
            resetFile() {
                this.file = null;
                this.selectedFile = '';
                this.$store.commit('voicebox/resetProgress');
            },
            processFile(event) {
                console.log('event file', event.target.files[0]);
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
                this.$store.dispatch('voicebox/createBusyGreeting', {
                    dir: 'busy',
                    file: this.file
                });
            },
            abortBusyUpload() {
                this.$store.dispatch('voicebox/abortPreviousRequest');
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
