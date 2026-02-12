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
                data-cy="csc-phonebook-add"
                @click="openAddPhonebook()"
            />
            <q-btn
                v-if="isPbxEnabled"
                icon="person"
                color="primary"
                flat
                :label="$t('Seats')"
                data-cy="csc-phonebook-seats"
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
                :rows="phonebookRows"
                :loading="$wait.is('loadPhonebook')"
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
                                    data-cy="csc-phonebook-entry-edit"
                                    :disable="isLevelEntry(row.id)"
                                    @click="showPhonebookDetails(row)"
                                />
                                <csc-popup-menu-item
                                    icon="delete"
                                    color="negative"
                                    :label="$t('Delete')"
                                    data-cy="csc-phonebook-entry-delete"
                                    :disable="isLevelEntry(row.id)"
                                    @click="deleteRow(row.id)"
                                />
                            </csc-more-menu>
                            <q-btn
                                icon="fas fa-phone-alt"
                                color="primary"
                                size="sm"
                                flat
                                :label="$t('Call back')"
                                data-cy="csc-phonebook-entry-callback"
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
            filters: {},
            showFilters: false
        }
    },
    computed: {
        ...mapState('subscriber-phonebook', {
            phonebookRows: 'phonebookRows',
            pagination: 'pagination'
        }),
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
        ...mapWaitingActions('subscriber-phonebook', {
            loadPhonebook: 'loadPhonebook',
            removeEntry: 'removeEntry',
            updateSharedValue: 'updateSharedValue'
        }),
        async refresh () {
            await this.fetchPaginatedRegistrations({
                pagination: this.pagination
            })
        },
        async fetchPaginatedRegistrations (props) {
            const { page, rowsPerPage, sortBy, descending } = props.pagination
            await this.loadPhonebook({
                subscriber_id: this.getSubscriberId,
                page,
                rows: rowsPerPage,
                order_by: sortBy,
                order_by_direction: descending ? 'desc' : 'asc'
            })
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
        async deleteRow (rowId) {
            this.$q.dialog({
                title: this.$t('Delete subscriber phonebook entry'),
                message: this.$t('You are about to delete this phonebook entry'),
                color: 'negative',
                cancel: true,
                persistent: true
            }).onOk(async (data) => {
                await this.removeEntry({ id: rowId, subscriberId: this.getSubscriberId })
                await this.refresh()
            })
        },
        async toggleShared (row) {
            await this.updateSharedValue(row)
        },
        isLevelEntry (id) {
        // Entries with composite Ids are considered "level entries", must not be modified (no edit or delete allowed)
            return /[a-z]/.test(id)
        },
        openSeatTable () {
            this.$router.push('/user/seats')
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
            await this.loadPhonebook({
                ...this.filters,
                page: 1,
                rows: this.pagination.rowsPerPage,
                subscriber_id: this.getSubscriberId
            })
        },
        closeFilters () {
            this.showFilters = false
            this.resetFilters()
        },
        openSearchFilters () {
            this.showFilters = true
        },
        async resetFilters () {
            if (this.hasFilters) {
                this.filters = {}
                await this.loadPhonebook({
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
