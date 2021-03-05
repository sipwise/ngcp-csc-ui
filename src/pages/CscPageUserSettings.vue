<template>
    <csc-page
        id="csc-page-user-settings"
        class="q-pa-lg row"
    >
        <div
            class="col col-xs-12 col-md-6"
        >
            <csc-change-password
                :loading="isPasswordChanging"
                :error="changePasswordError"
                :subscriber="getSubscriber"
                @change="changePassword"
            />
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

export default {
    name: 'CscPageUserSettings',
    components: {
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
        ])
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
        ])
    }
}
</script>
