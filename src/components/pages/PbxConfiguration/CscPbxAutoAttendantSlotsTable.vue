<!-- eslint-disable vue/no-v-model-argument -->
<template>
    <q-table
        v-model:pagination="pagination"
        :rows="data"
        :columns="columns"
        :loading="$wait.is('csc-pbx-autoattendant-slots-table')"
        :hide-pagination="true"
        row-key="name"
        class="csc-item-odd no-shadow"
    >
        <template #loading>
            <q-inner-loading
                showing
                color="primary"
            />
        </template>
        <template #header="props">
            <q-tr>
                <q-th auto-width />
                <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    class="text-left"
                >
                    {{ col.label }}
                </q-th>
                <q-th auto-width />
                <q-th auto-width />
            </q-tr>
            <q-tr
                v-for="(row, index) in unsavedSlots"
                :key="index"
            >
                <q-td auto-width />
                <q-td>
                    {{ row.slot }}
                </q-td>
                <q-td>
                    <csc-data-table-edit-input
                        :column="{name:'destination', label: $t('Destination'), componentValidations: [getDestinationValidation()]}"
                        :row="{slot: row.slot, destination: row.destination}"
                        :value="row.destination"
                        :save-label="$t('Add')"
                        @changed="updateNewSlotDestination(index, $event.value)"
                    />
                </q-td>
                <q-td>
                    <q-btn
                        icon="delete"
                        color="negative"
                        flat
                        dense
                        @click="resetNewSlot(index)"
                    />
                    <q-btn
                        v-if="row.destination"
                        icon="check"
                        color="primary"
                        :label="$t('Save')"
                        flat
                        dense
                        @click="saveSlots"
                    />
                </q-td>
                <q-td auto-width />
            </q-tr>
        </template>
        <template #body="props">
            <q-tr>
                <q-td auto-width />
                <q-td
                    v-for="col in props.cols"
                    :key="col.name"
                >
                    <div
                        v-if="col.name === 'slot'"
                    >
                        {{ col.value }}
                    </div>
                    <csc-data-table-edit-input
                        v-if="col.name === 'destination'"
                        :column="col"
                        :row="props.row"
                        :value="col.value"
                        @changed="editDestination(props.rowIndex, $event.value)"
                    />
                </q-td>
                <q-td>
                    <q-btn
                        icon="delete"
                        color="negative"
                        flat
                        dense
                        @click="confirmRowDeletion(props.row.slot, props.rowIndex)"
                    />
                    <q-btn
                        v-if="isRowDirty(props.rowIndex)"
                        icon="check"
                        color="primary"
                        :label="$t('Save')"
                        flat
                        dense
                        @click="saveSlots"
                    />
                </q-td>
                <q-td auto-width />
            </q-tr>
        </template>
    </q-table>
</template>

<script>
import { required } from '@vuelidate/validators'
import CscDataTableEditInput from 'components/CscDataTableEditInput'
import CscRemoveDialog from 'components/CscRemoveDialog'
import _ from 'lodash'
import { showGlobalError, showToast } from 'src/helpers/ui'
import { mapWaitingActions } from 'vue-wait-vue3'
import { mapGetters } from 'vuex'

export default {
    name: 'CscPbxAutoAttendantSlotsTable',
    components: {
        CscDataTableEditInput
    },
    props: {
        data: {
            type: Array,
            default: undefined
        },
        subscriberId: {
            type: Number,
            default: undefined
        }
    },
    data () {
        return {
            slots: [],
            unsavedSlots: [],
            dirtySlots: [],
            columns: [
                {
                    name: 'slot',
                    align: 'left',
                    label: this.$t('Slot'),
                    field: (row) => row.slot,
                    componentOptions: this.slotsNumbers
                },
                {
                    name: 'destination',
                    align: 'left',
                    label: this.$t('Destination'),
                    field: (row) => row.destination,
                    componentValidations: [this.getDestinationValidation()]
                }
            ],
            pagination: {
                page: 1,
                rowsPerPage: 0 // 0 means all rows
            }
        }
    },
    computed: {
        ...mapGetters('pbxAutoAttendants', [
            'slotsNumbers',
            'newSlots'
        ]),
        isRowDirty: (state) => (rowIndex) => state.dirtySlots.includes(rowIndex)
    },
    watch: {
        data () {
            this.initTable()
        }
    },
    mounted () {
        this.initTable()
    },
    methods: {
        ...mapWaitingActions('pbxAutoAttendants', {
            updateSubscriberSlots: 'csc-pbx-autoattendant-slots-table',
            editNewSlot: 'csc-pbx-autoattendant-slots-table',
            deleteNewSlot: 'csc-pbx-autoattendant-slots-table',
            resetAllNewSlots: 'csc-pbx-autoattendant-slots-table'
        }),
        initTable () {
            this.slots = _.cloneDeep(this.data)
            this.unsavedSlots = this.newSlots.filter((slot) => slot.subscriber_id === this.subscriberId)[0].slots
            this.dirtySlots = []
        },
        updateNewSlotDestination (index, value) {
            this.editNewSlot({
                subscriberId: this.subscriberId,
                index,
                destination: value
            })
        },
        resetNewSlot (index) {
            this.deleteNewSlot({
                subscriberId: this.subscriberId,
                index
            })
        },
        async editDestination (rowIndex, value) {
            const destination = this.slots[rowIndex].destination
            if (value !== null && value !== '' && destination !== value) {
                this.slots[rowIndex].destination = value
                this.dirtySlots.push(rowIndex)
            } else {
                this.dirtySlots = this.dirtySlots.filter((item) => item !== rowIndex)
            }
        },
        confirmRowDeletion (slot, rowIndex) {
            this.$q.dialog({
                component: CscRemoveDialog,
                componentProps: {
                    title: this.$t('Delete slot?'),
                    message: this.$t('You are about to delete slot {slot}', { slot })
                }
            }).onOk(() => {
                this.deleteSlot(rowIndex)
            })
        },
        async deleteSlot (rowIndex) {
            this.slots = this.slots.filter((slot, index) => index !== rowIndex)
            this.saveSlots()
        },
        async saveSlots () {
            for (const newSlot of this.unsavedSlots) {
                if (!newSlot.destination) {
                    showGlobalError(this.$t('Please fill or remove the empty slots'))
                    return
                }
            }
            await this.updateSubscriberSlots({
                subscriberId: this.subscriberId,
                slots: [...this.unsavedSlots, ...this.slots]
            })
            this.resetAllNewSlots(this.subscriberId)
            showToast(this.$t('Slots saved successfully'))
        },
        hasExistingSlotValue (index, fieldName) {
            return this.slots[index] ? this.slots[index][fieldName] : false
        },
        getDestinationValidation () {
            return {
                name: 'required',
                validator: required,
                error: this.$t('Destination must not be empty')
            }
        }
        // This can be applied as format function in case we want
        // the prevent the user to edit prefix/suffix (sip: and @domain)
        // of the destinations
        //
        // extractDestination (value) {
        //     return value.match(/(?<=sip:)(.*?)(?=@)/)[0]
        // }
    }
}
</script>
