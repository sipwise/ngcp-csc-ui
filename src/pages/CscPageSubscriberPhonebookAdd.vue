<template>
    <csc-page-sticky
         id="csc-page-subscriber-phonebook-add"
         ref="pageSticky"
     >
         <template
             v-slot:header
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
                :error="$v.formData.name.$error"
                :error-message="nameErrorMessage"
                @input="$v.formData.name.$touch"
         />
 
         <q-input
                v-model="formData.number"
                :label="$t('Number')"
                :error="$v.formData.number.$error"
                :error-message="numberErrorMessage"
                @input="$v.formData.number.$touch"
         />
 
         <q-toggle
                 :label="$t('Shared')"
                 v-model="formData.shared"
                 @input="$v.formData.shared"
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
 import {
    required
} from 'vuelidate/lib/validators'
 import { mapWaitingActions } from 'vue-wait'
 import CscPageSticky from 'components/CscPageSticky'
 export default {
     name: 'CscPageSubscriberPhonebookAdd',
     components: {
         CscPageSticky,
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
            formData: this.getDefaultFormData()
        }
    },
    computed: {
        nameErrorMessage () {
            if (!this.$v.formData.name.required) {
                return this.$t('{field} is required', {
                    field: this.$t('Name')
                })
            } else {
                return ''
            }
        },
        numberErrorMessage () {
            if (!this.$v.formData.number.required) {
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
            createPhonebookSubscriber:  'createPhonebookSubscriber',
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
         },
     }
 }
 </script>
 