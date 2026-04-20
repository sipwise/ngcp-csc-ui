<template>
    <div>
        <div class="column items-center q-gutter-md">
            <div>
                <q-tabs
                    v-model="cfType"
                    dense
                    align="left"
                    indicator-color="primary"
                    active-color="primary"
                    no-caps
                >
                    <q-tab
                        v-for="option in cfTypeOptions"
                        :key="option.value"
                        :name="option.value"
                        :label="option.label"
                    />
                </q-tabs>
            </div>
            <div class="row items-center justify-center full-width q-gutter-x-sm q-pb-md">
                <q-select
                    class="col-xs-12 col-md-3"
                    v-model="destinationType"
                    :label="$t('Forward to')"
                    :options="destinationTypeOptions"
                    option-value="value"
                    emit-value
                    map-options
                    data-cy="csc-cf-destination-type"
                >
                    <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                            <q-item-section avatar>
                                <q-icon color="primary" :name="scope.opt.icon" />
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>{{ scope.opt.label }}</q-item-label>
                                <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                            </q-item-section>
                        </q-item>
                    </template>
                </q-select>
                <q-slide-transition
                    v-if="isDestinationNumber"
                    class="col-xs-12 col-md-3">
                    <csc-input
                        :value="destinationNumber"
                        @input="destinationNumber = $event"
                        data-cy="csc-cf-destination-number"
                    />
                </q-slide-transition>
                <q-slide-transition
                    v-else-if="isDestinationCustomAnnouncement"
                    class="col-xs-12 col-md-3">
                    <q-select
                        class="col-xs-12 col-md-3"
                        v-model="customAnnouncement"
                        :label="$t('Custom Announcement')"
                        :options="announcements"
                        option-value="value"
                        emit-value
                        map-options
                        data-cy="csc-cf-custom-announcement"
                    />
                </q-slide-transition>
                <q-slide-transition
                    v-else-if="isDestinationSeat"
                    class="col-xs-12 col-md-3">
                    <csc-cf-seat-select
                        v-model="seatOption"
                        class="col-xs-12 col-md-3"
                        data-cy="csc-cf-seat-select"
                    />
                </q-slide-transition>
            </div>
        </div>

        <div
            class="row justify-center q-pt-md"
        >
            <q-btn
                flat
                color="default"
                icon="clear"
                :disable="loading"
                :label="$t('Cancel')"
                @click="cancel()"
                data-cy="csc-cf-cancel"
            />
            <q-btn
                flat
                color="primary"
                icon="person"
                :loading="loading"
                :disable="disableSaveButton()"
                :label="$t('Create Forwarding')"
                @click="save()"
                data-cy="csc-cf-save"
            />
        </div>
    </div>
</template>

<script setup>
import { useVuelidate } from '@vuelidate/core'
import { required, requiredIf } from '@vuelidate/validators'
import CscCfSeatSelect from 'components/call-forwarding/CscCfSeatSelect'
import CscInput from 'src/components/form/CscInput'
import { useUser } from 'src/composables/useUser'
import { DestinationType, getDestinationIcon } from 'src/helpers/destination'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

defineOptions({ name: 'CscCfAddForm' })

defineProps({
    loading: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['save', 'cancel'])

const { t } = useI18n()
const store = useStore()

const cfType = ref('cfu')
const destinationType = ref(null)
const destinationNumber = ref(null)
const customAnnouncement = ref(null)
const seatOption = ref(null)

const announcements = computed(() => store.state.callForwarding.announcements)

const { isSpCe, isPbxEnabled } = useUser()
const isDestinationNumber = computed(() => destinationType.value === 'number')
const isDestinationCustomAnnouncement = computed(() => destinationType.value === 'customhours')
const isDestinationSeat = computed(() => destinationType.value === 'seat')

// Rules and Validations

const rules = computed(() => ({
    destinationType: { required },
    cfType: { required },
    destinationNumber: {
        required: requiredIf(isDestinationNumber)
    },
    customAnnouncement: {
        required: requiredIf(isDestinationCustomAnnouncement)
    },
    seatOption: {
        required: requiredIf(isDestinationSeat)
    }
}))

const v$ = useVuelidate(
    rules,
    {
        destinationType,
        cfType,
        destinationNumber,
        customAnnouncement,
        seatOption
    })

// Computed properties

const cfTypeOptions = computed(() => [
    { label: t('Always'), value: 'cfu' },
    { label: t('If not available'), value: 'cfna' },
    { label: t('If busy'), value: 'cfb' },
    { label: t('On no answer'), value: 'cft' }
])

const destinationTypeOptions = computed(() => {
    const defaultOptions = [
        { label: t('Number'), icon: getDestinationIcon(DestinationType.Number), value: 'number' },
        { label: t('Voicebox'), icon: getDestinationIcon(DestinationType.VoiceBox), value: 'voicebox' },
        { label: t('Conference'), icon: getDestinationIcon(DestinationType.Conference), value: 'conference' },
        { label: t('Custom Announcement'), icon: getDestinationIcon(DestinationType.CustomAnnouncement), value: 'customhours' }
    ]

    const proOptions = [
        { label: t('Fax2Mail'), icon: getDestinationIcon(DestinationType.Fax2Mail), value: 'fax2mail' },
        { label: t('Calling Card'), icon: getDestinationIcon(DestinationType.CallingCard), value: 'callingcard' },
        { label: t('Call Through'), icon: getDestinationIcon(DestinationType.CallThrough), value: 'callthrough' }
    ]

    const pbxOptions = [
        { label: t('Seat'), icon: 'person', value: 'seat' },
        { label: t('Manager Secretary'), icon: getDestinationIcon(DestinationType.ManagerSecretary), value: 'managersecretary' },
        { label: t('Auto Attendant'), icon: getDestinationIcon(DestinationType.AutoAttendant), value: 'autoattendant' },
        { label: t('Office Hours Announcement'), icon: getDestinationIcon(DestinationType.OfficeHoursAnnouncement), value: 'officehours' }
    ]

    return [
        ...defaultOptions,
        ...(isSpCe.value ? [] : proOptions),
        ...(isPbxEnabled.value ? pbxOptions : [])
    ]
})

// Methods

function cancel () {
    emit('cancel')
}

function disableSaveButton () {
    return v$.value.$invalid
}

function resolveDestination () {
    if (isDestinationNumber.value) {
        return destinationNumber.value
    }
    if (isDestinationSeat.value) {
        return seatOption.value?.value
    }

    return destinationType.value
}

function save () {
    emit('save', {
        destination: resolveDestination(),
        announcementId: isDestinationCustomAnnouncement.value ? customAnnouncement.value : null,
        type: cfType.value,
        destinationType: destinationType.value
    })
}
</script>
