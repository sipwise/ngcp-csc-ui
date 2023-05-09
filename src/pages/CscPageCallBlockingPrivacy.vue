<template>
    <csc-page
        id="csc-page-call-blocking-privacy"
        class="q-pa-lg row"
    >
        <q-list
            class="col col-xs-12 col-md-4"
        >
            <q-item
                v-if="hasSubscriberProfileAttribute('clir')"
            >
                <q-item-section>
                    <q-toggle
                        :label="privacyLabel"
                        :value="privacy || false"
                        :disable="privacyLoading"
                        checked-icon="visibility_off"
                        unchecked-icon="visibility"
                        @input="toggle()"
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
        </q-list>
    </csc-page>
</template>

<script>

import {
    mapGetters,
    mapState
} from 'vuex'
import {
    showToast
} from 'src/helpers/ui'
import CscPage from 'components/CscPage'
import CscSpinner from 'components/CscSpinner'
export default {
    name: 'CscPageCallBlockingPrivacy',
    components: {
        CscSpinner,
        CscPage
    },
    data () {
        return {}
    },
    computed: {
        privacyLabel () {
            if (this.privacy) {
                return this.$t('Your number is hidden to the callee')
            } else {
                return this.$t('Your number is visible to the callee')
            }
        },
        fieldIcon () {
            if (!this.privacy) {
                return 'visibility'
            } else {
                return 'visibility_off'
            }
        },
        ...mapState('callBlocking', [
            'privacy'
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
        ])
    },
    watch: {
        privacyUpdated (updated) {
            if (updated && this.privacy) {
                showToast(this.$t('Your number is hidden to the callee'))
            } else if (updated && !this.privacy) {
                showToast(this.$t('Your number is visible to the callee'))
            }
        }
    },
    mounted () {
        this.$store.dispatch('callBlocking/loadPrivacy')
    },
    methods: {
        toggle () {
            this.$store.dispatch('callBlocking/updatePrivacy', !this.privacy)
        }
    }
}
</script>
