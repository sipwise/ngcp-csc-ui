<template>
    <csc-page
        id="csc-page-call-blocking-privacy"
        class="q-pa-lg row"
    >
        <q-list
            class="col col-xs-12 col-md-4"
        >
            <q-item
                v-if="showClir"
            >
                <q-item-section>
                    <q-toggle
                        :label="$t('Hide your number to the callee')"
                        :model-value="privacy || false"
                        :disable="privacyLoading"
                        data-cy="csc-privacy-hide"
                        checked-icon="visibility_off"
                        unchecked-icon="visibility"
                        @update:model-value="toggle()"
                    />
                </q-item-section>
                <q-item-section
                    side
                >
                    <csc-spinner
                        v-if="privacyLoading"
                        class="self-center"
                    />
                </q-item-section>
            </q-item>

            <q-item
                v-if="showClirIntrapbx"
            >
                <q-item-section>
                    <q-toggle
                        :model-value="clirIntrapbx"
                        :class="isLoading ? 'disabled' : ''"
                        :label="$t('Hide number to the callee within own PBX')"
                        data-cy="csc-callee-hide"
                        checked-icon="visibility_off"
                        unchecked-icon="visibility"
                        @update:model-value="changeIntraPbx()"
                    />
                </q-item-section>
                <q-item-section
                    side
                >
                    <csc-spinner
                        v-if="isLoading"
                    />
                </q-item-section>
            </q-item>
        </q-list>
    </csc-page>
</template>

<script>

import CscPage from 'components/CscPage'
import CscSpinner from 'components/CscSpinner'
import { getSubscriberId } from 'src/auth'
import { PROFILE_ATTRIBUTE_MAP } from 'src/constants'
import {
    showGlobalError,
    showToast
} from 'src/helpers/ui'
import { RequestState } from 'src/store/common'
import { mapActions, mapGetters, mapState } from 'vuex'
export default {
    name: 'CscPageCallBlockingPrivacy',
    components: {
        CscSpinner,
        CscPage
    },
    data () {
        return {
            clirIntrapbx: false,
            isLoading: false
        }
    },
    computed: {
        fieldIcon () {
            if (!this.privacy) {
                return 'visibility'
            }
            return 'visibility_off'
        },
        ...mapState('callBlocking', [
            'privacy'
        ]),
        ...mapGetters('pbxSeats', [
            'getIntraPbx'
        ]),
        ...mapGetters('callBlocking', [
            'privacy',
            'privacyError',
            'privacyUpdated',
            'privacyLoadingState',
            'privacyLoading'
        ]),
        ...mapGetters('user', [
            'hasSubscriberProfileAttribute'
        ]),
        ...mapState('pbxSeats', [
            'seatUpdateState',
            'seatUpdateError'
        ]),
        showClir () {
            return this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.clir)
        },
        showClirIntrapbx () {
            return this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.clir_intrapbx)
        }
    },
    watch: {
        privacyUpdated (updated) {
            if (updated && this.privacy) {
                showToast(this.$t('Your number is hidden to the callee'))
            } else if (updated && !this.privacy) {
                showToast(this.$t('Your number is visible to the callee'))
            }
        },
        seatUpdateState (state) {
            switch (state) {
            case RequestState.requesting:
                this.requestInProgress(true)
                break
            case RequestState.succeeded :
                showToast(this.clirIntrapbx ? this.$t('Your number is hidden to the callee within own PBX') : this.$t('Your number is visible to the callee within own PBX'))
                this.requestInProgress(false)
                break
            case RequestState.failed :
                showGlobalError(this.seatUpdateError, 5000)
                this.requestInProgress(false)
                break
            }
        }
    },
    async mounted () {
        this.requestInProgress(true)
        const preferences = await this.loadPreferences(getSubscriberId())
        this.clirIntrapbx = preferences.clir_intrapbx || false
        this.requestInProgress(false)
        this.$store.dispatch('callBlocking/loadPrivacy')
    },
    methods: {
        ...mapActions('pbxSeats', [
            'setIntraPbx',
            'loadPreferences'
        ]),
        changeIntraPbx () {
            const msg = !this.clirIntrapbx ? this.$t('Your number is hidden to the callee within own PBX') : this.$t('Your number is visible to the callee within own PBX')
            this.setIntraPbx({
                seatId: getSubscriberId(),
                intraPbx: !this.clirIntrapbx,
                message: msg
            })
            this.clirIntrapbx = !this.clirIntrapbx
        },
        requestInProgress (loading) {
            this.isLoading = loading
        },
        toggle () {
            this.$store.dispatch('callBlocking/updatePrivacy', !this.privacy)
        }
    }
}
</script>
