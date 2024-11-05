<template>
    <csc-page-sticky
        id="csc-page-customer-phonebook-add"
        ref="pageSticky"
    >
        <template
            #header
        >
            <q-breadcrumbs
                class="absolute-left q-ml-md text-weight-light"
                active-color="primary"
                separator-color="primary"
            >
                <q-breadcrumbs-el
                    class="cursor-pointer"
                    to="/user/pbx-configuration/customer-phonebook"
                    :label="$t('Upload CSV')"
                    icon="fas fa-upload"
                />
            </q-breadcrumbs>
        </template>
        <q-item
            class="col col-xs-12"
        >
            <q-list
                class="col col-xs-12"
                side
                top
                no-wrap
            >
                <csc-input-file
                    accept=".csv"
                    data-cy="sendfax-fileinput"
                    @file-selected="toggleFileSelected"
                />
                <br>
                <q-toggle
                    v-model="formData.purge_existing"
                    dense
                    :label="$t('Purge existing')"
                    data-cy="phonebook-purge"
                    :disable="loading"
                />
            </q-list>
        </q-item>
        <div class="text-center">
            <q-btn
                icon="clear"
                color="white"
                flat
                :label="$t('Cancel')"
                @click="cancel"
            />
            <q-btn
                icon="check"
                :label="$t('Confirm')"
                unelevated
                text-color="primary"
                @click="confirm"
            />
        </div>
    </csc-page-sticky>
</template>
<script>
import useValidate from '@vuelidate/core'
import CscPageSticky from 'components/CscPageSticky'
import CscInputFile from 'components/form/CscInputFile'
import { mapWaitingActions } from 'vue-wait'
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
export default {
    name: 'CscPageCustomerPhonebookUpload',
    components: {
        CscPageSticky,
        CscInputFile
    },
    validations: {
        formData: {
            file: {
                required
            }
        }
    },
    data () {
        return {
            formData: this.getDefaultFormData(),
            v$: useValidate()
        }
    },
    methods: {
        ...mapWaitingActions('user', {
            uploadPhonebookCustomer: 'uploadPhonebookCustomer'
        }),
        ...mapGetters('user', [
            'getCustomerId'
        ]),
        getDefaultFormData () {
            return {
                file: null,
                purge_existing: false,
                customer_id: this.getCustomerId()
            }
        },
        cancel () {
            this.$router.push('/user/pbx-configuration/customer-phonebook/')
            this.$emit('cancel')
        },
        async confirm () {
            await this.uploadPhonebookCustomer(this.formData)
            await this.$router.push('/user/pbx-configuration/customer-phonebook/')
        },
        toggleFileSelected (value) {
            this.formData.file = value
        }
    }
}
</script>
