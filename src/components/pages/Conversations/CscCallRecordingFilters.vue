<template>
    <div>
        <div
            class="row justify-center full-width q-gutter-x-sm"
        >
            <div
                class="col-xs-12 col-md-3"
            >
                <q-select
                    v-model="filterType"
                    emit-value
                    map-options
                    dense
                    :options="filterTypeOptions"
                    :label="t('Filter by')"
                    data-cy="csc-recording-filter"
                    :disable="loading"
                />
            </div>
            <div
                v-if="filterType === 'timerange'"
                class="row col-xs-12 col-md-6"
            >
                <q-input
                    v-for="(name, index) in dateFields"
                    :key="name"
                    v-model="dateInputs[name]"
                    class="col-6"
                    :class="{ 'q-pr-sm': index === 0 }"
                    dense
                    :disable="loading"
                    :label="filterLabels[name]"
                    :data-cy="`csc-recording-filter-time-${index === 0 ? 'start' : 'end'}`"
                >
                    <template #prepend>
                        <q-icon
                            name="event"
                            class="cursor-pointer"
                            @click="loadFormattedDate(name)"
                        >
                            <q-popup-proxy
                                transition-show="scale"
                                transition-hide="scale"
                                @hide="addFilter(name, dateInputs[name])"
                            >
                                <q-date
                                    v-model="dateInputs[name]"
                                    mask="YYYY-MM-DD HH:mm"
                                    format24h
                                >
                                    <div class="row items-center justify-end">
                                        <q-btn
                                            v-close-popup
                                            :label="t('Close')"
                                            color="primary"
                                            flat
                                        />
                                    </div>
                                </q-date>
                            </q-popup-proxy>
                        </q-icon>
                    </template>

                    <template #append>
                        <q-icon
                            name="access_time"
                            class="cursor-pointer"
                        >
                            <q-popup-proxy
                                transition-show="scale"
                                transition-hide="scale"
                                @hide="addFilter(name, dateInputs[name])"
                            >
                                <q-time
                                    v-model="dateInputs[name]"
                                    mask="YYYY-MM-DD HH:mm"
                                    format24h
                                >
                                    <div class="row items-center justify-end">
                                        <q-btn
                                            v-close-popup
                                            :label="t('Close')"
                                            color="primary"
                                            flat
                                        />
                                    </div>
                                </q-time>
                            </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>
            </div>
            <div
                v-else-if="filterType !== null"
                class="row col-xs-12 col-md-3"
            >
                <q-input
                    v-model="typedFilter"
                    class="q-pr-sm col-12"
                    dense
                    :disable="loading"
                    :label="filterLabels[filterType]"
                    data-cy="csc-recording-filter-input"
                    @keypress.enter="triggerFilter"
                    @keydown.space.prevent
                >
                    <template #append>
                        <q-icon
                            name="search"
                            class="cursor-pointer"
                            @click="triggerFilter"
                        />
                    </template>
                </q-input>
            </div>
        </div>
        <div
            class="row justify-center full-width q-gutter-x-sm"
        >
            <div
                class="col-xs-12 col-md-4"
            >
                <q-chip
                    v-for="(value, name) in filters"
                    :key="name"
                    :label="`${filterLabels[name]}: ${value}`"
                    icon="filter_alt"
                    removable
                    dense
                    color="primary"
                    text-color="dark"
                    @remove="removeFilter(name)"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { useStore } from 'src/composables/useStore'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'CscCallRecordingFilters' })

defineProps({
    loading: {
        type: Boolean,
        default: false
    }
})
const emit = defineEmits(['filter'])
const { t } = useI18n()
const store = useStore()
const filterType = ref(null)
const typedFilter = ref(null)
const dateFields = ['startTime', 'endTime']
const dateInputs = ref({})
const filters = ref({})
const filterLabels = computed(() => ({
    timerange: t('Timerange'),
    caller: t('Caller'),
    callee: t('Callee'),
    callId: t('CallID'),
    startTime: t('Start time'),
    endTime: t('End time')
}))
const filterTypeOptions = computed(() => ['timerange', 'caller', 'callee', 'callId'].map((value) => ({
    label: filterLabels.value[value], value
})))

watch(filterType, resetInputs)

function triggerFilter () {
    addFilter(filterType.value, typedFilter.value)
}

function removeFilter (name) {
    delete filters.value[name]
    emitFilters()
}

function removeFilters () {
    if (Object.keys(filters.value).length) {
        filters.value = {}
        emitFilters()
    }
}

function addFilter (name, value) {
    const trimmed = String(value ?? '').trim()
    if (trimmed) {
        resetInputs()
        filters.value[name] = trimmed
        emitFilters()
    }
}

function emitFilters () {
    emit('filter', { ...filters.value })
}

function resetInputs () {
    typedFilter.value = null
    dateInputs.value = {}
}

function loadFormattedDate (name) {
    if (!dateInputs.value[name]) {
        dateInputs.value[name] = store.getters.getCurrentFormattedDateWithDashAndHour
    }
}

defineExpose({ removeFilters })
</script>
