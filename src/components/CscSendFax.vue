<template>
    <q-modal v-model="showFaxModal" :minimized="!isMobile" :maximized="isMobile" id="fax-modal">
        <!--NOTE: There is an issue with q-modal, mentioned in Quasar Framework documentation,-->
        <!--where closing the modal by setting v-model to false, might not work properly in-->
        <!--development if source files are updated while Modal is open. Best procedure is to-->
        <!--always close modal before updating sourcefile (which triggers webpack re-build)-->
        <div class="title">
            {{ $t('communication.sendFax') }}
        </div>
        <q-field>
            <q-input
                type="text"
                v-model="form.destination"
                :float-label="$t('communication.label.destination')" />
        </q-field>
        <q-field>
            <q-select
                v-model="form.quality"
                :options="qualityOptions"
                :float-label="$t('communication.label.quality')" />
        </q-field>
        <q-field>
            <q-input
                type="text"
                v-model="form.pageheader"
                :float-label="$t('communication.label.pageHeader')" />
        </q-field>
        <q-field>
            <q-input
                type="textarea"
                :max-height="100"
                :min-rows="10"
                v-model="form.data"
                :float-label="$t('communication.label.content')" />
        </q-field>
        <q-field class="upload-field">
            <label
                for="file-upload"
                class="upload-label"
            >
                <div class="upload-label">Fax file</div>
                <q-btn
					class="upload-button"
					flat
					dark
					@click="$refs.upload.click()"
					icon-right="cloud_upload"
				>
					Upload file
				</q-btn>
                <q-btn
					v-if="selectedFile.length > 0"
					flat
					dark
					@click="resetFile"
					icon-right="clear"
				/>
				<span class="upload-filename">
					{{ selectedFile }}
				</span>
            </label>
            <input
				ref="upload"
                id="file-upload"
                type="file"
				accept=".pdf,.tiff,.txt,.ps"
                @change="processFile($event)"
            />
        </q-field>
        <q-btn flat dark @click="hideModal">{{ $t('communication.cancel') }}</q-btn>
        <q-btn flat color="primary" @click="sendFax" icon-right="insert drive file" :disable="formDisabled">{{ $t('communication.send') }}</q-btn>
    </q-modal>
</template>

<script>
    import {
        QModal,
        QBtn,
        QField,
        QSelect,
        QInput,
        QIcon
    } from 'quasar-framework'
    export default {
        name: 'csc-send-fax',
        data () {
            return {
                showFaxModal: false,
				selectedFile: '',
                form: {
                    destination: null,
                    pageheader: null,
                    data: null,
                    quality: 'normal',
                    file: null
                },
                qualityOptions: [
                    { label: this.$t('communication.quality.normal'), value: 'normal' },
                    { label: this.$t('communication.quality.fine'), value: 'fine' },
                    { label: this.$t('communication.quality.super'), value: 'super' }
                ],
                isMobile: this.$q.platform.is.mobile
            }
        },
        components: {
            QModal,
            QBtn,
            QField,
            QSelect,
            QInput,
            QIcon
        },
        computed: {
            formDisabled() {
                return !(this.form.destination && this.form.quality &&
					(this.form.file || this.form.data)) ? true : false;
            }
        },
        methods: {
			resetFile() {
				this.form.file = null;
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
				this.form.file = file;
				this.selectedFile = fileName;
            },
            sendFax() {
                this.$store.dispatch('communication/createFax', this.form);
            },
            showModal() {
                this.form = {
                    destination: null,
                    pageheader: null,
                    data: null,
                    quality: 'normal',
                    file: null
                };
                this.selectedFile = '';
                this.showFaxModal = true;
            },
            hideModal() {
                this.showFaxModal = false;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../themes/quasar.variables.styl'

    #fax-modal

        .modal-content
            min-width 40vw
            padding 20px 15px

        .title
            color $primary
            line-height $csc-subtitle-line-height
            font-size $csc-subtitle-font-size
            font-weight $csc-subtitle-font-weight

    .upload-field
        margin-bottom 10px

        .upload-label
            display block
            color $csc-label
            font-size 16px
            margin-bottom 5px

        .upload-button
            color black

        .upload-filename
            color black

	#file-upload
		display none

</style>
