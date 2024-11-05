<!-- eslint-disable vue/no-v-model-argument -->

<template>
    <csc-page
        id="csc-page-pbx-settings"
        class="q-pa-lg"
    >
        <q-table
            v-model:pagination="pagination"
            class="no-shadow"
            :columns="columns"
            :rows="subscriberRegistrations"
            :loading="$wait.is('loadSubscriberRegistrations')"
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
                    <q-icon
                        name="delete"
                        color="negative"
                        size="25px"
                        style="cursor: pointer;"
                        @click="deleteRow(row)"
                    />
                </td>
            </template>
        </q-table>
    </csc-page>
</template>

<script>
import CscPage from 'components/CscPage'
import CscSpinner from 'components/CscSpinner'
import { LIST_DEFAULT_ROWS } from 'src/api/common'
import { mapWaitingActions } from 'vue-wait'
import { mapState } from 'vuex'
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
                    field: (row) => row.id,
                    sortable: true
                },
                {
                    name: 'user_agent',
                    required: true,
                    align: 'left',
                    label: this.$t('User Agent'),
                    field: (row) => row.user_agent,
                    sortable: true
                },
                {
                    name: 'contact',
                    required: true,
                    align: 'left',
                    label: this.$t('Contact'),
                    field: (row) => row.contact,
                    sortable: true
                },
                {
                    name: 'expires',
                    required: true,
                    align: 'left',
                    label: this.$t('Expires'),
                    field: (row) => row.expires,
                    sortable: true
                },
                {
                    name: 'q',
                    required: true,
                    align: 'left',
                    label: this.$t('Q-Value'),
                    field: (row) => row.q,
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
            loadSubscriberRegistrations: 'loadSubscriberRegistrations',
            removeSubscriberRegistration: 'removeSubscriberRegistration'
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
        },
        async deleteRow (row) {
            this.$q.dialog({
                title: this.$t('Delete registered device'),
                message: this.$t('You are about to delete this registered device'),
                color: 'negative',
                cancel: true,
                persistent: true
            }).onOk(async (data) => {
                await this.removeSubscriberRegistration(row)
                await this.refresh()
            })
        }
    }
}
</script>
