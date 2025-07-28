<!-- eslint-disable vue/no-v-model-argument -->

<template>
    <csc-page-sticky
        id="csc-page-pbx-statistics-cdr"
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
            <csc-cdr-filters
                v-if="showFilters"
                ref="filters"
                :loading="$wait.is('loadConversations')"
                class="q-mb-md q-pa-md"
                @filter="filterEvent"
            />
        </template>
        <div>
            <div class="q-pa-md">
                <q-table
                    v-model:pagination="pagination"
                    class="no-shadow"
                    :columns="columns"
                    :rows="conversations"
                    :loading="$wait.is('loadConversations')"
                    row-key="id"
                    @request="fetchPaginatedConversations"
                >
                    <template #loading>
                        <q-inner-loading
                            showing
                            color="primary"
                        >
                            <csc-spinner />
                        </q-inner-loading>
                    </template>

                    <template #top-left>
                        <q-btn
                            icon="refresh"
                            size="sm"
                            flat
                            @click="refresh"
                        >
                            {{ $t('Refresh') }}
                        </q-btn>
                        <q-btn
                            flat
                            size="sm"
                            :loading="$wait.is('loadConversations')"
                            @click="triggerDownloadCsv"
                        >
                            {{ $t('Download CSV') }}
                        </q-btn>
                    </template>
                </q-table>
            </div>
        </div>
    </csc-page-sticky>
</template>

<script>
import CscPageSticky from 'components/CscPageSticky'
import CscSpinner from 'components/CscSpinner'
import CscCdrFilters from 'components/pages/PbxStatistics/CscCdrFilters'
import _ from 'lodash'
import { LIST_DEFAULT_ROWS } from 'src/api/common'
import { showGlobalError } from 'src/helpers/ui'
import { RequestState } from 'src/store/common'
import { mapWaitingActions } from 'vue-wait'
import { mapState } from 'vuex'
export default {
    name: 'CscPagePbxStatisticsCdr',
    components: {
        CscSpinner,
        CscPageSticky,
        CscCdrFilters
    },
    data () {
        return {
            data: [],
            pagination: {
                sortBy: 'timestamp',
                descending: true,
                page: 1,
                rowsPerPage: LIST_DEFAULT_ROWS,
                rowsNumber: 0
            },
            showFilters: false,
            filter: {
                startTime: null,
                endTime: null,
                caller: null,
                callee: null
            }
        }
    },
    computed: {
        ...mapState('conversations', [
            'conversations',
            'conversationError',
            'conversationState'
        ]),
        columns () {
            return [
                {
                    name: 'start_time',
                    required: true,
                    label: this.$t('Start time'),
                    align: 'left',
                    field: (row) => this.$filters.smartTime(row.start_time),
                    sortable: true
                },
                {
                    name: 'type',
                    required: true,
                    align: 'left',
                    label: this.$t('Type'),
                    field: (row) => _.capitalize(row.type),
                    sortable: true
                },
                {
                    name: 'caller',
                    required: true,
                    align: 'left',
                    label: this.$t('Caller'),
                    field: (row) => row.caller,
                    sortable: true
                },
                {
                    name: 'callee',
                    required: true,
                    align: 'left',
                    label: this.$t('Callee'),
                    field: (row) => row.callee,
                    sortable: true
                },
                {
                    name: 'direction',
                    required: true,
                    align: 'left',
                    label: this.$t('Direction'),
                    field: (row) => row.direction,
                    sortable: true
                },
                {
                    name: 'duration',
                    required: true,
                    align: 'left',
                    label: this.$t('Duration'),
                    field: (row) => row.duration,
                    sortable: true
                },
                {
                    name: 'status',
                    required: true,
                    align: 'left',
                    label: this.$t('Status'),
                    field: (row) => row.status,
                    sortable: true
                }
            ]
        }
    },
    watch: {
        conversationState (state) {
            if (state === RequestState.failed) {
                showGlobalError(this.conversationError)
            }
        }
    },
    async mounted () {
        await this.refresh()
    },
    methods: {
        ...mapWaitingActions('conversations', {
            loadConversations: 'loadConversations',
            downloadCsv: 'loadConversations'

        }),
        async refresh () {
            await this.fetchPaginatedConversations({
                pagination: this.pagination
            })
        },
        async fetchPaginatedConversations (props) {
            const { page, rowsPerPage, sortBy, descending } = props.pagination
            const { startTime, endTime, direction, type } = this.filter
            const count = await this.loadConversations({
                page,
                rows: rowsPerPage,
                order_by: sortBy,
                order_by_direction: descending ? 'desc' : 'asc',
                from: startTime,
                to: endTime,
                direction,
                type
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
        filterEvent (filter) {
            this.$scrollTo(this.$parent.$el)
            this.filter = filter
            this.fetchPaginatedConversations({
                pagination: this.pagination
            })
        },
        triggerDownloadCsv () {
            const { page, rowsPerPage, sortBy, descending } = this.pagination
            const { startTime, endTime, direction, type } = this.filter

            this.downloadCsv({
                page,
                rows: rowsPerPage,
                order_by: sortBy,
                direction,
                order_by_direction: descending ? 'desc' : 'asc',
                ...(startTime !== null ? { from: startTime } : {}),
                ...(endTime !== null ? { to: endTime } : {}),
                ...(type !== null ? { type } : {}),
                tz: 'UTC'
            }).catch((error) => {
                showGlobalError(error)
            })
        }
    }
}
</script>
