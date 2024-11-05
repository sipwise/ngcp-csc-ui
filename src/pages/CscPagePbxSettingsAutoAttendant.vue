<template>
    <csc-page-sticky
        id="csc-page-call-forwarding"
        class="q-pa-lg"
    >
        <template
            #header
        >
            <q-btn-dropdown
                size="md"
                color="primary"
                :label="$t('Add slot')"
                :disabled="getAvailableSlots().length === 0"
                icon="add"
                dropdown-icon=" "
                flat
            >
                <q-list
                    v-for="availableSlot in getAvailableSlots()"
                    :key="availableSlot"
                >
                    <csc-popup-menu-item
                        :label="availableSlot"
                        @click="addSlot(availableSlot)"
                    />
                </q-list>
            </q-btn-dropdown>
        </template>
        <div
            class="text-center"
        >
            <csc-spinner
                v-if="$wait.is('csc-pbx-auto-attendant') || $wait.is('csc-pbx-autoattendant-slots-table')"
            />
        </div>
        <csc-list
            v-if="newPersonalSlots && newPersonalSlots.length > 0 && !$wait.is('csc-pbx-auto-attendant')
                && !$wait.is('csc-pbx-autoattendant-slots-table')"
        >
            <csc-fade
                v-for="newSlot in newPersonalSlots"
                :key="'csc-pbx-settings-fade-'+ newSlot.slot "
            >
                <csc-pbx-settings-auto-attendant
                    :add-new-slot="true"
                    :personal-slot="newSlot"
                    @save="saveSlot"
                    @remove="removeSlot"
                    @edit="editNewSlotDestination"
                />
            </csc-fade>
        </csc-list>
        <csc-list
            v-if="personalSlots.length > 0 && !$wait.is('csc-pbx-auto-attendant') && !$wait.is('csc-pbx-autoattendant-slots-table')"
        >
            <csc-fade
                v-for="(personalSlot, index) in personalSlots"
                :key="'csc-pbx-settings-fade-'+ personalSlot.slot "
            >
                <csc-pbx-settings-auto-attendant
                    v-model="personalSlots[index].destination"
                    :personal-slot="personalSlot"
                    @save="saveSlot"
                    @remove="removeSlot"
                    @edit="editNewSlotDestination"
                    @reset="resetPersonalSlot"
                />
            </csc-fade>
        </csc-list>
    </csc-page-sticky>
</template>
<script>
import CscList from 'components/CscList'
import CscPageSticky from 'components/CscPageSticky'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import CscSpinner from 'components/CscSpinner'
import CscPbxSettingsAutoAttendant from 'components/pages/PbxSettings/CscPbxSettingsAutoAttendant'
import CscFade from 'components/transitions/CscFade'
import _ from 'lodash'
import { getSubscriberId } from 'src/auth'
import { showGlobalError, showToast } from 'src/helpers/ui'
import { mapWaitingActions } from 'vue-wait'
import { mapGetters } from 'vuex'
export default {
    name: 'CscPagePbxSettingsAutoAttendant',
    components: {
        CscPageSticky,
        CscPopupMenuItem,
        CscPbxSettingsAutoAttendant,
        CscList,
        CscFade,
        CscSpinner
    },
    emits: ['all-slots-saved'],
    data () {
        return {
            data: [],
            subscriberId: parseInt(getSubscriberId()),
            personalSlots: [],
            newPersonalSlots: []
        }
    },
    computed: {
        ...mapGetters('pbxAutoAttendants', [
            'slots',
            'slotsNumbers',
            'newSlots'
        ])
    },
    async mounted () {
        await this.fetchAutoAttendants()
        this.personalSlots = _.cloneDeep(this.slots.filter((slot) => slot.subscriber_id === this.subscriberId)[0]?.slots)
        this.newPersonalSlots = _.cloneDeep(this.newSlots.filter((slot) => slot.subscriber_id === this.subscriberId)[0].slots)
        this.sortArrays()
    },
    methods: {
        ...mapWaitingActions('pbxAutoAttendants', {
            updateSubscriberSlots: 'csc-pbx-autoattendant-slots-table',
            resetAllNewSlots: 'csc-pbx-autoattendant-slots-table',
            fetchAutoAttendants: 'csc-pbx-auto-attendant',
            createNewSlot: 'csc-pbx-auto-attendant',
            deleteNewSlot: 'csc-pbx-autoattendant-slots-table'
        }),
        getAvailableSlots () {
            let subscriberSlots = this.slots.filter((slot) => slot.subscriber_id === this.subscriberId)[0]?.slots
            const subscriberSavedSlots = subscriberSlots?.map((item) => item.slot)
            const subscriberNewSlots = this.newSlots.filter((item) => item.subscriber_id === this.subscriberId)
            subscriberSlots = subscriberNewSlots.length > 0
                ? [...subscriberSavedSlots, ...subscriberNewSlots[0].slots.map((item) => item.slot)]
                : subscriberSavedSlots
            const availableSlots = this.slotsNumbers.filter((slot) => !subscriberSlots?.includes(slot))
            return availableSlots
        },
        async saveSlot (isARemoval = false) {
            for (const newSlot of this.newPersonalSlots) {
                if (!newSlot.destination && !isARemoval) {
                    showGlobalError(this.$t('Please fill or remove the empty slots'))
                    return
                }
            }
            if (!isARemoval) {
                for (const newSlot of this.newPersonalSlots) {
                    this.updateLocalDestination(newSlot.slot, newSlot.destination)
                }
            }
            await this.updateSubscriberSlots({
                subscriberId: this.subscriberId,
                slots: [...this.newPersonalSlots, ...this.personalSlots]
            })
            this.resetAllNewSlots(this.subscriberId)
            this.personalSlots = _.cloneDeep(this.slots.filter((slot) => slot.subscriber_id === this.subscriberId)[0]?.slots)
            this.newPersonalSlots = _.cloneDeep(this.newSlots.filter((slot) => slot.subscriber_id === this.subscriberId)[0].slots)
            this.sortArrays()
            showToast(this.$t('Slots saved successfully'))
            this.emitter.$emit('all-slots-saved')
        },
        removeSlot (slotToRemove) {
            const foundIndex = this.newPersonalSlots.findIndex((item) => item.slot === slotToRemove)
            if (foundIndex === -1) {
                this.personalSlots = this.personalSlots.filter((item) => item.slot !== slotToRemove)
                this.saveSlot(true)
            } else {
                this.deleteNewSlot({
                    subscriberId: this.subscriberId,
                    index: foundIndex
                })
                this.newPersonalSlots.splice(foundIndex, 1)
            }
        },
        addSlot (availableSlot) {
            this.createNewSlot({
                subscriberId: this.subscriberId,
                slot: availableSlot
            })
            this.newPersonalSlots = _.cloneDeep(this.newSlots.filter((slot) => slot.subscriber_id === this.subscriberId)[0].slots)
            this.sortArrays()
        },
        updateLocalDestination (newPersonalSlot, newDestination) {
            this.personalSlots.forEach((item) => {
                if (item.slot === newPersonalSlot) {
                    item.destination = newDestination
                }
            })

            if (this.newPersonalSlots) {
                this.newPersonalSlots.forEach((item) => {
                    if (item.slot === newPersonalSlot) {
                        item.destination = newDestination
                    }
                })
            }
        },
        editNewSlotDestination (newDestination, newPersonalSlot) {
            const foundIndexNewSlots = this.newPersonalSlots.findIndex((item) => item.slot === newPersonalSlot)
            if (foundIndexNewSlots !== -1) {
                this.newPersonalSlots[foundIndexNewSlots].destination = newDestination
            } else {
                const foundIndexExistingSlots = this.personalSlots.findIndex((item) => item.slot === newPersonalSlot)
                this.personalSlots[foundIndexExistingSlots].destination = newDestination
                if (foundIndexNewSlots !== -1) {
                    this.personalSlots[foundIndexExistingSlots].destination = newDestination
                }
            }
        },
        resetPersonalSlot (personalSlot) {
            const slotsFiltered = this.slots.filter((slot) => slot.subscriber_id === this.subscriberId)[0]?.slots
            const foundIndex = slotsFiltered.findIndex((item) => item.slot === personalSlot)
            this.personalSlots[foundIndex].destination = slotsFiltered[foundIndex].destination
        },
        sortArrays () {
            const compareSlots = (a, b) => {
                if (a.slot > b.slot) {
                    return 1
                }
                if (a.slot < b.slot) {
                    return -1
                }
                return 0
            }

            this.personalSlots.sort(compareSlots)
            this.newPersonalSlots.sort(compareSlots)
        }

    }
}
</script>
