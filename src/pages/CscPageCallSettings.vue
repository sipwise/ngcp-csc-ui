<template>
    <csc-page
        id="csc-page-voicebox"
        class="row q-pa-lg"
    >
        <q-list
            class="col col-xs-12 col-md-6"
        >
            <q-item>
                <q-item-section
                    v-if="showToggles"
                >
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
import CscPage from 'components/CscPage'
import CscSpinner from 'components/CscSpinner'
import { PROFILE_ATTRIBUTES_MAP } from 'src/constants'
import { showGlobalError } from 'src/helpers/ui'
import {
    mapWaitingActions,
    mapWaitingGetters
} from 'vue-wait'
import { mapGetters, mapState } from 'vuex'
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
            'hasSomeSubscriberProfileAttributes'
        ]),
        ...mapWaitingGetters({
            processingSubscriberPreferences: 'processing subscriberPreferences'
        }),
        dataLoading () {
            return !this.subscriberPreferencesInitialized || this.processingSubscriberPreferences
        },
        showToggles () {
            return this.hasSomeSubscriberProfileAttributes(PROFILE_ATTRIBUTES_MAP.callSettings)
        },
        musicOnHoldValue () {
            return this.musicOnHold || false
        },
        dndValue () {
            return this.dnd || false
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
