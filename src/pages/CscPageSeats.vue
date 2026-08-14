<template>
    <csc-page-sticky id="csc-page-seats">
        <template
            #header
        >
            <q-btn
                color="primary"
                flat
                :label="$t('Subscriber Phonebook')"
                @click="openSubscriberPhonebookTable"
            />
        </template>
        <csc-page
            class="q-pa-lg"
        >
            <csc-list-actions
                class="row justify-center q-mb-xs"
            >
                <template
                    #slot1
                >
                    <csc-list-action-button
                        v-if="!showFilters"
                        icon="filter_alt"
                        color="primary"
                        :label="$t('Search Seat')"
                        data-cy="groups-filter-open"
                        @click="openSearchFilters"
                    />
                    <csc-list-action-button
                        v-if="showFilters"
                        icon="clear"
                        color="negative"
                        :label="$t('Close')"
                        data-cy="groups-filter-close"
                        @click="closeFilters"
                    />
                </template>
            </csc-list-actions>
            <csc-search-filters
                v-if="showFilters"
                ref="filters"
                class="q-mb-md q-pa-md"
                :filter-options="seatFilterOptions"
                data-cy-prefix="csc-seat-search"
                @filter="applyFilter"
            />
            <q-table
                v-if="isPbxEnabled"
                class="no-shadow"
                :columns="columns"
                :rows="filteredSubscriberSeats"
                :loading="$wait.is('loadSubscriberSeats')"
                row-key="id"
                @request="fetchPaginatedRegistrations"
            >
                <template #loading>
                    <q-inner-loading
                        showing
                        color="primary"
                    >
                        <csc-spinner />
                    </q-inner-loading>
                </template>
                <template #body-cell-menu="{ row }">
                    <td>
                        <q-btn
                            icon="fas fa-phone-alt"
                            color="primary"
                            size="sm"
                            flat
                            :label="$t('Call back')"
                            @click="homePageCall(row)"
                        />
                    </td>
                </template>
            </q-table>
        </csc-page>
    </csc-page-sticky>
</template>

<script>
import CscListActionButton from 'components/CscListActionButton'
import CscListActions from 'components/CscListActions'
import CscMoreMenu from 'components/CscMoreMenu'
import CscPage from 'components/CscPage'
import CscPageSticky from 'components/CscPageSticky'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import CscSearchFilters from 'components/CscSearchFilters'
import CscSpinner from 'components/CscSpinner'
import { LIST_DEFAULT_ROWS } from 'src/api/common'
import { normalizePrimaryNumber } from 'src/helpers/call-forwarding-destinations'
import { mapWaitingActions } from 'vue-wait-vue3'
import { mapGetters, mapState } from 'vuex'
export default {
    name: 'CscPageSeats',
    components: {
        CscSpinner,
        CscPage,
        CscMoreMenu,
        CscPopupMenuItem,
        CscPageSticky,
        CscListActionButton,
        CscListActions,
        CscSearchFilters
    },
    data () {
        return {
            data: [],
            pagination: {
                sortBy: 'id',
                descending: false,
                page: 1,
                rowsPerPage: LIST_DEFAULT_ROWS,
                rowsNumber: 0
            },
            filters: {},
            showFilters: false
        }
    },
    computed: {
        ...mapState('user', [
            'subscriberSeats'
        ]),
        ...mapGetters('user', [
            'isPbxEnabled'
        ]),
        filteredSubscriberSeats () {
            return this.subscriberSeats.filter((seat) => seat.pbx_extension !== null)
        },
        columns () {
            return [
                {
                    name: 'id',
                    label: this.$t('Id'),
                    align: 'left',
                    field: (row) => row.id,
                    sortable: true
                },
                {
                    name: 'display_name',
                    align: 'left',
                    label: this.$t('Display Name'),
                    field: (row) => {
                        return row.display_name ? row.display_name : normalizePrimaryNumber(row.primary_number)
                    },
                    sortable: true
                },
                {
                    name: 'primary_number',
                    align: 'left',
                    label: this.$t('Number'),
                    field: (row) => normalizePrimaryNumber(row.primary_number),
                    sortable: true
                },
                {
                    name: 'pbx_extension',
                    align: 'left',
                    label: this.$t('Extension'),
                    field: (row) => row.pbx_extension,
                    sortable: true
                },
                {
                    name: 'menu',
                    required: true,
                    align: 'left',
                    label: '',
                    sortable: true
                }
            ]
        },
        seatFilterOptions () {
            return [
                { label: this.$t('Display name'), value: 'display_name' },
                { label: this.$t('Number'), value: 'primary_number' },
                { label: this.$t('Extension'), value: 'pbx_extension' }
            ]
        },
        hasFilters () {
            return Object.keys(this.filters).length > 0
        }
    },
    async mounted () {
        await this.refresh()
    },
    methods: {
        ...mapWaitingActions('user', {
            loadSubscriberSeats: 'loadSubscriberSeats'
        }),
        async refresh () {
            await this.fetchPaginatedRegistrations({
                pagination: this.pagination
            })
        },
        async fetchPaginatedRegistrations ({ pagination }) {
            const count = await this.loadSubscriberSeats({
                page: pagination.page,
                rows: pagination.rowsPerPage,
                order_by: pagination.sortBy,
                order_by_direction: pagination.descending ? 'desc' : 'asc'
            })
            this.pagination = { ...pagination, rowsNumber: count }
        },
        openSubscriberPhonebookTable () {
            this.$router.push('/user/subscriber-phonebook')
        },
        async homePageCall (row) {
            const pn = row.primary_number
            this.$router.push({
                path: '/user/home',
                query: { number: normalizePrimaryNumber(pn) }
            })
        },
        openSearchFilters () {
            this.showFilters = true
        },
        closeFilters () {
            this.showFilters = false
            this.resetFilters()
        },
        async resetFilters () {
            if (this.hasFilters) {
                this.filters = {}
                await this.fetchPaginatedRegistrations({ pagination: this.pagination })
            }
        },
        async applyFilter (filters) {
            this.filters = filters
            // Add wildcards to make search more extensive
            if (filters?.display_name) {
                this.filters.display_name = `*${filters.display_name}*`
            }
            if (filters?.primary_number) {
                this.filters.primary_number = `*${filters.primary_number}*`
            }
            if (filters?.pbx_extension) {
                this.filters.pbx_extension = `*${filters.pbx_extension}*`
            }
            this.$scrollTo(this.$parent.$el)
            await this.loadSubscriberSeats({
                ...this.filters,
                page: 1,
                rows: this.pagination.rowsPerPage,
                order_by: this.pagination.sortBy,
                order_by_direction: this.pagination.descending ? 'desc' : 'asc'
            })
        }
    }
}
</script>
