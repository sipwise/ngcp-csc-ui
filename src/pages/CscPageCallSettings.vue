<template>
	<csc-page
		id="csc-page-voicebox"
		class="row q-pa-lg"
	>
		<q-list
			class="col col-xs-12 col-md-6"
		>
			<q-item>
				<q-item-section>
					<q-toggle
						:value="musicOnHold"
						:disable="dataLoading"
						:label="$t('callSettings.musicOnHold')"
						:title="$t('callSettings.musicOnHoldHint')"
						checked-icon="audiotrack"
						unchecked-icon="audiotrack"
						@input="toggleMusicOnHold"
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
			<q-item>
				<q-item-section>
					<q-select
						v-model="selectedOption"
						dense
						emit-value
						map-options
						:disable="dataLoading"
						:readonly="dataLoading"
						:label="$t('callSettings.language')"
						:title="$t('callSettings.languageHint')"
						:options="options"
						@input="languageSelected()"
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
	data () {
		return {
			selectedOption: this.$defaultVoicePromptLanguage,
			options: []
		}
	},
	computed: {
		...mapState('callSettings', [
			'subscriberPreferencesInitialized'
		]),
		...mapGetters('callSettings', [
			'musicOnHold',
			'language',
			'defaultLanguage',
			'languages'
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
			await this.loadSubscriberPreferencesAction()
			this.options = await this.languages
			this.selectedOption = this.language || await this.defaultLanguage
		} catch (err) {
			showGlobalError(err?.message || this.$t('Unknown error'))
		}
	},
	methods: {
		...mapWaitingActions('callSettings', {
			loadSubscriberPreferencesAction: 'processing subscriberPreferences',
			setMusicOnHold: 'processing subscriberPreferences',
			setLanguage: 'processing subscriberPreferences'
		}),
		async toggleMusicOnHold () {
			try {
				await this.setMusicOnHold(!this.musicOnHold)
			} catch (err) {
				showGlobalError(err?.message || this.$t('Unknown error'))
			}
		},
		async languageSelected () {
			try {
				await this.setLanguage(this.selectedOption)
			} catch (err) {
				showGlobalError(err?.message || this.$t('Unknown error'))
			}
		}
	}
}
</script>
