<template>
    <q-item>
        <q-item-section
            v-if="!editing"
            side
            @click="activateEditing"
        >
            <q-icon name="email" />
        </q-item-section>
        <q-item-section
            @click="activateEditing"
        >
            <q-item-label
                v-if="!editing"
            >
                {{ value }}
            </q-item-label>
            <csc-input-saveable
                v-else
                ref="emailInput"
                v-model="newEmail"
                :label="$t('Renew Notify Email')"
                :value-changed="isChanged"
                :error="v$.newEmail.$errors.length > 0"
                :error-message="newEmailErrorMessage"
                dense
                @keypress.space.prevent
                @keydown.space.prevent
                @keyup.space.prevent
                @input="v$.newEmail.$touch()"
                @save="save"
                @undo="undo"
                @focusout="focusOutEditing"
                @focusin="cancelTimer"
            />
        </q-item-section>
        <q-item-section
            side
        >
            <q-btn
                flat
                dense
                icon="delete"
                text-color="negative"
                :title="$t('Remove')"
                :disable="isChanged"
                @click="remove"
            />
        </q-item-section>
    </q-item>
</template>

<script>
import useValidate from '@vuelidate/core'
import { email, required } from '@vuelidate/validators'
import CscInputSaveable from 'components/form/CscInputSaveable'
export default {
    name: 'CscMailToFaxRenewNotifyEmail',
    components: {
        CscInputSaveable
    },
    props: {
        value: {
            type: String,
            required: true
        }
    },
    emits: ['save', 'remove'],
    data () {
        return {
            newEmail: this.value,
            editing: false,
            timerHandler: undefined,
            v$: useValidate()
        }
    },
    validations: {
        newEmail: {
            required,
            email
        }
    },
    computed: {
        isChanged () {
            return this.newEmail !== this.value
        },
        newEmailErrorMessage () {
            const errorsTab = this.v$.newEmail.$errors
            if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'required') {
                return this.$t('{field} is required', {
                    field: this.$t('Renew Notify Email')
                })
            } else if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'email') {
                return this.$t('Input a valid email address')
            }
            return ''
        }
    },
    beforeUnmount () {
        this.cancelTimer()
    },
    methods: {
        activateEditing () {
            if (!this.editing) {
                this.newEmail = this.value
                this.editing = true
                this.focusEmailInput()
            }
        },
        deactivateEditing () {
            this.timerHandler = setTimeout(() => {
                this.editing = false
            }, 1000)
        },
        cancelTimer () {
            clearTimeout(this.timerHandler)
        },
        focusOutEditing () {
            if (!this.isChanged) {
                this.deactivateEditing()
            }
        },
        focusEmailInput () {
            this.$nextTick(() => {
                const emailInput = this.$refs.emailInput?.$el
                if (emailInput) {
                    emailInput.focus()
                }
            })
        },
        undo () {
            this.newEmail = this.value
            this.v$.$reset()
            this.focusEmailInput()
        },
        save () {
            this.$emit('save', {
                id: this.key,
                value: this.newEmail
            })
        },
        remove () {
            this.$q.dialog({
                title: this.$t('Remove secret key renew notify email'),
                message: this.$t('You are about to remove secret key renew notify email: {email}', { email: this.value }),
                color: 'primary',
                cancel: true,
                persistent: true
            }).onOk(() => {
                this.$emit('remove', this.key)
            })
        }
    }
}
</script>
