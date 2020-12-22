
<template>
	<csc-page
		id="csc-page-pbx-settings"
		class="q-pa-lg"
	>
		<q-list>
			<q-item>
				<q-item-section
					side
				>
					<q-toggle
						v-model="clirIntrapbx"
						:disabled="isLoading"
						class="csc-pbx-settings-toggle"
						:label="clirIntrapbx ? $t('Your number is hidden to the callee within own PBX') : $t('Your number is visible to the callee within own PBX')"
						checked-icon="visibility_off"
						unchecked-icon="visibility"
						@input="changeIntraPbx"
					/>
				</q-item-section>
				<q-item-section
					class="text-right"
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
import { mapState, mapActions, mapGetters } from 'vuex'
import CscPage from 'components/CscPage'
import {
	showGlobalError,
	showToast
} from 'src/helpers/ui'
import {
	RequestState
} from 'src/store/common'
import CscSpinner from 'components/CscSpinner'
import { getSubscriberId } from 'src/auth'
export default {
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
		...mapGetters('pbxSeats', [
			'getIntraPbx'
		]),
		...mapState('pbxSeats', [
			'seatUpdateState',
			'seatUpdateError'
		])
	},
	watch: {
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
		this.clirIntrapbx = preferences.clir_intrapbx
		this.requestInProgress(false)
	},
	methods: {
		...mapActions('pbxSeats', [
			'setIntraPbx',
			'loadPreferences'
		]),
		changeIntraPbx () {
			const msg = this.clirIntrapbx ? this.$t('Your number is hidden to the callee within own PBX') : this.$t('Your number is visible to the callee within own PBX')
			this.setIntraPbx({
				seatId: getSubscriberId(),
				intraPbx: this.clirIntrapbx,
				message: msg
			})
		},
		requestInProgress (loading) {
			this.isLoading = loading
		}
	}
}
</script>
