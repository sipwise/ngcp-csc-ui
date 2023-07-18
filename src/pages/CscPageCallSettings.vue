<template>
    <csc-page
        id="csc-page-voicebox"
        class="row q-pa-lg"
    >
        <q-list
            class="col col-xs-12 col-md-6"
        >
            <q-item
                v-if="hasSubscriberProfileAttribute('music_on_hold')"
            >
                <q-item-section>
                    <q-toggle
                        :model-value="musicOnHold"
                        :disable="dataLoading"
                        :label="$t('Music on Hold')"
                        :title="$t('&quot;Music on Hold&quot; - if set to true and a music on hold file is provided, a calling party gets that file played when put on hold')"
                        data-cy="music-on-hold"
                        checked-icon="audiotrack"
                        unchecked-icon="audiotrack"
                        @update:model-value="toggleMusicOnHold"
                    />
                </q-item-section>
                <q-item-section
                    side
                >
                    <csc-spinner
                        v-if="dataLoading"
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
    mapWaitingActions,
    mapWaitingGetters
} from 'vue-wait'
import {
    showGlobalError
} from 'src/helpers/ui'
import CscPage from 'components/CscPage'
import CscSpinner from 'components/CscSpinner'
export default {
    name: 'CscPageCallSettings',
    components: {
        CscSpinner,
        CscPage
    },
    computed: {
        ...mapState('callSettings', [
            'subscriberPreferencesInitialized'
        ]),
        ...mapGetters('callSettings', [
            'musicOnHold'
        ]),
        ...mapGetters('user', [
            'hasSubscriberProfileAttribute'
        ]),
        ...mapWaitingGetters({
            processingSubscriberPreferences: 'processing subscriberPreferences'
        }),
        dataLoading () {
            return !this.subscriberPreferencesInitialized || this.processingSubscriberPreferences
        }
    },
    async mounted () {
        try {
            await this.loadPreferencesDefsAction()
            await this.loadSubscriberPreferencesAction()
            this.selectedOption = this.language || this.defaultLanguage
        } catch (err) {
            showGlobalError(err?.message || this.$t('Unknown error'))
        }
    },
    methods: {
        ...mapWaitingActions('callSettings', {
            loadPreferencesDefsAction: 'processing subscriberPreferences',
            loadSubscriberPreferencesAction: 'processing subscriberPreferences',
            setMusicOnHold: 'processing subscriberPreferences'
        }),
        async toggleMusicOnHold () {
            try {
                await this.setMusicOnHold(!this.musicOnHold)
            } catch (err) {
                showGlobalError(err?.message || this.$t('Unknown error'))
            }
        }
    }
}
</script>
