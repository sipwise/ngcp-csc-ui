<!-- eslint-disable vue/no-v-model-argument -->
<template>
    <csc-page
        class="q-pa-lg"
    >
        <div class="q-pa-md">
            <q-table
                v-model:pagination="pagination"
                class="no-shadow"
                :rows="data"
                :columns="columns"
                :loading="$wait.is('csc-pbx-auto-attendant')"
                row-key="name"
                flat
                @request="fetchWithPagination"
            >
                <template #header="props">
                    <q-tr :props="props">
                        <q-th auto-width />
                        <q-th
                            v-for="col in props.cols"
                            :key="col.name"
                            :props="props"
                            class="table-header"
                        >
                            {{ col.label }}
                        </q-th>
                        <q-th auto-width />
                        <q-th auto-width />
                    </q-tr>
                </template>
                <template
                    #body="props"
                >
                    <q-tr>
                        <q-td auto-width />
                        <q-td
                            v-for="col in props.cols"
                            :key="col.name"
                        >
                            {{ col.value }}
                        </q-td>
                        <q-td auto-width>
                            <q-btn-dropdown
                                size="md"
                                color="primary"
                                :label="$t('Add slot')"
                                :disabled="getAvailableSlots(props.row.slots, props.row.subscriber_id).length === 0"
                                icon="add"
                                dropdown-icon=" "
                                flat
                            >
                                <q-list
                                    v-for="availableSlot in getAvailableSlots(props.row.slots, props.row.subscriber_id)"
                                    :key="availableSlot"
                                >
                                    <csc-popup-menu-item
                                        :label="availableSlot"
                                        @click="addSlot(props.row.subscriber_id, availableSlot)"
                                    />
                                </q-list>
                            </q-btn-dropdown>
                            <q-btn
                                size="md"
                                color="primary"
                                round
                                flat
                                :icon="isRowExpanded(props.row.subscriber_id) ? 'expand_less' : 'expand_more'"
                                @click="updateCollapseArray(props.row.subscriber_id)"
                            />
                        </q-td>
                        <q-td auto-width />
                    </q-tr>
                    <q-tr
                        v-show="isRowExpanded(props.row.subscriber_id)"
                        no-hover
                    >
                        <q-td
                            colspan="100%"
                            class="table-cell"
                        >
                            <csc-pbx-auto-attendant-slots-table
                                :data="sortedSlots(props.row.slots)"
                                :subscriber-id="props.row.subscriber_id"
                            />
                        </q-td>
                    </q-tr>
                </template>
            </q-table>
        </div>
    </csc-page>
</template>

<script>
import _ from 'lodash'
import { mapGetters } from 'vuex'
import { mapWaitingActions } from 'vue-wait'
import { displayName } from 'src/filters/subscriber'
import CscPage from 'components/CscPage'
import CscPbxAutoAttendantSlotsTable from 'components/pages/PbxConfiguration/CscPbxAutoAttendantSlotsTable'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import { LIST_DEFAULT_ROWS } from 'src/api/common'
export default {
    name: 'CscPagePbxAutoAttendant',
    components: {
        CscPage,
        CscPopupMenuItem,
        CscPbxAutoAttendantSlotsTable
    },
    data () {
        return {
            data: [],
            rowStatus: [],
            columns: [
                {
                    name: 'Subscriber Id',
                    required: true,
                    label: this.$t('Id'),
                    align: 'left',
                    field: row => row.subscriber_id,
                    format: val => `${val}`
                },
                {
                    name: 'Name',
                    required: true,
                    align: 'left',
                    label: this.$t('Name'),
                    field: row => displayName(row.subscriber_id_expand)
                }
            ],
            pagination: {
                page: 1,
                rowsPerPage: LIST_DEFAULT_ROWS,
                rowsNumber: 0
            }
        }
    },
    computed: {
        ...mapGetters('pbxAutoAttendants', [
            'slots',
            'slotsNumbers',
            'newSlots'
        ])
    },
    watch: {
        slots () {
            this.data = this.slots
            this.rowStatus = this.slots.map(slot => {
                return {
                    subscriber_id: slot.subscriber_id,
                    expanded: false
                }
            })
        }
    },
    mounted () {
        this.fetchWithPagination({
            pagination: this.pagination
        })
    },
    methods: {
        ...mapWaitingActions('pbxAutoAttendants', {
            fetchAutoAttendants: 'csc-pbx-auto-attendant',
            createNewSlot: 'csc-pbx-auto-attendant'
        }),
        async fetchWithPagination (props) {
            const { page, rowsPerPage } = props.pagination
            const count = await this.fetchAutoAttendants({
                page: page,
                rows: rowsPerPage
            })
            this.pagination = { ...props.pagination }
            this.pagination.rowsNumber = count
        },
        async addSlot (subscriberId, slot) {
            this.createNewSlot({
                subscriberId: subscriberId,
                slot: slot
            })
            this.expandRow(subscriberId)
        },
        isRowExpanded (subscriberId) {
            const rowStatus = this.rowStatus.filter(row => row.subscriber_id === subscriberId)[0] || null
            return rowStatus && rowStatus.expanded
        },
        updateCollapseArray (subscriberId) {
            const rowStatus = this.rowStatus.filter(row => row.subscriber_id === subscriberId)[0]
            rowStatus.expanded = !rowStatus.expanded
        },
        getAvailableSlots (subscriberSlots, subscriberId) {
            const subscriberSavedSlots = subscriberSlots.map(item => item.slot)
            const subscriberNewSlots = this.newSlots.filter(item => item.subscriber_id === subscriberId)
            subscriberSlots = subscriberNewSlots.length > 0
                ? [...subscriberSavedSlots, ...subscriberNewSlots[0].slots.map(item => item.slot)]
                : subscriberSavedSlots
            const availableSlots = this.slotsNumbers.filter(slot => !subscriberSlots.includes(slot))
            return availableSlots
        },
        expandRow (subscriberId) {
            const status = this.rowStatus.filter(row => row.subscriber_id === subscriberId)[0]
            status.expanded = true
        },
        sortedSlots (slots) {
            const sorted = _.cloneDeep(slots)
            return sorted.sort((a, b) => a.slot > b.slot ? 1 : -1)
        }
    }
}
</script>
<style lang="sass" rel="stylesheet/sass" scoped>
.table-header
    font-size: 15px
.table-cell
    padding: 0
</style>
