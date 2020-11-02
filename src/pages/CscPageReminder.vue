<template>
	<csc-page
		id="csc-page-reminder"
		class="q-pa-lg row"
	>
		<q-list
			class="col col-xs-12 col-md-4"
		>
			<q-item>
				<q-item-section>
					<q-toggle
						:disable="isReminderLoading"
						:label="toggleLabel"
						:value="isReminderActive"
						checked-icon="notifications_active"
						unchecked-icon="notifications_off"
						@input="toggleReminder"
					/>
				</q-item-section>
				<q-item-section
					side
				>
					<csc-spinner
						v-if="isReminderLoading"
						class="self-center"
					/>
				</q-item-section>
			</q-item>
			<q-item>
				<q-item-section>
					<div
						class="q-gutter-sm"
					>
						<q-radio
							v-for="(recurrenceOption, index) in recurrenceOptions"
							:key="index"
							:value="reminderRecurrence"
							:val="recurrenceOption.value"
							:label="recurrenceOption.label"
							@input="updateRecurrence"
						/>
					</div>
				</q-item-section>
			</q-item>
			<q-item>
				<q-item-section>
					<q-input
						:value="reminderTime"
						:loading="isReminderLoading"
						fill-mask="_"
						mask="##:##"
						dense
						@focus="$refs.timePopup.show()"
					>
						<template
							v-slot:loading
						>
							<q-spinner-dots
								color="primary"
							/>
						</template>
						<template
							v-slot:prepend
						>
							<q-btn
								icon="access_alarm"
								color="primary"
								flat
								dense
							>
								<q-popup-proxy
									ref="timePopup"
								>
									<q-time
										:value="reminderTime"
										format24h
										now-btn
										flat
										mask="HH:mm"
										color="primary"
										@input="timeUpdate"
									/>
								</q-popup-proxy>
							</q-btn>
						</template>
					</q-input>
				</q-item-section>
			</q-item>
		</q-list>
	</csc-page>
</template>

<script>
import {
	mapGetters,
	mapActions
} from 'vuex'
import CscPage from 'components/CscPage'
import {
	showToast
} from 'src/helpers/ui'
import {
	date
} from 'quasar'
import CscSpinner from 'components/CscSpinner'

export default {
	name: 'CscPageReminder',
	components: {
		CscSpinner,
		CscPage
	},
	data () {
		return {
		}
	},
	computed: {
		...mapGetters('reminder', [
			'isReminderActive',
			'reminderTime',
			'reminderRecurrence',
			'reminderLoadingState',
			'reminderUpdating',
			'reminderError',
			'isReminderLoading',
			'reminderUpdated'
		]),
		recurrenceOptions () {
			return [
				{
					label: this.$t('pages.reminder.recurrence.once'),
					value: 'never',
					icon: 'looks_one'
				},
				{
					label: this.$t('pages.reminder.recurrence.weekdays'),
					value: 'weekdays'
				},
				{
					label: this.$t('pages.reminder.recurrence.always'),
					value: 'always'
				}
			]
		},
		toggleLabel () {
			if (this.isReminderActive) {
				return this.$t('pages.reminder.toggleEnabled')
			} else {
				return this.$t('pages.reminder.toggleDisabled')
			}
		}
	},
	watch: {
		reminderUpdated (updated) {
			if (updated && this.reminderUpdating === 'active' && this.isReminderActive) {
				showToast(this.$t('pages.reminder.enabledToast'))
			} else if (updated && this.reminderUpdating === 'active') {
				showToast(this.$t('pages.reminder.disabledToast'))
			} else if (updated && this.reminderUpdating === 'time') {
				showToast(this.$t('pages.reminder.timeChangedToast', {
					time: this.reminderTime
				}))
			} else if (updated && this.reminderUpdating === 'recurrence') {
				showToast(this.$t('pages.reminder.recurrenceChangedToast', {
					recurrence: this.mapRecurrence(this.reminderRecurrence)
				}))
			}
		}
	},
	mounted () {
		this.loadReminder()
	},
	methods: {
		...mapActions('reminder', [
			'loadReminder',
			'toggleReminder',
			'updateTime',
			'updateRecurrence'
		]),
		timeUpdate (time) {
			this.$refs.timePopup.hide()
			this.updateTime(time)
		},
		mapRecurrence (recurrence) {
			switch (recurrence) {
			case 'never':
				return this.$t('pages.reminder.recurrence.once')
			case 'weekdays':
				return this.$t('pages.reminder.recurrence.weekdays')
			case 'always':
				return this.$t('pages.reminder.recurrence.always')
			}
		},
		dateFormat (dateTime, format) {
			return date.formatDate(dateTime, format)
		}
	}
}
</script>
