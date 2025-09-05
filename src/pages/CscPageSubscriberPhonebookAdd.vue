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
                    data-cy="csc-phonebook-add-name"
                    :error="v$.formData.name.$errors.length > 0"
                    :error-message="nameErrorMessage"
                    @update:model-value="v$.formData.name.$touch()"
                />
                <q-input
                    v-model="formData.number"
                    :label="$t('Number')"
                    data-cy="csc-phonebook-add-number"
                    :error="numberError"
                    :error-message="numberErrorMessage"
                    @update:model-value="numberUpdated()"
                />
                <q-toggle
                    v-model="formData.shared"
                    :label="$t('Shared')"
                    data-cy="csc-phonebook-add-shared"
                />
            </q-list>
        </q-item>
        <div class="text-center">
            <q-btn
                icon="clear"
                color="white"
                flat
                :label="$t('Cancel')"
                data-cy="csc-phonebook-add-cancel"
                @click="cancel"
            />
            <q-btn
                icon="check"
                :label="$t('Confirm')"
                data-cy="csc-phonebook-add-confirm"
                :disable="disableSaveButton()"
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
import { mapGetters } from 'vuex'
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
    emits: ['cancel'],
    data () {
        return {
            formData: this.getDefaultFormData(),
            v$: useValidate(),
            numberErrorMessage: '',
            numberError: false
        }
    },
    computed: {
        ...mapGetters('user', [
            'prefilledNumber'
        ]),
        nameErrorMessage () {
            const errorsTab = this.v$.formData.name.$errors
            if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'required') {
                return this.$t('{field} is required', {
                    field: this.$t('Name')
                })
            }
            return ''
        }
    },
    mounted () {
        if (this.prefilledNumber) {
            this.formData.number = this.prefilledNumber
            this.$store.commit('user/setPhonebookNumber', '')
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
        disableSaveButton () {
            return this.v$.formData.$invalid
        },
        numberUpdated () {
            this.v$.formData.number.$touch()
            const errorsTab = this.v$.formData.number.$errors
            if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'required') {
                this.numberErrorMessage = this.$t('{field} is required', {
                    field: this.$t('Number')
                })
                this.numberError = true
            } else {
                this.numberErrorMessage = ''
                this.numberError = false
            }
        },
        cancel () {
            this.$router.push('/user/subscriber-phonebook/')
            this.$emit('cancel')
        },
        async confirm () {
            try {
                await this.createPhonebookSubscriber(this.formData)
                await this.$router.push('/user/subscriber-phonebook/')
            } catch (error) {
                if (error.response && error.response.status === 422) {
                    this.numberError = true
                    this.numberErrorMessage = this.$t('This number is already in use.')
                } else {
                    // eslint-disable-next-line no-console
                    console.error('An error occurred:', error)
                }
            }
        }
    }
}
</script>
