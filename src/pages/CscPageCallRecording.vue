<template>
    <csc-page
        class="q-pa-lg"
    >
        <template>
            <div class="q-pa-md">
                <q-table
                    :data="data"
                    :columns="columns"
                    :loading="$wait.is('csc-call-recordings')"
                    row-key="name"
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
                            <q-td auto-width>
                                <q-btn
                                    size="sm"
                                    color="primary"
                                    round
                                    dense
                                    :icon="isRowExpanded(props.row.id) ? 'remove' : 'add'"
                                    @click="updateCollapseArray(props.row.id)"
                                />
                            </q-td>
                            <q-td
                                v-for="col in props.cols"
                                :key="col.name"
                                :props="props"
                            >
                                {{ col.value }}
                            </q-td>
                            <q-td>
                                <csc-more-menu>
                                    <csc-popup-menu-item-delete
                                        color="negative"
                                        @click="confirmRowDeletion(props.row.id)"
                                    />
                                </csc-more-menu>
                                <csc-confirmation-dialog
                                    :key="props.row.id"
                                    :ref="'confirmDelete-'+props.row.id"
                                    title-icon="delete"
                                    title-icon-color="negative"
                                    color="negative"
                                    :title="$t('Delete recording', {id: props.row.id})"
                                    :message="$t('You are about to delete recording #{id}', {id: props.row.id})"
                                    @confirm="deleteRecord(props.row.id)"
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
                                    :loading="$wait.is('csc-call-recordings')"
                                    :hide-pagination="true"
                                    row-key="name"
                                >
                                    <template v-slot:header="props">
                                        <q-tr :props="props">
                                            <q-th
                                                v-for="col in props.cols"
                                                :key="col.name"
                                                :props="props"
                                            >
                                                {{ col.label }}
                                            </q-th>
                                            <q-th auto-width />
                                        </q-tr>
                                    </template>
                                    <template v-slot:body="props">
                                        <q-tr :props="props">
                                            <q-td
                                                v-for="col in props.cols"
                                                :key="col.name"
                                                :props="props"
                                            >
                                                {{ col.value }}
                                            </q-td>
                                            <q-td>
                                                <q-btn
                                                    size="sm"
                                                    color="primary"
                                                    icon="download"
                                                    dense
                                                    @click="saveFile(props.row.id)"
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
    </csc-page>
</template>

<script>
import {
    mapGetters
} from 'vuex'
import {
    mapWaitingActions
} from 'vue-wait'
import CscPage from 'components/CscPage'
import CscMoreMenu from 'components/CscMoreMenu'
import CscPopupMenuItemDelete from 'components/CscPopupMenuItemDelete'
import CscConfirmationDialog from 'components/CscConfirmationDialog'
import { showGlobalError, showToast } from 'src/helpers/ui'
import { saveAs } from 'file-saver'
export default {
    name: 'CscCallBlocking',
    components: {
        CscPage,
        CscMoreMenu,
        CscPopupMenuItemDelete,
        CscConfirmationDialog
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
                    format: val => `${val}`,
                    sortable: true
                },
                {
                    name: 'type',
                    required: true,
                    align: 'left',
                    label: this.$t('Type'),
                    field: row => row.type,
                    sortable: true
                },
                {
                    name: 'format',
                    required: true,
                    align: 'left',
                    label: this.$t('Format'),
                    field: row => row.format,
                    sortable: true
                }

            ],
            data: [],
            rowStatus: []
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
        await this.fetchRecordings()
    },
    methods: {
        ...mapWaitingActions('callRecordings', {
            fetchRecordings: 'csc-call-recordings',
            fetchStreams: 'csc-call-recordings',
            deleteRecording: 'csc-call-recordings',
            downloadRecording: 'csc-call-recordings'
        }),
        confirmRowDeletion (rowId) {
            this.$refs['confirmDelete-' + rowId].open()
        },
        async deleteRecord (rowId) {
            try {
                await this.deleteRecording(rowId)
                showToast(this.$t('Recording successfully deleted'))
                await this.fetchRecordings()
            } catch (err) {
                showGlobalError(this.$t('Something went wrong. Please retry later'))
            }
        },
        isRowExpanded (id) {
            const rowStatus = this.rowStatus.filter(row => row.id === id)[0] || null
            return rowStatus && rowStatus.expanded
        },
        updateCollapseArray (id) {
            const recording = this.recordings.filter(rec => rec.id === id)[0]
            const rowStatus = this.rowStatus.filter(row => row.id === id)[0]
            rowStatus.expanded = !rowStatus.expanded
            if (rowStatus.expanded && recording.files.length === 0) {
                this.fetchStreams(id)
            }
        },
        async saveFile (fileId) {
            const file = await this.downloadRecording(fileId)
            saveAs(file, 'call-recording-' + fileId + '.wav')
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
.table-th
    font-size 15px
.table-td-no-padding
    padding 0px !important // needed to override .q-table td
</style>
