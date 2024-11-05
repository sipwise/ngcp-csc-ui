<template>
    <q-page
        class="flex flex-center"
    >
        <csc-change-password-dialog
            v-model="showDialog"
            :title="$t('Recover password')"
            :loading="isPasswordChanging"
            @change-password="recoverPassword({ password: $event.password, token: token })"
            @dialog-closed="redirectToLogin()"
        />
    </q-page>
</template>

<script>
import CscChangePasswordDialog from 'components/CscChangePasswordDialog'
import { RequestState } from 'src/store/common'
import {
    mapActions,
    mapGetters,
    mapState
} from 'vuex'

export default {
    name: 'CscRecoverPassword',
    components: {
        CscChangePasswordDialog
    },
    props: {
        token: {
            type: String,
            default: null
        }
    },
    data () {
        return {
            showDialog: true
        }
    },
    computed: {
        ...mapState('user', [
            'changePasswordState',
            'changePasswordError'
        ]),
        ...mapGetters('user', [
            'isPasswordChanging'
        ])
    },
    watch: {
        changePasswordState (state) {
            if (state === RequestState.succeeded) {
                this.$q.notify({
                    position: 'top',
                    color: 'positive',
                    icon: 'check',
                    message: this.$t('Password changed successfully')
                })
                this.redirectToLogin()
            } else if (state === RequestState.failed) {
                this.$q.notify({
                    position: 'top',
                    color: 'negative',
                    icon: 'error',
                    message: this.changePasswordError || this.$t('There was an error, please retry later')
                })
            }
        }
    },
    mounted () {
        if (!this.token) {
            this.redirectToLogin()
        }
    },
    methods: {
        ...mapActions('user', [
            'recoverPassword'
        ]),
        redirectToLogin () {
            this.$router.push({ path: '/login' })
        }
    }
}
</script>
