<template>
    <csc-page-sticky
        id="csc-page-subscriber-phonebook-add"
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
                    to="/user/subscriber-phonebook"
                    :label="$t('Subscriber Phonebook')"
                    icon="fas fa-user"
                />
                <q-breadcrumbs-el
                    :label="$t('Add')"
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
                    :error="v$.formData.name.$errors.length > 0"
                    :error-message="nameErrorMessage"
                    @update:model-value="v$.formData.name.$touch()"
                />
                <q-input
                    v-model="formData.number"
                    :label="$t('Number')"
                    :error="v$.formData.number.$errors.length > 0"
                    :error-message="numberErrorMessage"
                    @update:model-value="v$.formData.number.$touch()"
                />
                <q-toggle
                    v-model="formData.shared"
                    :label="$t('Shared')"
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
import { required } from 'vuelidate/lib/validators'
import { mapWaitingActions } from 'vue-wait'
import CscPageSticky from 'components/CscPageSticky'
import useValidate from '@vuelidate/core'
export default {
    name: 'CscPageSubscriberPhonebookAdd',
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
            formData: this.getDefaultFormData(),
            v$: useValidate()
        }
    },
    computed: {
        nameErrorMessage () {
            const errorsTab = this.v$.formData.name.$errors
            if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'required') {
                return this.$t('{field} is required', {
                    field: this.$t('Name')
                })
            } else {
                return ''
            }
        },
        numberErrorMessage () {
            const errorsTab = this.v$.formData.number.$errors
            if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'required') {
                return this.$t('{field} is required', {
                    field: this.$t('Number')
                })
            } else {
                return ''
            }
        }
    },
    methods: {
        ...mapWaitingActions('user', {
            createPhonebookSubscriber: 'createPhonebookSubscriber'
        }),
        getDefaultFormData () {
            return {
                name: '',
                number: '',
                shared: false
            }
        },
        cancel () {
            this.$router.push('/user/subscriber-phonebook/')
            this.$emit('cancel')
        },
        async confirm () {
            await this.createPhonebookSubscriber(this.formData)
            await this.$router.push('/user/subscriber-phonebook/')
        }
    }
}
 </script>
