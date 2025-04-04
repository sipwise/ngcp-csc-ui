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
                        <csc-more-menu>
                            <csc-popup-menu-item
                                icon="fas fa-phone-alt"
                                color="primary"
                                :label="$t('Call back')"
                                @click="homePageCall(row)"
                            />
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
                    </td>
                </template>
            </q-table>
        </csc-page>
    </csc-page-sticky>
</template>

<script>
import CscMoreMenu from 'components/CscMoreMenu'
import CscPage from 'components/CscPage'
import CscPageSticky from 'components/CscPageSticky'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import CscSpinner from 'components/CscSpinner'
import { LIST_DEFAULT_ROWS } from 'src/api/common'
import { mapWaitingActions } from 'vue-wait'
import { mapGetters, mapState } from 'vuex'
export default {
    name: 'CscPageCustomerPhonebook',
    components: {
        CscSpinner,
        CscPage,
        CscMoreMenu,
        CscPopupMenuItem,
        CscPageSticky
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
            }
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
        }
    },
    async mounted () {
        await this.refresh()
    },
    methods: {
        ...mapWaitingActions('user', {
            loadCustomerPhonebook: 'loadCustomerPhonebook',
            removeCustomerPhonebook: 'removeCustomerPhonebook',
            ajaxDownloadPhonebookCSV: 'ajaxDownloadPhonebookCSV'
        }),
        async refresh () {
            await this.fetchPaginatedRegistrations({
                pagination: this.pagination
            })
        },
        async fetchPaginatedRegistrations (props) {
            const { page, rowsPerPage, sortBy, descending } = props.pagination
            const count = await this.loadCustomerPhonebook({
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
                message: this.$t('You are about to delete this phonebook'),
                color: 'negative',
                cancel: true,
                persistent: true
            }).onOk(async (data) => {
                await this.removeCustomerPhonebook(row)
                await this.refresh()
            })
        },
        async downloadCSV () {
            await this.ajaxDownloadPhonebookCSV(this.getCustomerId)
        }
    }
}
</script>
