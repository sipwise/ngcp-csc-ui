<template>
    <csc-page
        id="csc-page-user-settings"
        class="q-pa-lg row"
    >
        <div
            class="col col-xs-12 col-md-6"
        >
            <csc-change-password
                class="q-mb-md"
                :loading="isPasswordChanging"
                :error="changePasswordError"
                :subscriber="getSubscriber"
                @change="changePassword"
            />
            <csc-change-password-embedded
                ref="changeSipPasswordSection"
                class="q-mb-md"
                :btn-label="$t('Change SIP Password')"
                :password-label="$t('New SIP Password')"
                :password-confirm-label="$t('New SIP Password confirm')"
                :loading="processingChangeSIPPassword"
                @change="requestSIPPasswordChange"
            />
            <q-input
                :value="currentSIPURI"
                :label="$t('SIP URI')"
                readonly
            >
                <template v-slot:append>
                    <q-btn
                        icon="content_copy"
                        color="primary"
                        flat
                        dense
                        @click="copy2clipboard(currentSIPURI)"
                    />
                </template>
            </q-input>
            <csc-input-password
                :value="currentSIPPassword"
                :label="$t('SIP Password')"
                readonly
            >
                <template v-slot:append>
                    <q-btn
                        icon="content_copy"
                        color="primary"
                        flat
                        dense
                        @click="copy2clipboard(currentSIPPassword)"
                    />
                </template>
            </csc-input-password>
        </div>
    </csc-page>
</template>

<script>
import {
    showGlobalError,
    showToast
} from 'src/helpers/ui'
import {
    RequestState
} from 'src/store/common'
import {
    mapState,
    mapGetters,
    mapActions
} from 'vuex'
import CscPage from 'components/CscPage'
import CscChangePassword from 'components/pages/UserSettings/CscChangePassword'
import CscChangePasswordEmbedded from 'components/pages/UserSettings/CscChangePasswordEmbeded'
import { mapWaitingActions, mapWaitingGetters } from 'vue-wait'
import { copyToClipboard } from 'quasar'
import CscInputPassword from 'components/form/CscInputPassword'

export default {
    name: 'CscPageUserSettings',
    components: {
        CscInputPassword,
        CscChangePasswordEmbedded,
        CscChangePassword,
        CscPage
    },
    data () {
        return {
        }
    },
    computed: {
        ...mapState('user', [
            'changePasswordState',
            'changePasswordError'
        ]),
        ...mapGetters('user', [
            'getSubscriber',
            'isPasswordChanging'
        ]),
        ...mapWaitingGetters({
            processingChangeSIPPassword: 'processing-changeSIPPassword'
        }),
        currentSIPPassword () {
            return this.getSubscriber?.password || ''
        },
        currentSIPURI () {
            const subscriberData = this.getSubscriber
            return subscriberData?.username + '@' + subscriberData?.domain
        }
    },
    watch: {
        changePasswordState (state) {
            if (state === RequestState.succeeded) {
                showToast(this.$t('Your password has been changed successfully'))
            } else if (state === RequestState.failed) {
                showGlobalError(this.changePasswordError)
            }
        }
    },
    methods: {
        ...mapActions('user', [
            'changePassword'
        ]),
        ...mapWaitingActions('user', {
            changeSIPPassword: 'processing-changeSIPPassword'
        }),
        async requestSIPPasswordChange (newPassword) {
            try {
                await this.changeSIPPassword(newPassword)
                showToast(this.$t('Your SIP password has been changed successfully'))
                this.$refs.changeSipPasswordSection.cancel()
            } catch (error) {
                showGlobalError(error?.message)
            }
        },
        copy2clipboard (copyData) {
            copyToClipboard(copyData)
                .then(() => {
                    showToast(this.$t('Data is in the clipboard'))
                })
                .catch(() => {
                    console.error(copyData)
                    showGlobalError(this.$t('Unable to copy data to clipboard'))
                })
        }
    }
}
</script>
