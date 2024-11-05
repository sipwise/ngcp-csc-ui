<template>
    <csc-page-sticky
        id="csc-page-customer-phonebook-details"
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
                    :label="$t('Customer Phonebook')"
                    icon="fas fa-user"
                />
                <q-breadcrumbs-el
                    :label="name"
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
                <q-input
                    v-model="formData.name"
                    :label="$t('Name')"
                    @update:model-value="v$.formData.name.$touch()"
                />

                <q-input
                    v-model="formData.number"
                    :label="$t('Number')"
                    :error="numberError"
                    :error-message="numberErrorMessage"
                    @update:model-value="v$.formData.number.$touch()"
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
import { mapWaitingActions } from 'vue-wait'
import { required } from 'vuelidate/lib/validators'
export default {
    name: 'CscPageCustomerPhonebookDetails',
    components: {
        CscPageSticky
    },
    validations: {
        formData: {
            name: {
                required
            },
            number: {
                required
            }
        }
    },
    data () {
        return {
            id: this.$route.params.id,
            formData: this.getDefaultFormData(),
            v$: useValidate(),
            numberErrorMessage: '',
            numberError: false
        }
    },
    async mounted () {
        await this.getPhonebook(this.id)
    },
    methods: {
        ...mapWaitingActions('user', {
            getPhonebookCustomerDetails: 'getPhonebookCustomerDetails',
            getValueNameCustomer: 'getValueNameCustomer',
            getValueNumberCustomer: 'getValueNumberCustomer'
        }),
        async getPhonebook (id) {
            const response = await this.getPhonebookCustomerDetails(id)
            this.formData.name = response.data.name
            this.formData.number = response.data.number
        },
        getDefaultFormData () {
            return {
                name: '',
                number: ''
            }
        },
        cancel () {
            this.$router.push('/user/pbx-configuration/customer-phonebook/')
            this.$emit('cancel')
        },
        async changeValueName () {
            await this.getValueNameCustomer({
                phonebookId: this.id,
                name: this.formData.name
            })
        },
        async changeValueNumber () {
            await this.getValueNumberCustomer({
                phonebookId: this.id,
                number: this.formData.number
            })
        },
        async confirm () {
            try {
                await this.changeValueNumber()
                await this.changeValueName()
                await this.$router.push('/user/pbx-configuration/customer-phonebook/')
            } catch (error) {
                this.numberError = true
                this.numberErrorMessage = this.$t('This number is already in use.')
            }
        }
    }
}
</script>
