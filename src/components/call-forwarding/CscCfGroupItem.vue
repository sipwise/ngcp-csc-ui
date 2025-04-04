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
            :class="loading || !mapping.enabled ? 'disabled' : ''"
        >
            <q-item-label>
                <template
                    v-if="destinationIndex === 0 && mapping.type !== 'cft'"
                >
                    {{ $t('Forwarded to') }}
                </template>
                <template
                    v-else-if="destinationIndex === 0 && mapping.type === 'cft'"
                >
                    {{ $t('After') }}
                    <span
                        class="q-pl-xs q-pr-xs text-primary text-weight-bold cursor-pointer"
                        style="white-space: nowrap"
                    >
                        <q-icon
                            name="access_time"
                        />
                        {{ ringTimeout }}
                        {{ $t('seconds') }}
                        <q-tooltip class="text-dark">{{ $t('This setting is synced with "After Ring Timeout", which can be edited above.') }}</q-tooltip>
                    </span>
                    {{ $t('forwarded to') }}
                </template>
                <template
                    v-else
                >
                    {{ $t('After') }}
                    <span
                        class="q-pl-xs q-pr-xs text-primary text-weight-bold cursor-pointer"
                        style="white-space: nowrap"
                    >
                        <q-icon
                            name="access_time"
                        />
                        {{ destinationPrevious.timeout }}
                        {{ $t('seconds') }}
                        <q-popup-edit
                            v-slot="scope"
                            v-model="changedDestinationTimeout"
                            buttons
                            @before-show="$store.commit('callForwarding/popupShow', null)"
                            @save="updateDestinationTimeoutEvent({
                                destinationTimeout: $event,
                                destinationIndex: destinationIndex - 1,
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
                    {{ $t('forwarded to') }}
                </template>
                <csc-cf-destination-custom-announcement
                    v-if="isDestinationTypeCustomAnnouncement(destination.destination) && destination.announcement_id"
                    :value="announcement"
                    :destination="destination"
                    :announcements="announcements"
                    @input="updateAnnouncementEvent({
                        destinationIndex: destinationIndex,
                        destinationSetId: destinationSet.id
                    }, $event)"
                />
                <csc-cf-destination-number
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
            </q-item-label>
        </q-item-section>
        <q-item-section
            side
        >
            <csc-more-menu>
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
import CscPopupMenuItemDelete from 'components/CscPopupMenuItemDelete'
import CscSpinner from 'components/CscSpinner'
import CscCfDestination from 'components/call-forwarding/CscCfDestination'
import CscCfDestinationCustomAnnouncement from 'components/call-forwarding/CscCfDestinationCustomAnnouncement'
import CscCfDestinationNumber from 'components/call-forwarding/CscCfDestinationNumber'
import CscInput from 'components/form/CscInput'
import _ from 'lodash'
import { showGlobalError } from 'src/helpers/ui'
import destination from 'src/mixins/destination'
import { mapActions, mapGetters } from 'vuex'
export default {
    name: 'CscCfGroupItem',
    components: { CscCfDestinationNumber, CscCfDestinationCustomAnnouncement, CscCfDestination, CscSpinner, CscInput, CscPopupMenuItemDelete, CscMoreMenu },
    mixins: [destination],
    props: {
        mapping: {
            type: Object,
            required: true
        },
        destination: {
            type: Object,
            required: true
        },
        destinationPrevious: {
            type: Object,
            default: null
        },
        destinationIndex: {
            type: Number,
            required: true
        },
        destinationSet: {
            type: Object,
            required: true
        },
        sourceSet: {
            type: Object,
            default: undefined
        },
        timeSet: {
            type: Object,
            default: undefined
        },
        loading: {
            type: Boolean,
            default: false
        },
        subscriberId: {
            type: String,
            default: ''
        }
    },
    emits: ['delete-last'],
    data () {
        return {
            changedDestination: this.destination.simple_destination,
            changedDestinationTimeout: 0,
            announcement: null
        }
    },
    computed: {
        ...mapGetters('callForwarding', [
            'ringTimeout',
            'announcements'
        ]),
        waitIdentifier () {
            return `csc-cf-group-item-${this.destinationSet.id}-${this.destinationIndex}`
        }
    },
    watch: {
        destination () {
            this.changedDestination = this.destination.simple_destination
        }
    },
    beforeMount () {
        if (this.destination.announcement_id) {
            this.setAnnouncement()
        }
    },
    async mounted () {
        // For the first destination in a call forwarding with timeout
        // use the global ringTimeout value.
        if (this.mapping.type === 'cft' && this.destinationIndex === 0) {
            this.changedDestinationTimeout = this.ringTimeout
            // For subsequent destinations, use the timeout
            // from the previous destination in the chain.
        } else if (this.destinationPrevious) {
            this.changedDestinationTimeout = this.destinationPrevious.timeout
        }
    },
    methods: {
        ...mapActions('callForwarding', [
            'updateDestination',
            'removeDestination',
            'updateDestinationTimeout',
            'updateRingTimeout',
            'rewriteDestination',
            'getAnnouncementById',
            'updateAnnouncement'
        ]),
        async updateDestinationEvent (payload, newDestination) {
            this.$wait.start(this.waitIdentifier)
            try {
                const validatedDest = await this.rewriteDestination(newDestination)
                await this.updateDestination({ ...payload, destination: validatedDest })
            } catch (err) {
                showGlobalError(err.message)
            } finally {
                this.$wait.end(this.waitIdentifier)
            }
        },
        async removeDestinationEvent (payload) {
            this.$q.dialog({
                title: this.$t('Delete destination'),
                message: this.$t('You are about to delete this destination'),
                color: 'negative',
                cancel: true,
                persistent: true
            }).onOk(async (data) => {
                this.$wait.start(this.waitIdentifier)
                if (this.destinationSet.destinations.length > 1) {
                    await this.triggerRemoveDestination(payload)
                    this.setAnnouncement()
                } else {
                    this.$emit('delete-last', payload)
                }
                this.$wait.end(this.waitIdentifier)
            })
        },
        async triggerRemoveDestination (payload) {
            try {
                await this.removeDestination(payload)
            } catch (e) {
                showGlobalError(e.message)
            }
        },
        async updateDestinationTimeoutEvent (payload) {
            this.$wait.start(this.waitIdentifier)
            await this.updateDestinationTimeout(payload)
            this.$wait.end(this.waitIdentifier)
        },
        async updateRingTimeoutEvent (event) {
            this.$wait.start('csc-cf-mappings-full')
            await this.updateRingTimeout({ ringTimeout: event, subscriberId: this.subscriberId })
            this.$wait.end('csc-cf-mappings-full')
        },
        setAnnouncement () {
            this.announcement = _.first(this.announcements.filter((announcement) => announcement.value === this.destination.announcement_id))
        },
        async updateAnnouncementEvent (payload, newAnnouncement) {
            this.$wait.start(this.waitIdentifier)
            try {
                await this.updateAnnouncement({ ...payload, announcementId: newAnnouncement.value })
                this.setAnnouncement()
            } catch (err) {
                showGlobalError(err.message)
            } finally {
                this.$wait.end(this.waitIdentifier)
            }
        },
        checkAnnouncement () {
            const fieldFilled = this.announcement > 0
            if (!fieldFilled) {
                showGlobalError(this.$t('Please select an option'))
            }
            return fieldFilled
        }
    }
}
</script>
