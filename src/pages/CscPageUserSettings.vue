<template>
    <csc-page
        id="csc-page-user-settings"
        class="q-pa-lg row"
    >
        <div
            class="col col-xs-12 col-md-6"
        >
            <csc-change-password-embedded
                ref="changeWebPasswordSection"
                class="q-mb-md"
                :btn-label="$t('Change Web Password')"
                :password-label="$t('New Web Password')"
                :password-confirm-label="$t('New Web Password confirm')"
                :save-conformation-text="$t('You are about to change your login password. After the password was changed successfully, you get automatically logged out to authenticate with the new password. ')"
                :loading="processingChangeWebPassword"
                @change="requestWebPasswordChange"
            />
            <csc-change-password-embedded
                v-if= "isAdministrative"
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
                v-if= "isAdministrative"
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
    mapGetters
} from 'vuex'
import CscPage from 'components/CscPage'
import CscChangePasswordEmbedded from 'components/pages/UserSettings/CscChangePasswordEmbeded'
import { mapWaitingActions, mapWaitingGetters } from 'vue-wait'
import { copyToClipboard } from 'quasar'
import CscInputPassword from 'components/form/CscInputPassword'


const WAIT_CHANGE_WEB_PASSWORD = 'processing-changeWebPassword'
const WAIT_CHANGE_SIP_PASSWORD = 'processing-changeSIPPassword'

export default {
    name: 'CscPageUserSettings',
    components: {
        CscInputPassword,
        CscChangePasswordEmbedded,
        CscPage
    },
    data () {
        return {
        }
    },
    computed: {
        ...mapGetters('user', [
            'getSubscriber'
        ]),
        ...mapWaitingGetters({
            processingChangeSIPPassword: WAIT_CHANGE_SIP_PASSWORD,
            processingChangeWebPassword: WAIT_CHANGE_WEB_PASSWORD
        }),
        currentSIPPassword () {
            return this.getSubscriber?.password || ''
        },
        isAdministrative () {
            return this.getSubscriber?.administrative || false
        },
        currentSIPURI () {
            const subscriberData = this.getSubscriber
            return subscriberData?.username + '@' + subscriberData?.domain
        }
    },
    methods: {
        ...mapWaitingActions('user', {
            changeSIPPassword: WAIT_CHANGE_SIP_PASSWORD,
            changePassword: WAIT_CHANGE_WEB_PASSWORD
        }),
        async requestWebPasswordChange (newPassword) {
            try {
                await this.changePassword(newPassword)
                showToast(this.$t('Your Web password has been changed successfully'))
                this.$refs.changeWebPasswordSection.cancel()
            } catch (error) {
                showGlobalError(error?.message)
            }
        },
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
