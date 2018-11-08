<template>
    <q-modal v-model="showFaxModal" :minimized="!isMobile" :maximized="isMobile" id="fax-modal">
        <!--NOTE: There is an issue with q-modal, mentioned in Quasar Framework documentation,-->
        <!--where closing the modal by setting v-model to false, might not work properly in-->
        <!--development if source files are updated while Modal is open. Best procedure is to-->
        <!--always close modal before updating sourcefile (which triggers webpack re-build)-->
        <div class="title">
            {{ $t('communication.sendFax') }}
        </div>
        <q-field :error-label="destinationErrorMessage">
            <q-input
                dark
                clearable
                type="text"
                v-model="form.destination"
                :float-label="$t('communication.label.destination')"
                @input="$v.form.destination.$touch"
                @blur="$v.form.destination.$touch"
                :error="$v.form.destination.$error"
            />
        </q-field>
        <q-field>
            <q-select
                dark
                v-model="form.quality"
                :options="qualityOptions"
                :float-label="$t('communication.label.quality')"
            />
        </q-field>
        <q-field :error-label="pageHeaderErrorMessage">
            <q-input
                dark
                clearable
                type="text"
                v-model="form.pageHeader"
                :float-label="$t('communication.label.pageHeader')"
                @input="$v.form.pageHeader.$touch"
                @blur="$v.form.pageHeader.$touch"
                :error="$v.form.pageHeader.$error"
            />
        </q-field>
        <q-field :error-label="dataErrorMessage">
            <q-input
                dark
                clearable
                type="textarea"
                :max-height="100"
                :min-rows="10"
                v-model="form.data"
                :float-label="$t('communication.label.content')"
                @input="$v.form.data.$touch"
                @blur="$v.form.data.$touch"
                :error="$v.form.data.$error"
            />
        </q-field>
        <q-field class="upload-field">
            <label
                for="fax-file-upload"
                class="upload-label"
            >
                <div class="upload-label">
                    {{ $t('communication.label.faxFile') }}
                </div>
                <q-btn
                    flat
                    color="white"
                    icon="cloud_upload"
                    class="upload-button"
                    @click="$refs.faxUpload.click()"
                >
                    {{ $t('buttons.select') }}
                </q-btn>
                <span class="upload-filename">
                    {{ selectedFile }}
                </span>
                <q-btn
                    flat
                    icon="cancel"
                    class="reset-button"
                    v-if="selectedFile.length > 0"
                    @click="resetFile"
                />
            </label>
            <input
                dark
                ref="faxUpload"
                id="fax-file-upload"
                type="file"
                accept=".pdf,.tiff,.txt,.ps"
                @change="processFile($event)"
                @input="$v.form.file.$touch"
                @blur="$v.form.file.$touch"
                :error="$v.form.file.$error"
            />
        </q-field>
        <div
            v-if="$v.form.file.$error"
            id="csc-error-label"
        >
            {{ fileErrorMessage }}
        </div>
        <q-btn
            flat
            icon="clear"
            @click="hideModal"
            color="default"
        >
            {{ $t('communication.cancel') }}
        </q-btn>
        <q-btn
            flat
            color="primary"
            @click="sendFax"
            icon="insert drive file"
            :disable="formDisabled"
        >
            {{ $t('communication.send') }}
        </q-btn>
    </q-modal>
</template>

<script>
    import {
        required,
        requiredUnless,
        maxLength
    } from 'vuelidate/lib/validators'
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
                    pageHeader: null,
                    data: null,
                    quality: 'normal',
                    file: {}
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
        validations: {
            form: {
                destination: {
                    required,
                    maxLength: maxLength(64)
                },
                data: {
                    required: requiredUnless(function() {
                        return this.hasContentToSend;
                    }),
                    maxLength: maxLength(3600)
                },
                file: {
                    required: requiredUnless(function() {
                        return this.hasContentToSend;
                    })
                },
                pageHeader: {
                    maxLength: maxLength(64)
                }
            }
        },
        computed: {
            hasContentToSend() {
                return (!!this.form.data || !!this.form.file) || !this.$v.form.$anyDirty;
            },
            formDisabled() {
                return !this.$v.form.$anyDirty ||
                    this.$v.form.destination.$error ||
                    this.$v.form.pageHeader.$error ||
                    !this.hasContentToSend;
            },
            destinationErrorMessage() {
                if (!this.$v.form.destination.required) {
                    return this.$t('validationErrors.fieldRequired', {
                        field: this.$t('communication.label.destination')
                    });
                }
                else if (!this.$v.form.destination.maxLength) {
                    return this.$t('validationErrors.maxLength', {
                        field: this.$t('communication.label.destination'),
                        maxLength: this.$v.form.destination.$params.maxLength.max
                    });
                }
            },
            pageHeaderErrorMessage() {
                return this.$t('validationErrors.maxLength', {
                    field: this.$t('communication.label.pageHeader'),
                    maxLength: this.$v.form.pageHeader.$params.maxLength.max
                });
            },
            dataErrorMessage() {
                if (!this.$v.form.data.required) {
                    return this.$t('validationErrors.fieldRequiredXor', {
                        fieldOne: this.$t('communication.label.content'),
                        fieldTwo: this.$t('communication.label.file')
                    });
                }
                else if (!this.$v.form.data.maxLength) {
                    return this.$t('validationErrors.maxLength', {
                        field: this.$t('communication.label.content'),
                        maxLength: this.$v.form.data.$params.maxLength.max
                    });
                }
            },
            fileErrorMessage() {
                return this.$t('validationErrors.fieldRequiredXor', {
                    fieldOne: this.$t('communication.label.file'),
                    fieldTwo: this.$t('communication.label.content')
                });
            }
        },
        methods: {
            resetFile() {
                this.form.file = {};
                this.selectedFile = '';
                this.$refs.faxUpload.value = '';
            },
            processFile(event) {
                console.log('processFile()');
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
                    pageHeader: null,
                    data: null,
                    quality: 'normal',
                    file: null
                };
                this.selectedFile = '';
                this.showFaxModal = true;
                this.$v.$reset();
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
            line-height $csc-subtitle-line-height
            font-size $csc-subtitle-font-size
            font-weight $csc-subtitle-font-weight
    .upload-field
        margin-bottom 10px

        .upload-label
            display block
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

    #fax-file-upload
        display none

    #csc-error-label
        font-size 12px
        color $negative
        margin -15px 0 10px 0

</style>
