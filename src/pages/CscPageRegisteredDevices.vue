
<template>
    <csc-page
        id="csc-page-pbx-settings"
        class="q-pa-lg"
    >
        <q-table
            class="no-shadow"
            :columns="columns"
            :data="subscriberRegistrations"
            :loading="$wait.is('loadSubscriberRegistrations')"
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
        </q-table>
    </csc-page>
</template>

<script>
import { mapState } from 'vuex'
import CscPage from 'components/CscPage'
import { mapWaitingActions } from 'vue-wait'
import CscSpinner from 'components/CscSpinner'
import {LIST_DEFAULT_ROWS} from "src/api/common";
export default {
    name: 'CscPageRegisteredDevices',
    components: {
        CscSpinner,
        CscPage
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
            'subscriberRegistrations'
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
                    name: 'user_agent',
                    required: true,
                    align: 'left',
                    label: this.$t('User Agent'),
                    field: row => row.user_agent,
                    sortable: true
                },
                {
                    name: 'contact',
                    required: true,
                    align: 'left',
                    label: this.$t('Contact'),
                    field: row => row.contact,
                    sortable: true
                },
                {
                    name: 'expires',
                    required: true,
                    align: 'left',
                    label: this.$t('Expires'),
                    field: row => row.expires,
                    sortable: true
                },
                {
                    name: 'q',
                    required: true,
                    align: 'left',
                    label: this.$t('Q-Value'),
                    field: row => row.q,
                    sortable: true
                },
                {
                    name: 'menu',
                    required: true,
                    align: 'right',
                    label: '',
                    sortable: false
                }
            ]
        }
    },
    async mounted () {
        await this.refresh()
    },
    methods: {
        ...mapWaitingActions('user', {
            loadSubscriberRegistrations: 'loadSubscriberRegistrations'
        }),
        async refresh () {
            await this.fetchPaginatedRegistrations({
                pagination: this.pagination
            })
        },
        async fetchPaginatedRegistrations (props) {
            const { page, rowsPerPage, sortBy, descending } = props.pagination
            const count = await this.loadSubscriberRegistrations({
                page,
                rows: rowsPerPage,
                order_by: sortBy,
                order_by_direction: descending ? 'desc' : 'asc'
            })
            this.pagination = { ...props.pagination }
            this.pagination.rowsNumber = count
        }
    }
}
</script>
