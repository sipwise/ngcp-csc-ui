<template>
    <q-dialog
        :value="value"
        v-bind="$attrs"
        v-on="$listeners"
    >
        <q-card
            style="min-width: 50%"
        >
            <q-card-section
                class="text-h6"
            >
                {{ $t('Send Fax') }}
            </q-card-section>
            <q-card-section>
                <csc-call-input
                    v-if="value"
                    v-model="form.destination"
                    :label="$t('Destination Number')"
                    @submit="sendFax"
                    @error="error"
                />
                <q-select
                    v-model="form.quality"
                    emit-value
                    map-options
                    :options="$faxQualityOptions"
                    :label="$t('Quality')"
                />
                <q-input
                    v-model="form.pageHeader"
                    clearable
                    type="text"
                    :label="$t('Page Header')"
                    :error="$v.form.pageHeader.$error"
                    :error-message="pageHeaderErrorMessage"
                    @input="$v.form.pageHeader.$touch"
                    @blur="$v.form.pageHeader.$touch"
                />
                <q-input
                    v-model="form.data"
                    clearable
                    type="textarea"
                    :max-height="100"
                    :min-rows="10"
                    :label="$t('Content')"
                    :error="$v.form.data.$error"
                    :error-message="dataErrorMessage"
                    @input="$v.form.data.$touch"
                    @blur="$v.form.data.$touch"
                />
                <csc-input-file
                    accept=".pdf,.tif,.tiff,.txt,.ps"
                    @file-selected="toggleFileSelected"
                />
            </q-card-section>
            <q-card-actions>
                <q-btn
                    v-close-popup
                    flat
                    icon="clear"
                    color="default"
                    :label="$t('Cancel')"
                    @click="resetFormData"
                />
                <q-btn
                    flat
                    color="primary"
                    icon="send"
                    :disable="formDisabled"
                    :label="$t('Send')"
                    @click="sendFax"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script>
import CscCallInput from './form/CscCallInput'
import {
    showGlobalError
} from 'src/helpers/ui'
import {
    required,
    requiredUnless,
    maxLength
} from 'vuelidate/lib/validators'
import CscInputFile from 'components/form/CscInputFile'

export default {
    name: 'CscSendFax',
    components: {
        CscInputFile,
        CscCallInput
    },
    props: {
        value: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            form: {},
            isMobile: this.$q.platform.is.mobile,
            destinationError: false
        }
    },
    validations: {
        form: {
            data: {
                required: requiredUnless(function () {
                    return this.hasContentToSend
                }),
                maxLength: maxLength(3600)
            },
            faxfile: {
                required: requiredUnless(function () {
                    return this.hasContentToSend
                })
            },
            pageHeader: {
                required,
                maxLength: maxLength(64)
            }
        }
    },
    computed: {
        hasContentToSend () {
            return (this.form.data && this.form.data.length > 0) || this.form.faxfile
        },
        formDisabled () {
            return !this.$v.form.$anyDirty ||
                !this.form.pageHeader ||
                !this.form.destination ||
                this.destinationError ||
                this.$v.form.pageHeader.$error ||
                !this.hasContentToSend
        },
        pageHeaderErrorMessage () {
            return this.$t('{field} must have at most {maxLength} letters', {
                field: this.$t('Page Header'),
                maxLength: this.$v.form.pageHeader.$params.maxLength.max
            })
        },
        dataErrorMessage () {
            if (!this.$v.form.data.required) {
                return this.$t('{fieldOne} or {fieldTwo} is required', {
                    fieldOne: this.$t('Content'),
                    fieldTwo: this.$t('File')
                })
            } else if (!this.$v.form.data.maxLength) {
                return this.$t('{field} must have at most {maxLength} letters', {
                    field: this.$t('Content'),
                    maxLength: this.$v.form.data.$params.maxLength.max
                })
            } else {
                return ''
            }
        },
        fileErrorMessage () {
            return this.$t('{fieldOne} or {fieldTwo} is required', {
                fieldOne: this.$t('File'),
                fieldTwo: this.$t('Content')
            })
        }
    },
    mounted () {
        this.resetFormData()
    },
    methods: {
        toggleFileSelected (value) {
            this.form.faxfile = value
        },
        sendFax () {
            if (this.$v.form.$error ||
                this.destinationError) {
                showGlobalError(this.$t('You have invalid form input. Please check and try again.'))
            } else {
                this.$store.dispatch('communication/createFax', this.form)
                this.resetFormData()
            }
        },
        error (state) {
            this.destinationError = state
        },
        resetFormData () {
            this.form = {
                destination: '',
                pageHeader: null,
                data: null,
                quality: this.$faxQualityOptionsDefault.value,
                faxfile: null
            }
            this.$v.$reset()
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
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
