<template>
    <csc-page
        id="csc-page-pbx-settings-conference"
        class="row q-pa-lg"
    >
        <q-list
            class="col col-xs-12 col-md-6"
        >
            <div>
                <q-item v-if="showConferenceMaxParticipants">
                    <q-item-section>
                        <csc-input-saveable
                            v-model="changes.conferenceMaxParticipants"
                            :label="t('Maximum Conference Participants')"
                            data-cy="csc-conference-max-participants"
                            :value-changed="hasConferenceMaxParticipantsChanged"
                            :error="v$.conferenceMaxParticipants.$errors.length > 0"
                            :error-message="v$.conferenceMaxParticipants.$errors[0]?.$message ?? ''"
                            :loading="isConferenceMaxParticipantsLoading"
                            @undo="resetConferenceMaxParticipants"
                            @save="saveConferenceMaxParticipants"
                            @input="v$.conferenceMaxParticipants.$touch()"
                            @keypress.space.prevent
                            @keydown.space.prevent
                            @keyup.space.prevent
                        />
                    </q-item-section>
                </q-item>
                <q-item v-if="showConferencePin">
                    <q-item-section>
                        <csc-input-saveable
                            v-model="changes.conferencePin"
                            :label="t('Conference PIN')"
                            data-cy="csc-conference-pin"
                            :value-changed="hasConferencePinChanged"
                            :error="v$.conferencePin.$errors.length > 0"
                            :error-message="v$.conferencePin.$errors[0]?.$message ?? ''"
                            :loading="isConferencePinLoading"
                            @undo="resetConferencePin"
                            @save="saveConferencePin"
                            @input="v$.conferencePin.$touch()"
                            @keypress.space.prevent
                            @keydown.space.prevent
                            @keyup.space.prevent
                        />
                    </q-item-section>
                </q-item>
            </div>
        </q-list>
    </csc-page>
</template>

<script setup>
import { useVuelidate } from '@vuelidate/core'
import { helpers, numeric } from '@vuelidate/validators'
import CscPage from 'components/CscPage'
import CscInputSaveable from 'components/form/CscInputSaveable'
import { useWait } from 'src/composables/useWait'
import { PROFILE_ATTRIBUTE_MAP } from 'src/constants'
import { showToast } from 'src/helpers/ui'
import {
    computed,
    onMounted,
    reactive,
    ref
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

defineOptions({ name: 'CscPagePbxSettingsConference' })

function normalizePreference (value) {
    return value === null || value === undefined ? '' : value.toString()
}

const WAITERS = {
    loadPreferences: 'csc-pbx-call-settings-load-preferences',
    updateConferenceMaxParticipants: 'csc-pbx-call-settings-update-conference-max-participants',
    updateConferencePin: 'csc-pbx-call-settings-update-conference-pin'
}

const store = useStore()
const wait = useWait()
const { t } = useI18n()

const isInitialized = ref(false)
const changes = reactive({
    conferenceMaxParticipants: '',
    conferencePin: ''
})

const subscriberPreferences = computed(() => store.state.callSettings.subscriberPreferences)
const hasSubscriberProfileAttribute = computed(() => store.getters['user/hasSubscriberProfileAttribute'])

const rules = computed(() => ({
    conferenceMaxParticipants: {
        numeric: helpers.withMessage(
            () => t('{field} must consist of numeric characters only', { field: t('Maximum Conference Participants') }),
            numeric
        )
    },
    conferencePin: {
        numeric: helpers.withMessage(
            () => t('{field} must consist of numeric characters only', { field: t('Conference PIN') }),
            numeric
        )
    }
}))

const v$ = useVuelidate(rules, changes)

const showConferenceMaxParticipants = computed(() => hasSubscriberProfileAttribute.value(PROFILE_ATTRIBUTE_MAP.conferenceMaxParticipants))
const showConferencePin = computed(() => hasSubscriberProfileAttribute.value(PROFILE_ATTRIBUTE_MAP.conferencePin))
const currentConferenceMaxParticipants = computed(() => normalizePreference(subscriberPreferences.value.conference_max_participants))
const currentConferencePin = computed(() => normalizePreference(subscriberPreferences.value.conference_pin))
const hasConferenceMaxParticipantsChanged = computed(() => isInitialized.value && changes.conferenceMaxParticipants !== currentConferenceMaxParticipants.value)
const hasConferencePinChanged = computed(() => isInitialized.value && changes.conferencePin !== currentConferencePin.value)
const isLoading = computed(() => wait.is(WAITERS.loadPreferences))
const isConferenceMaxParticipantsUpdating = computed(() => wait.is(WAITERS.updateConferenceMaxParticipants))
const isConferencePinUpdating = computed(() => wait.is(WAITERS.updateConferencePin))
const isConferenceMaxParticipantsLoading = computed(() => isLoading.value || isConferenceMaxParticipantsUpdating.value)
const isConferencePinLoading = computed(() => isLoading.value || isConferencePinUpdating.value)

function applyDefaultData () {
    changes.conferenceMaxParticipants = currentConferenceMaxParticipants.value
    changes.conferencePin = currentConferencePin.value
}

function resetConferenceMaxParticipants () {
    changes.conferenceMaxParticipants = currentConferenceMaxParticipants.value
}

function resetConferencePin () {
    changes.conferencePin = currentConferencePin.value
}

async function saveConferenceMaxParticipants () {
    if (hasConferenceMaxParticipantsChanged.value && v$.value.conferenceMaxParticipants.$errors.length <= 0) {
        wait.start(WAITERS.updateConferenceMaxParticipants)
        try {
            await store.dispatch('callSettings/fieldUpdateAction', {
                field: 'conference_max_participants',
                value: changes.conferenceMaxParticipants
            })
            resetConferenceMaxParticipants()
            showToast(t('Updated {field} successfully', {
                field: t('Maximum Conference Participants')
            }))
        } finally {
            wait.end(WAITERS.updateConferenceMaxParticipants)
        }
    }
}

async function saveConferencePin () {
    if (hasConferencePinChanged.value && v$.value.conferencePin.$errors.length <= 0) {
        wait.start(WAITERS.updateConferencePin)
        try {
            await store.dispatch('callSettings/fieldUpdateAction', {
                field: 'conference_pin',
                value: changes.conferencePin
            })
            resetConferencePin()
            showToast(t('Updated {field} successfully', {
                field: t('Conference PIN')
            }))
        } finally {
            wait.end(WAITERS.updateConferencePin)
        }
    }
}

onMounted(async () => {
    wait.start(WAITERS.loadPreferences)
    try {
        await store.dispatch('callSettings/loadSubscriberPreferencesAction')
        applyDefaultData()
        isInitialized.value = true
    } finally {
        wait.end(WAITERS.loadPreferences)
    }
})
</script>
