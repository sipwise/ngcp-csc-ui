<!-- eslint-disable vue/no-v-model-argument -->

<template>
    <csc-page-sticky
        id="csc-page-customer-phonebook"
    >
        <template
            #header
        >
            <q-btn
                icon="add"
                color="primary"
                flat
                :label="$t('Add Phonebook')"
                @click="openAddPhonebook()"
            />
            <q-btn
                icon="fas fa-download"
                color="primary"
                flat
                :label="$t('Download CSV')"
                @click="downloadCSV()"
            />
            <q-btn
                icon="fas fa-upload"
                color="primary"
                flat
                :label="$t('Upload CSV')"
                @click="openUploadPhonebook()"
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
                        :label="$t('Search Contact')"
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
                :filter-options="customerPhonebookFilterOptions"
                data-cy-prefix="csc-customer-phonebook-search"
                @filter="applyFilter"
            />
            <q-table
                v-model:pagination="pagination"
                class="no-shadow"
                :columns="columns"
                :rows="customerPhonebook"
                :loading="$wait.is('loadCustomerPhonebook')"
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

                <template #top-left>
                    <q-btn
                        icon="refresh"
                        size="sm"
                        flat
                        @click="refresh"
                    >
                        {{ $t('Refresh') }}
                    </q-btn>
                </template>
                <template #body-cell-menu="{ row }">
                    <td>
                        <div class="row items-center justify-between no-wrap full-width">
                            <q-btn
                                icon="fas fa-phone-alt"
                                color="primary"
                                size="sm"
                                flat
                                :label="$t('Call back')"
                                data-cy="csc-customer-phonebook-entry-callback"
                                @click="homePageCall(row)"
                            />
                            <csc-more-menu>
                                <csc-popup-menu-item
                                    icon="fas fa-pen"
                                    color="primary"
                                    :label="$t('Edit')"
                                    @click="showPhonebookDetails(row)"
                                />
                                <csc-popup-menu-item
                                    icon="delete"
                                    color="negative"
                                    :label="$t('Delete')"
                                    @click="deleteRow(row)"
                                />
                            </csc-more-menu>
                        </div>
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
import { mapWaitingActions } from 'vue-wait-vue3'
import { mapGetters, mapState } from 'vuex'
export default {
    name: 'CscPageCustomerPhonebook',
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
            'customerPhonebook'
        ]),
        ...mapGetters('user', [
            'getCustomerId'
        ]),
        columns () {
            return [
                {
                    name: 'id',
                    required: true,
                    label: this.$t('Id'),
                    align: 'left',
                    field: (row) => row.id,
                    sortable: true
                },
                {
                    name: 'name',
                    required: true,
                    align: 'left',
                    label: this.$t('Name'),
                    field: (row) => row.name,
                    sortable: true
                },
                {
                    name: 'number',
                    required: true,
                    align: 'left',
                    label: this.$t('Number'),
                    field: (row) => row.number,
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
        customerPhonebookFilterOptions () {
            return [
                { label: this.$t('Name'), value: 'name' },
                { label: this.$t('Number'), value: 'number' }
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
            loadCustomerPhonebook: 'loadCustomerPhonebook',
            removeCustomerPhonebook: 'removeCustomerPhonebook',
            downloadPhonebookAsCSV: 'downloadPhonebookAsCSV'
        }),
        async refresh () {
            await this.fetchPaginatedRegistrations({
                pagination: this.pagination
            })
        },
        async fetchPaginatedRegistrations (props) {
            const { page, rowsPerPage, sortBy, descending } = props.pagination
            const count = await this.loadCustomerPhonebook({
                customer_id: this.getCustomerId,
                page,
                rows: rowsPerPage,
                order_by: sortBy,
                order_by_direction: descending ? 'desc' : 'asc'
            })
            this.pagination = { ...props.pagination }
            this.pagination.rowsNumber = count
        },
        async showPhonebookDetails (row) {
            this.$router.push(`/user/pbx-configuration/customer-phonebook/${row.id}`)
        },
        async openAddPhonebook () {
            this.$router.push('/user/pbx-configuration/customer-phonebook/create')
        },
        async openUploadPhonebook () {
            this.$router.push('/user/pbx-configuration/customer-phonebook/upload')
        },
        async homePageCall (row) {
            let newnumber = ''
            if (row.number.includes('@')) {
                newnumber = row.number.split('@')[0]
            } else {
                newnumber = row.number
            }
            this.$router.push({
                path: '/user/home',
                query: { number: newnumber }
            })
        },
        async deleteRow (row) {
            this.$q.dialog({
                title: this.$t('Delete customer phonebook'),
                message: this.$t('You are about to delete this phonebook entry'),
                color: 'negative',
                cancel: true,
                persistent: true
            }).onOk(async (data) => {
                await this.removeCustomerPhonebook({
                    row,
                    customerId: this.getCustomerId
                })
                await this.refresh()
            })
        },
        async downloadCSV () {
            await this.downloadPhonebookAsCSV(this.getCustomerId)
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
            if (filters?.name) {
                this.filters.name = `*${filters.name}*`
            }
            if (filters?.number) {
                this.filters.number = `*${filters.number}*`
            }
            this.$scrollTo(this.$parent.$el)
            await this.loadCustomerPhonebook({
                ...this.filters,
                customer_id: this.getCustomerId,
                page: 1,
                rows: this.pagination.rowsPerPage,
                order_by: this.pagination.sortBy,
                order_by_direction: this.pagination.descending ? 'desc' : 'asc'
            })
        }
    }
}
</script>
