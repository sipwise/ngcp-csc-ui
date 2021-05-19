<template>
    <csc-page-sticky
        id="csc-page-call-recording"
    >
        <template
            v-slot:header
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
            v-slot:toolbar
        >
            <csc-call-recording-filters
                v-if="showFilters"
                ref="filters"
                class="q-mb-md q-pa-md"
                @filter="filterEvent"
            />
        </template>
        <template>
            <div class="q-pa-md">
                <q-table
                    :data="data"
                    :columns="columns"
                    :loading="$wait.is('csc-call-recordings')"
                    row-key="name"
                    flat
                    :pagination.sync="pagination"
                    @request="fetchPaginatedRecordings"
                >
                    <template v-slot:header="props">
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
                        v-slot:body="props"
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
                                    :data="props.row.files"
                                    :columns="filesColumns"
                                    :loading="$wait.is('csc-call-recordings') && $wait.is('loading-stream-' + props.row.id)"
                                    :hide-pagination="true"
                                    row-key="name"
                                    class="csc-item-odd"
                                >
                                    <template v-slot:loading>
                                        <q-inner-loading
                                            showing
                                            color="primary"
                                        />
                                    </template>
                                    <template v-slot:header="innerProps">
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
                                    <template v-slot:body="innerProps">
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
        </template>
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
export default {
    name: 'CscCallBlocking',
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
                    field: row => row.time,
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
                rowsPerPage: 5,
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
            this.data = this.recordings
            this.rowStatus = this.recordings.map(rec => {
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
                parent: this,
                title: this.$t('Delete recording'),
                message: this.$t('You are about to delete recording #{id}', { id: rowId })
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
            const recording = this.recordings.filter(rec => rec.id === id)[0]
            const rowStatus = this.rowStatus.filter(row => row.id === id)[0]
            rowStatus.expanded = !rowStatus.expanded
            if (rowStatus.expanded && recording.files.length === 0) {
                this.$wait.start('loading-stream-' + id)
                try {
                    await this.fetchStreams(id)
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

<style lang="stylus" rel="stylesheet/stylus" scoped>
.table-th
    font-size 15px
.table-td-no-padding
    padding 0px !important // needed to override .q-table td
.table-td-action-cont
    min-width 140px
    .player-btns
        bottom 9px
        left 8px
    .download-btn
        height 30px

</style>
