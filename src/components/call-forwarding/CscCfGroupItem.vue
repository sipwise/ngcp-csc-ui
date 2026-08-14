<template>
    <q-item>
        <q-item-section
            side
        >
            <q-icon
                name="subdirectory_arrow_right"
            />
        </q-item-section>
        <q-item-section
            :class="loading ? 'disabled' : '' "
        >
            <q-item-label>
                {{ $t('Forwarded to') + ' ' }}
                <csc-cf-destination
                    v-if="!editable"
                    :model-value="destination"
                    :label="readOnlyDestinationLabel"
                />
                <csc-cf-destination-custom-announcement
                    v-else-if="isDestinationTypeCustomAnnouncement(destination.destination) && destination.announcement_id"
                    class="q-pr-xs"
                    :value="announcement"
                    :destination="destination"
                    :announcements="announcements"
                    @input="updateAnnouncementEvent({
                        destinationIndex: destinationIndex,
                        destinationSetId: destinationSet.id
                    }, $event)"
                />
                <csc-cf-destination-number-or-seat
                    v-else-if="isDestinationTypeNumber(destination.destination)"
                    :value="changedDestination"
                    :destination="destination"
                    @input="updateDestinationEvent({
                        destinationIndex: destinationIndex,
                        destinationSetId: destinationSet.id
                    }, $event)"
                />
                <csc-cf-destination
                    v-else
                    :model-value="destination"
                />
                <template
                    v-if="hasDestinationDuration"
                >
                    {{ ' ' + $t('for') + ' ' }}
                    <span
                        :class="{ 'text-primary cursor-pointer': editable }"
                        class="q-pl-xs q-pr-xs text-weight-bold"
                        style="white-space: nowrap"
                    >
                        <q-icon
                            name="access_time"
                        />
                        {{ currentDestinationTimeout }}
                        {{ $t('seconds') }}
                        <q-popup-edit
                            v-if="editable"
                            v-slot="scope"
                            v-model="changedDestinationTimeout"
                            buttons
                            @before-show="setPopupShow(null)"
                            @save="updateDestinationTimeoutEvent({
                                destinationTimeout: $event,
                                destinationIndex: destinationIndex,
                                destinationSetId: destinationSet.id
                            })"
                        >
                            <csc-input
                                v-model="scope.value"
                                type="number"
                                dense
                            >
                                <template
                                    #prepend
                                >
                                    <q-icon
                                        name="access_time"
                                    />
                                </template>
                            </csc-input>
                        </q-popup-edit>
                    </span>
                </template>
            </q-item-label>
        </q-item-section>
        <q-item-section
            v-if="editable && destinationIndex < destinationSet.destinations.length - 1"
            side
        >
            <csc-more-menu>
                <csc-popup-menu-item
                    v-if="canMoveUp"
                    icon="arrow_upward"
                    :label="$t('Move up')"
                    data-cy="csc-cf-destination-move-up"
                    @click="moveDestinationEvent('up')"
                />
                <csc-popup-menu-item
                    v-if="canMoveDown"
                    icon="arrow_downward"
                    :label="$t('Move down')"
                    data-cy="csc-cf-destination-move-down"
                    @click="moveDestinationEvent('down')"
                />
                <csc-popup-menu-item-delete
                    @click="removeDestinationEvent({
                        destinationIndex: destinationIndex,
                        destinationSetId: destinationSet.id
                    })"
                />
            </csc-more-menu>
        </q-item-section>
        <q-inner-loading
            :showing="$wait.is(waitIdentifier)"
            color="primary"
            class="bg-main-menu"
        >
            <csc-spinner />
        </q-inner-loading>
    </q-item>
</template>

<script>
import CscMoreMenu from 'components/CscMoreMenu'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import CscPopupMenuItemDelete from 'components/CscPopupMenuItemDelete'
import CscSpinner from 'components/CscSpinner'
import CscCfDestination from 'components/call-forwarding/CscCfDestination'
import CscCfDestinationCustomAnnouncement from 'components/call-forwarding/CscCfDestinationCustomAnnouncement'
import CscCfDestinationNumberOrSeat from 'components/call-forwarding/CscCfDestinationNumberOrSeat'
import CscInput from 'components/form/CscInput'
import _ from 'lodash'
import { canMoveDestination } from 'src/helpers/call-forwarding-destinations'
import destination from 'src/mixins/destination'
import { mapActions, mapGetters } from 'vuex'
export default {
    name: 'CscCfGroupItem',
    components: {
        CscCfDestinationNumberOrSeat,
        CscCfDestinationCustomAnnouncement,
        CscCfDestination,
        CscSpinner,
        CscInput,
        CscPopupMenuItemDelete,
        CscPopupMenuItem,
        CscMoreMenu
    },
    mixins: [destination],
    props: {
        destination: {
            type: Object,
            required: true
        },
        destinationIndex: {
            type: Number,
            required: true
        },
        destinationSet: {
            type: Object,
            required: true
        },
        loading: {
            type: Boolean,
            default: false
        },
        editable: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            changedDestination: this.destination.simple_destination,
            changedDestinationTimeout: this.destination.timeout,
            announcement: null
        }
    },
    computed: {
        ...mapGetters('callForwarding', [
            'announcements'
        ]),
        hasDestinationDuration () {
            return this.isDestinationTypeNumber(this.destination.destination)
        },
        currentDestinationTimeout () {
            if (!this.hasDestinationDuration) {
                return null
            }

            return this.destination.timeout
        },
        readOnlyDestinationLabel () {
            return this.announcement?.label || this.destination.simple_destination
        },
        canMoveUp () {
            return canMoveDestination(
                this.destinationSet.destinations,
                this.destinationIndex,
                this.destinationIndex - 1
            )
        },
        canMoveDown () {
            return canMoveDestination(
                this.destinationSet.destinations,
                this.destinationIndex,
                this.destinationIndex + 1
            )
        },
        waitIdentifier () {
            return `csc-cf-group-item-${this.destinationSet.id}-${this.destinationIndex}`
        }
    },
    watch: {
        destination () {
            this.changedDestination = this.destination.simple_destination
        },
        currentDestinationTimeout: {
            handler (timeout) {
                this.changedDestinationTimeout = timeout
            },
            immediate: true
        }
    },
    beforeMount () {
        if (this.destination.announcement_id) {
            this.setAnnouncement()
        }
    },
    methods: {
        ...mapActions('callForwarding', [
            'updateDestination',
            'removeDestination',
            'moveDestination',
            'updateDestinationTimeout',
            'rewriteDestination',
            'updateAnnouncement',
            'setPopupShow'
        ]),
        async moveDestinationEvent (direction) {
            const targetIndex = direction === 'up' ? this.destinationIndex - 1 : this.destinationIndex + 1
            if (!canMoveDestination(this.destinationSet.destinations, this.destinationIndex, targetIndex)) {
                return
            }
            this.$wait.start(this.waitIdentifier)
            await this.moveDestination({
                destinationSetId: this.destinationSet.id,
                destinationFromIndex: this.destinationIndex,
                destinationToIndex: targetIndex
            })
            this.$wait.end(this.waitIdentifier)
        },
        async updateDestinationEvent (payload, newDestination) {
            this.$wait.start(this.waitIdentifier)
            const validatedDest = await this.rewriteDestination(newDestination)
            await this.updateDestination({ ...payload, destination: validatedDest })
            this.$wait.end(this.waitIdentifier)
        },
        async removeDestinationEvent (payload) {
            this.$q.dialog({
                title: this.$t('Delete destination'),
                message: this.$t('You are about to delete this destination'),
                color: 'negative',
                cancel: true,
                persistent: true
            }).onOk(async () => {
                this.$wait.start(this.waitIdentifier)
                await this.removeDestination(payload)
                this.setAnnouncement()
                this.$wait.end(this.waitIdentifier)
            })
        },
        async updateDestinationTimeoutEvent (payload) {
            this.$wait.start(this.waitIdentifier)
            await this.updateDestinationTimeout(payload)
            this.$wait.end(this.waitIdentifier)
        },
        setAnnouncement () {
            this.announcement = _.first(this.announcements.filter((announcement) => announcement.value === this.destination.announcement_id))
        },
        async updateAnnouncementEvent (payload, newAnnouncement) {
            this.$wait.start(this.waitIdentifier)
            await this.updateAnnouncement({ ...payload, announcementId: newAnnouncement.value })
            this.setAnnouncement()
            this.$wait.end(this.waitIdentifier)
        }
    }
}
</script>
