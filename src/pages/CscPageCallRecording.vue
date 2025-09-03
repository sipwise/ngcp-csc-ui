<!-- eslint-disable vue/no-v-model-argument -->
<template>
    <csc-page-sticky
        id="csc-page-call-recording"
    >
        <template
            #header
        >
            <q-btn
                v-if="!showFilters"
                icon="filter_alt"
                color="primary"
                flat
                :label="$t('Filter')"
                @click="openFilters"
            />
            <q-btn
                v-if="showFilters"
                icon="clear"
                color="negative"
                flat
                :label="$t('Close filters')"
                @click="closeFilters"
            />
        </template>
        <template
            #toolbar
        >
            <csc-call-recording-filters
                v-if="showFilters"
                ref="filters"
                class="q-mb-md q-pa-md"
                @filter="filterEvent"
            />
        </template>
        <div>
            <div class="q-pa-md">
                <q-table
                    v-model:pagination="pagination"
                    class="no-shadow"
                    :rows="data"
                    :columns="columns"
                    :loading="$wait.is('csc-call-recordings')"
                    row-key="name"
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
                                    :icon="isRowExpanded(props.row.id) ? 'expand_less' : 'expand_more'"
                                    @click="updateCollapseArray(props.row.id)"
                                />
                            </q-td>
                        </q-tr>
                        <q-tr
                            v-show="isRowExpanded(props.row.id)"
                            no-hover
                        >
                            <q-td
                                colspan="100%"
                                class="table-td-no-padding"
                            >
                                <q-table
                                    :rows="props.row.files"
                                    :columns="filesColumns"
                                    :loading="$wait.is('csc-call-recordings') && $wait.is('loading-stream-' + props.row.id)"
                                    :hide-pagination="true"
                                    row-key="name"
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
                                                <csc-audio-player
                                                    :pausable="true"
                                                    class="player-btns"
                                                    :file-url="innerProps.row.url"
                                                    @load="fetchFile({
                                                        recId: props.row.id,
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
    </csc-page-sticky>
</template>

<script>
import { mapGetters } from 'vuex'
import { mapWaitingActions } from 'vue-wait'
import { saveAs } from 'file-saver'
import { showGlobalError, showToast } from 'src/helpers/ui'
import CscAudioPlayer from 'components/CscAudioPlayer'
import CscPageSticky from 'components/CscPageSticky'
import CscCallRecordingFilters from 'components/pages/CallRecording/CscCallRecordingFilters'
import CscRemoveDialog from 'components/CscRemoveDialog'
import { LIST_DEFAULT_ROWS } from 'src/api/common'
import moment from 'moment'
export default {
    name: 'CscPageCallRecording',
    components: {
        CscAudioPlayer,
        CscPageSticky,
        CscCallRecordingFilters
    },
    data () {
        return {
            columns: [
                {
                    name: 'id',
                    required: true,
                    label: this.$t('Id'),
                    align: 'left',
                    field: row => row.id,
                    format: val => `${val}`,
                    sortable: true
                },
                {
                    name: 'time',
                    required: true,
                    align: 'left',
                    label: this.$t('Time'),
                    field: row => {
                        const momentDate = moment.utc(row.time, 'YYYY-MM-DD HH:mm:SS')
                        return momentDate.format('LLL')
                    },
                    sortable: true
                },
                {
                    name: 'caller',
                    required: true,
                    align: 'left',
                    label: this.$t('Caller'),
                    field: row => (!row.callerName) ? row.caller : row.callerName,
                    sortable: true
                },
                {
                    name: 'callee',
                    required: true,
                    align: 'left',
                    label: this.$t('Callee'),
                    field: row => (!row.calleeName) ? row.callee : row.calleeName,
                    sortable: true
                }
            ],
            filesColumns: [
                {
                    name: 'id',
                    required: true,
                    label: '#',
                    align: 'left',
                    field: row => row.id,
                    format: val => `${val}`
                },
                {
                    name: 'type',
                    required: true,
                    align: 'left',
                    label: this.$t('Type'),
                    field: row => row.type
                },
                {
                    name: 'format',
                    required: true,
                    align: 'left',
                    label: this.$t('Format'),
                    field: row => row.format
                }

            ],
            data: [],
            pagination: {
                sortBy: 'id',
                descending: false,
                page: 1,
                rowsPerPage: LIST_DEFAULT_ROWS,
                rowsNumber: 0
            },
            rowStatus: [],
            filter: {
                startTime: null,
                endTime: null,
                caller: null,
                callee: null,
                callId: null
            },
            showFilters: false
        }
    },
    computed: {
        ...mapGetters('callRecordings', [
            'recordings'
        ])
    },
    watch: {
        recordings () {
            this.data = this.recordings.map((recording) => {
                const recordingCopy = { ...recording }

                const user = this.getSubscriber()
                const userCli = user.primary_number.cc + user.primary_number.ac + user.primary_number.sn

                if (recordingCopy.caller && recordingCopy.caller === userCli) {
                    recordingCopy.callerName = this.$t('Me')
                }

                if (recordingCopy.callee && recordingCopy.callee === userCli) {
                    recordingCopy.calleeName = this.$t('Me')
                }

                return recordingCopy
            })

            this.rowStatus = this.recordings.map((rec) => {
                return {
                    id: rec.id,
                    expanded: false
                }
            })
        }
    },
    async mounted () {
        await this.fetchPaginatedRecordings({
            pagination: this.pagination,
            filter: this.filter
        })
    },
    methods: {
        ...mapWaitingActions('callRecordings', {
            fetchRecordings: 'csc-call-recordings',
            fetchStreams: 'csc-call-recordings',
            deleteRecording: 'csc-call-recordings',
            downloadRecording: 'csc-call-recordings',
            playStreamFile: 'csc-call-recordings',
            fetchFile: 'csc-call-recordings'
        }),
        ...mapGetters('user', [
            'getSubscriber'
        ]),
        async fetchPaginatedRecordings (props) {
            const { page, rowsPerPage, sortBy, descending } = props.pagination
            const { startTime, endTime, caller, callee, callId } = this.filter
            const count = await this.fetchRecordings({
                page: page,
                rows: rowsPerPage,
                order_by: sortBy,
                order_by_direction: descending ? 'desc' : 'asc',
                start_time: startTime,
                end_time: endTime,
                caller: caller ? '*' + caller + '*' : undefined,
                callee: callee ? '*' + callee + '*' : undefined,
                call_id: callId ? '*' + callId + '*' : undefined
            })
            this.pagination = { ...props.pagination }
            this.pagination.rowsNumber = count
        },
        openFilters () {
            this.showFilters = true
        },
        closeFilters () {
            if (this.$refs.filters) {
                this.$refs.filters.removeFilters()
            }
            this.showFilters = false
        },
        confirmRowDeletion (rowId) {
            this.$q.dialog({
                component: CscRemoveDialog,
                componentProps: {
                    title: this.$t('Delete recording'),
                    message: this.$t('You are about to delete recording #{id}', { id: rowId })
                }
            }).onOk(() => {
                this.deleteRecord(rowId)
            })
        },
        async deleteRecord (rowId) {
            try {
                await this.deleteRecording(rowId)
                showToast(this.$t('Recording successfully deleted'))
                await this.fetchPaginatedRecordings({
                    pagination: this.pagination,
                    filter: this.filter
                })
            } catch (err) {
                showGlobalError(this.$t('Something went wrong. Please retry later'))
            }
        },
        isRowExpanded (id) {
            const rowStatus = this.rowStatus.filter(row => row.id === id)[0] || null
            return rowStatus && rowStatus.expanded
        },
        async updateCollapseArray (id) {
            const recording = this.data.filter((rec) => rec.id === id)[0]
            const rowStatus = this.rowStatus.filter((row) => row.id === id)[0]
            rowStatus.expanded = !rowStatus.expanded
            if (rowStatus.expanded && recording.files.length === 0) {
                this.$wait.start('loading-stream-' + id)
                try {
                    await this.fetchStreams(id)
                    const updatedRecording = this.recordings.find((rec) => rec.id === id)
                    if (updatedRecording) {
                        recording.files = [...updatedRecording.files]
                    }
                } finally {
                    this.$wait.end('loading-stream-' + id)
                }
            }
        },
        async saveFile (fileId) {
            const file = await this.downloadRecording(fileId)
            saveAs(file, 'call-recording-' + fileId + '.wav')
        },
        filterEvent (filter) {
            this.$scrollTo(this.$parent.$el)
            this.filter = filter
            this.fetchPaginatedRecordings({
                pagination: this.pagination,
                filter: this.filter
            })
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass" scoped>
.table-th
    font-size: 15px
.table-td-no-padding
    padding: 0px !important // needed to override .q-table td
.table-td-action-cont
    min-width: 140px
    .player-btns
        bottom: 9px
        left: 8px
    .download-btn
        height: 30px

</style>
