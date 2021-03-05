<template>
    <csc-dialog
        :value="value"
        title-icon="vpn_key"
        :title="$t('Forgot password?')"
        @input="$emit('input')"
        @hide="resetForm()"
    >
        <template
            v-slot:content
        >
            <q-form>
                <q-item>
                    <q-item-section>
                        <q-input
                            v-model.trim="username"
                            clearable
                            dense
                            :label="$t('Username')"
                            type="text"
                            :error="$v.username.$error"
                            :error-message="$errorMessage($v.username)"
                            @blur="$v.username.$touch()"
                        >
                            <template
                                v-slot:prepend
                            >
                                <q-icon
                                    name="fas fa-user-cog"
                                />
                            </template>
                        </q-input>
                    </q-item-section>
                </q-item>
            </q-form>
        </template>
        <template
            v-slot:actions
        >
            <q-btn
                icon="check"
                unelevated
                color="primary"
                :label="$t('Send')"
                :loading="newPasswordRequesting"
                :disable="!username || username.length < 1 || newPasswordRequesting"
                @click="submit()"
            />
        </template>
    </csc-dialog>
</template>

<script>
import {
    required
} from 'vuelidate/lib/validators'
import {
    mapActions,
    mapState
} from 'vuex'
import CscDialog from './CscDialog'
export default {
    name: 'CscRetrievePasswordDialog',
    components: {
        CscDialog
    },
    props: {
        value: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            username: ''
        }
    },
    validations: {
        username: {
            required
        }
    },
    computed: {
        ...mapState('user', [
            'newPasswordRequesting'
        ])
    },
    methods: {
        ...mapActions('user', [
            'resetPassword'
        ]),
        async submit () {
            this.$v.$touch()
            if (!this.$v.$invalid) {
                try {
                    const res = await this.resetPassword(this.username)
                    this.$q.notify({
                        position: 'top',
                        color: 'positive',
                        icon: 'check',
                        message: res.data.message
                    })
                } catch (err) {
                    this.$q.notify({
                        position: 'top',
                        color: 'negative',
                        icon: 'error',
                        message: this.$t('There was an error, please retry later')
                    })
                } finally {
                    this.$emit('close')
                }
            }
        },
        resetForm () {
            this.$v.$reset()
            this.username = ''
        }
    }
}
</script>
