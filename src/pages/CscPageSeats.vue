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
        <csc-page class="q-pa-lg">
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
                        <csc-more-menu>
                            <csc-popup-menu-item
                                icon="fas fa-phone-alt"
                                color="primary"
                                :label="$t('Call back')"
                                @click="homePageCall(row)"
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
    name: 'CscPageSeats',
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
                        return row.display_name ? row.display_name : this.formatPhoneNumber(row.primary_number)
                    },
                    sortable: true
                },
                {
                    name: 'primary_number',
                    align: 'left',
                    label: this.$t('Number'),
                    field: (row) => this.formatPhoneNumber(row.primary_number),
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
        formatPhoneNumber (pn) {
            return `${pn.cc}${pn.ac}${pn.sn}`
        },
        async homePageCall (row) {
            const pn = row.primary_number
            this.$router.push({
                path: '/user/home',
                query: { number: this.formatPhoneNumber(pn) }
            })
        }
    }
}
</script>
