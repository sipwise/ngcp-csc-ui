<!-- eslint-disable vue/no-v-model-argument -->

<template>
    <csc-page-sticky
        id="csc-page-subscriber-phonebook"
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
                v-if="isPbxEnabled"
                icon="person"
                color="primary"
                flat
                :label="$t('Seats')"
                @click="openSeatTable"
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

            <csc-subscriber-filters
                v-if="showFilters"
                ref="filters"
                class="q-mb-md q-pa-md"
                @filter="applyFilter"
            />

            <q-table
                v-model:pagination="pagination"
                class="no-shadow"
                :columns="columns"
                :rows="subscriberPhonebook"
                :loading="$wait.is('loadSubscriberPhonebook')"
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
                <template #body-cell-shared="{ row }">
                    <td>
                        <q-toggle
                            :model-value="row.shared"
                            :disable="isLevelEntry(row.id)"
                            @update:model-value="toggleShared(row)"
                        />
                    </td>
                </template>
                <template #body-cell-menu="{ row }">
                    <td>
                        <div class="q-gutter-x-sm">
                            <csc-more-menu>
                                <csc-popup-menu-item
                                    icon="fas fa-pen"
                                    color="primary"
                                    :label="$t('Edit')"
                                    :disable="isLevelEntry(row.id)"
                                    @click="showPhonebookDetails(row)"
                                />
                                <csc-popup-menu-item
                                    icon="delete"
                                    color="negative"
                                    :label="$t('Delete')"
                                    :disable="isLevelEntry(row.id)"
                                    @click="deleteRow(row)"
                                />
                            </csc-more-menu>
                            <q-btn
                                icon="fas fa-phone-alt"
                                color="primary"
                                size="sm"
                                flat
                                :label="$t('Call back')"
                                @click="homePageCall(row)"
                            />
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
import CscSpinner from 'components/CscSpinner'
import CscSubscriberFilters from 'components/pages/SubscriberPhonebook/CscSubscriberFilters'
import { LIST_DEFAULT_ROWS } from 'src/api/common'
import { mapWaitingActions } from 'vue-wait'
import { mapGetters, mapState } from 'vuex'
export default {
    name: 'CscPageSubscriberPhonebook',
    components: {
        CscSpinner,
        CscPage,
        CscMoreMenu,
        CscPopupMenuItem,
        CscPageSticky,
        CscListActionButton,
        CscListActions,
        CscSubscriberFilters
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
            'subscriberPhonebook'
        ]),
        ...mapGetters('user', [
            'isPbxEnabled',
            'getSubscriberId'
        ]),
        columns () {
            return [
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
                    name: 'shared',
                    required: true,
                    align: 'left',
                    label: this.$t('Shared'),
                    field: (row) => row.shared,
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
        hasFilters () {
            return Object.keys(this.filters).length > 0
        }
    },
    async mounted () {
        await this.refresh()
    },
    methods: {
        ...mapWaitingActions('user', {
            loadSubscriberPhonebook: 'loadSubscriberPhonebook',
            removeSubscriberPhonebook: 'removeSubscriberPhonebook',
            updateValueShared: 'updateValueShared'
        }),
        async refresh () {
            await this.fetchPaginatedRegistrations({
                pagination: this.pagination
            })
        },
        async fetchPaginatedRegistrations (props) {
            const { page, rowsPerPage, sortBy, descending } = props.pagination
            const count = await this.loadSubscriberPhonebook({
                page,
                rows: rowsPerPage,
                order_by: sortBy,
                order_by_direction: descending ? 'desc' : 'asc',
                subscriber_id: this.getSubscriberId
            })
            this.pagination = { ...props.pagination }
            this.pagination.rowsNumber = count
        },
        async showPhonebookDetails (row) {
            this.$router.push(`/user/subscriber-phonebook/${row.id}`)
        },
        async openAddPhonebook () {
            this.$router.push('/user/subscriber-phonebook/create')
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
                title: this.$t('Delete subscriber phonebook'),
                message: this.$t('You are about to delete this phonebook'),
                color: 'negative',
                cancel: true,
                persistent: true
            }).onOk(async (data) => {
                await this.removeSubscriberPhonebook(row)
                await this.refresh()
            })
        },
        async toggleShared (row) {
            await this.updateValueShared(row)
        },
        isLevelEntry (id) {
        // Entries with composite Ids are considered "level entries", must not be modified (no edit or delete allowed)
            return /[a-z]/.test(id)
        },
        openSeatTable () {
            this.$router.push('/user/seats')
        },
        applyFilter (filters) {
            this.filters = filters
            // Add wildcards to make search more extensive
            if (filters?.name) {
                this.filters.name = `*${filters.name}*`
            }
            if (filters?.number) {
                this.filters.number = `*${filters.number}*`
            }

            this.pagination.page = 1 // Reset to first page on filter change

            this.$scrollTo(this.$parent.$el)
            const payload = this.filters
            payload.page = 1
            payload.subscriber_id = this.getSubscriberId

            this.loadSubscriberPhonebook(payload)
        },
        closeFilters () {
            this.showFilters = false
            this.resetFilters()
        },
        openSearchFilters () {
            this.showFilters = true
        },
        resetFilters () {
            if (this.hasFilters) {
                this.filters = {}
                this.loadSubscriberPhonebook({
                    page: this.pagination.page,
                    rows: this.pagination.rowsPerPage,
                    order_by: this.pagination.sortBy,
                    order_by_direction: this.pagination.descending ? 'desc' : 'asc',
                    subscriber_id: this.getSubscriberId
                })
            }
        }
    }
}
</script>
