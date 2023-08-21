
<template>
        <csc-page-sticky
            id="csc-page-subscriber-phonebook"
    >
        <template
            v-slot:header
        >
            <q-btn
                icon="add"
                color="primary"
                flat
                :label="$t('Add Phonebook')"
                @click="openAddPhonebook()"
            />
        </template>
    <csc-page
        class="q-pa-lg"
    >
        <q-table
            class="no-shadow"
            :columns="columns"
            :data="subscriberPhonebook"
            :loading="$wait.is('loadSubscriberPhonebook')"
            row-key="id"
            :pagination.sync="pagination"
            @request="fetchPaginatedRegistrations"
        >
            <template v-slot:loading>
                <q-inner-loading
                    showing
                    color="primary"
                >
                    <csc-spinner />
                </q-inner-loading>
            </template>

            <template v-slot:top-left>
                <q-btn
                    icon="refresh"
                    size="sm"
                    flat
                    @click="refresh"
                >
                    {{ $t('Refresh') }}
                </q-btn>
            </template>
            <template v-slot:body-cell-shared="{ row }">
                <td>
                    <q-toggle
                    :value=row.shared
                    />
            </td>
                </template>
            <template v-slot:body-cell-menu="{ row }">
                <td>
                    <csc-more-menu>
                        <csc-popup-menu-item
                            icon="fas fa-phone-alt"
                            color="primary"
                            :label="$t('Call back')"
                            @click="homePageCall(row)"
                    >
                    </csc-popup-menu-item>
                        <csc-popup-menu-item
                            icon="fas fa-pen"
                            color="primary"
                            :label="$t('Edit')"
                            @click="showPhonebookDetails(row)">   
                    </csc-popup-menu-item>
            </csc-more-menu>
            </td>
                </template>
        </q-table>
    </csc-page>
</csc-page-sticky>
</template>

<script>
import { mapState } from 'vuex'
import CscPage from 'components/CscPage'
import CscMoreMenu from 'components/CscMoreMenu'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import { mapWaitingActions } from 'vue-wait'
import CscSpinner from 'components/CscSpinner'
import {LIST_DEFAULT_ROWS} from "src/api/common";
import CscPageSticky from 'components/CscPageSticky'
export default {
    name: 'CscPageSubscriberPhonebook',
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
            'subscriberPhonebook'
        ]),
        columns () {
            return [
                {
                    name: 'id',
                    required: true,
                    label: this.$t('Id'),
                    align: 'left',
                    field: row => row.id,
                    sortable: true
                },
                {
                    name: 'name',
                    required: true,
                    align: 'left',
                    label: this.$t('Name'),
                    field: row => row.name,
                    sortable: true
                },
                {
                    name: 'number',
                    required: true,
                    align: 'left',
                    label: this.$t('Number'),
                    field: row => row.number,
                    sortable: true,
                },
                {
                    name: 'shared',
                    required: true,
                    align: 'left',
                    label: this.$t('Shared'),
                    field: row => row.shared,
                    sortable: true,
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
            loadSubscriberPhonebook: 'loadSubscriberPhonebook'
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
                order_by_direction: descending ? 'desc' : 'asc'
            })
            this.pagination = { ...props.pagination }
            this.pagination.rowsNumber = count
        },
        async showPhonebookDetails (row) {
            this.$router.push('/user/subscriber-phonebook/'+ row.id)
        },
        async openAddPhonebook () {
            this.$router.push('/user/subscriber-phonebook/create')
        },
        async homePageCall (row) {
            this.$router.push({ 
                path: '/user/home',
                query: { number: row.number } })
        },
    }
}
</script>