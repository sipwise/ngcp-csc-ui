<template>
    <div
        id="csc-page-call-recording"
    >
        <csc-dialog-transcript
            ref="transcriptDialog"
            :full-width="isTranscriptReady"
            :text="getTranscriptText"
            :status="getTranscriptStatus"
            :is-loading="isLoadingTranscript"
            @hide="hideTranscriptDialog"
        />
        <div class="q-pa-md">
            <q-table
                v-model:pagination="pagination"
                v-model:expanded="expandedRows"
                :rows-per-page-options="ROWS_PER_PAGE_OPTIONS"
                class="no-shadow"
                :rows="recordings"
                :columns="columns"
                :loading="loadingRecordings"
                row-key="id"
                flat
                @request="fetchPaginatedRecordings"
            >
                <template #header="props">
                    <q-tr :props="props">
                        <q-th auto-width />
                        <q-th
                            v-for="col in props.cols"
                            :key="col.name"
                            :props="props"
                            class="table-th"
                        >
                            {{ col.label }}
                        </q-th>
                        <q-th auto-width />
                    </q-tr>
                </template>
                <template
                    #body="props"
                >
                    <q-tr
                        :props="props"
                    >
                        <q-td auto-width />
                        <q-td
                            v-for="col in props.cols"
                            :key="col.name"
                            :props="props"
                        >
                            {{ col.value }}
                        </q-td>
                        <q-td>
                            <q-btn
                                color="negative"
                                icon="delete"
                                flat
                                @click="confirmRowDeletion(props.row.id)"
                            />
                            <q-btn
                                size="md"
                                color="primary"
                                round
                                flat
                                :icon="props.expand ? 'expand_less' : 'expand_more'"
                                @click="toggleRecording(props)"
                            />
                        </q-td>
                    </q-tr>
                    <q-tr
                        v-show="props.expand"
                        no-hover
                    >
                        <q-td
                            colspan="100%"
                            class="table-td-no-padding"
                        >
                            <q-table
                                :rows="props.row.files"
                                :columns="filesColumns"
                                :loading="loadingRecordings && isWaiting('loading-stream-' + props.row.id)"
                                :hide-pagination="true"
                                row-key="id"
                                class="csc-item-odd no-shadow"
                            >
                                <template #loading>
                                    <q-inner-loading
                                        showing
                                        color="primary"
                                    />
                                </template>
                                <template #header="innerProps">
                                    <q-tr :props="innerProps">
                                        <q-th auto-width />
                                        <q-th
                                            v-for="col in innerProps.cols"
                                            :key="col.name"
                                            :props="innerProps"
                                        >
                                            {{ col.label }}
                                        </q-th>
                                        <q-th auto-width />
                                    </q-tr>
                                </template>
                                <template #body="innerProps">
                                    <q-tr :props="innerProps">
                                        <q-td auto-width />
                                        <q-td
                                            v-for="col in innerProps.cols"
                                            :key="col.name"
                                            :props="innerProps"
                                        >
                                            {{ col.value }}
                                        </q-td>
                                        <q-td
                                            class="row justify-end table-td-action-cont"
                                        >
                                            <q-btn
                                                size="md"
                                                color="primary"
                                                icon="description"
                                                dense
                                                class="download-btn"
                                                flat
                                                @click="getTranscript(innerProps.row)"
                                            />
                                            <csc-audio-player
                                                :pausable="true"
                                                class="player-btns"
                                                :file-url="innerProps.row.url"
                                                @load="fetchFile({
                                                    recordingId: props.row.id,
                                                    streamId: innerProps.row.id
                                                })"
                                            />
                                            <q-btn
                                                size="md"
                                                color="primary"
                                                icon="download"
                                                dense
                                                flat
                                                class="download-btn"
                                                @click="saveFile(innerProps.row.id)"
                                            />
                                        </q-td>
                                    </q-tr>
                                </template>
                            </q-table>
                        </q-td>
                    </q-tr>
                </template>
            </q-table>
        </div>
    </div>
</template>

<script setup>
import CscAudioPlayer from 'components/CscAudioPlayer'
import CscDialogTranscript from 'components/CscDialogTranscript'
import CscRemoveDialog from 'components/CscRemoveDialog'
import { saveAs } from 'file-saver'
import moment from 'moment'
import { useQuasar } from 'quasar'
import { ROWS_PER_PAGE_OPTIONS, TABLE_ROWS_PER_PAGE_DEFAULT } from 'src/api/common'
import { useActions, useGetters, useState } from 'src/composables/useStore'
import { useWait } from 'src/composables/useWait'
import { showGlobalError, showToast } from 'src/helpers/ui'
import {
    computed,
    onMounted,
    ref,
    watch
} from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'CscCallRecordings' })

const props = defineProps({
    filter: {
        type: Object,
        default: () => ({})
    }
})
const { t } = useI18n()
const $q = useQuasar()
const { is, waitAction, waitFor } = useWait()
const loadingRecordings = is('csc-call-recordings')
const isWaiting = useGetters('wait', 'is')
const recordings = useGetters('conversations', 'recordings')
const getSubscriber = useGetters('user', 'getSubscriber')
const { getTranscriptText, getTranscriptStatus } = useGetters('transcriptions', [
    'getTranscriptText', 'getTranscriptStatus'
])
const transcriptState = useState('transcriptions', 'transcriptState')
const { clearTranscriptData, getCallRecordingsTranscript } = useActions('transcriptions', [
    'clearTranscriptData', 'getCallRecordingsTranscript'
])
const fetchRecordings = waitAction('conversations', 'fetchRecordings', 'csc-call-recordings')
const fetchStreams = waitAction('conversations', 'fetchStreams', 'csc-call-recordings')
const deleteRecording = waitAction('conversations', 'deleteRecording', 'csc-call-recordings')
const downloadRecording = waitAction('conversations', 'downloadRecording', 'csc-call-recordings')
const fetchFile = waitAction('conversations', 'fetchFile', 'csc-call-recordings')
const transcriptDialog = ref(null)
const expandedRows = ref([])
const pagination = ref({
    sortBy: 'id',
    descending: false,
    page: 1,
    rowsPerPage: TABLE_ROWS_PER_PAGE_DEFAULT,
    rowsNumber: 0
})
const isLoadingTranscript = computed(() => transcriptState.value === 'requesting')
const isTranscriptReady = computed(() => getTranscriptStatus.value === 'done')

const columns = computed(() => [
    {
        name: 'id',
        required: true,
        label: t('Id'),
        align: 'left',
        field: 'id',
        sortable: true
    },
    {
        name: 'time',
        required: true,
        align: 'left',
        label: t('Time'),
        field: (row) => {
            const momentDate = moment.utc(row.time, 'YYYY-MM-DD HH:mm:SS')
            return momentDate.format('LLL')
        },
        sortable: true
    },
    {
        name: 'caller',
        required: true,
        align: 'left',
        label: t('Caller'),
        field: (row) => displayNumber(row.caller),
        sortable: true
    },
    {
        name: 'callee',
        required: true,
        align: 'left',
        label: t('Callee'),
        field: (row) => displayNumber(row.callee),
        sortable: true
    }
])
const filesColumns = computed(() => [
    {
        name: 'id',
        required: true,
        label: '#',
        align: 'left',
        field: 'id'
    },
    {
        name: 'type',
        required: true,
        align: 'left',
        label: t('Type'),
        field: 'type'
    },
    {
        name: 'format',
        required: true,
        align: 'left',
        label: t('Format'),
        field: 'format'
    }

])

watch(() => props.filter, () => {
    fetchPaginatedRecordings({ pagination: pagination.value })
}, { deep: true })

watch(recordings, () => {
    expandedRows.value = []
})

onMounted(() => fetchPaginatedRecordings({ pagination: pagination.value }))

async function fetchPaginatedRecordings ({ pagination: requestedPagination }) {
    const { page, rowsPerPage, sortBy, descending } = requestedPagination
    const { startTime, endTime, caller, callee, callId } = props.filter
    const count = await fetchRecordings({
        page,
        rows: rowsPerPage,
        order_by: sortBy,
        order_by_direction: descending ? 'desc' : 'asc',
        start_time: startTime,
        end_time: endTime,
        caller: caller ? `*${caller}*` : undefined,
        callee: callee ? `*${callee}*` : undefined,
        call_id: callId ? `*${callId}*` : undefined
    })
    pagination.value = { ...requestedPagination, rowsNumber: count }
}

function confirmRowDeletion (rowId) {
    $q.dialog({
        component: CscRemoveDialog,
        componentProps: {
            title: t('Delete recording'),
            message: t('You are about to delete recording #{id}', { id: rowId })
        }
    }).onOk(() => deleteRecord(rowId))
}

async function deleteRecord (rowId) {
    try {
        await deleteRecording(rowId)
        showToast(t('Recording successfully deleted'))
        await fetchPaginatedRecordings({ pagination: pagination.value })
    } catch (err) {
        showGlobalError(t('Something went wrong. Please retry later'))
    }
}

function getTranscript (data) {
    getCallRecordingsTranscript({
        transcript: data.transcript,
        transcriptStatus: data.transcript_status
    })
    transcriptDialog.value.show()
}

function hideTranscriptDialog () {
    transcriptDialog.value.hide()
    clearTranscriptData()
}

function displayNumber (number) {
    const { cc, ac, sn } = getSubscriber.value.primary_number
    return number && number === cc + ac + sn ? t('Me') : number
}

async function toggleRecording (rowProps) {
    const expanded = !rowProps.expand
    rowProps.expand = expanded
    const { id, files } = rowProps.row
    if (expanded && files.length === 0) {
        await waitFor(`loading-stream-${id}`, () => fetchStreams(id))
    }
}

async function saveFile (fileId) {
    const file = await downloadRecording(fileId)
    saveAs(file, `call-recording-${fileId}.wav`)
}
</script>

<style lang="sass" rel="stylesheet/sass" scoped>
.table-th
    font-size: 15px
.table-td-no-padding
    padding: 0px !important // needed to override .q-table td
.table-td-action-cont
    min-width: 170px
    .player-btns
        bottom: 9px
        left: 8px
    .download-btn
        height: 30px

</style>
