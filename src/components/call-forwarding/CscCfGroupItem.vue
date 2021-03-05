<template>
    <q-item
        :disable="loading || !mapping.enabled"
    >
        <q-item-section
            side
        >
            <q-icon
                name="subdirectory_arrow_right"
            />
        </q-item-section>
        <q-item-section>
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
                        <q-popup-edit
                            v-model="changedDestinationTimeout"
                            buttons
                            @before-show="$store.commit('callForwarding/popupShow', null)"
                            @save="updateRingTimeoutEvent()"
                        >
                            <csc-input
                                v-model="changedDestinationTimeout"
                                type="number"
                                dense
                            >
                                <template
                                    v-slot:prepend
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
                            v-model="changedDestinationTimeout"
                            buttons
                            @before-show="$store.commit('callForwarding/popupShow', null)"
                            @save="updateDestinationTimeoutEvent({
                                destinationTimeout: changedDestinationTimeout,
                                destinationIndex: destinationIndex - 1,
                                destinationSetId: destinationSet.id
                            })"
                        >
                            <csc-input
                                v-model="changedDestinationTimeout"
                                type="number"
                                dense
                            >
                                <template
                                    v-slot:prepend
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
                <span
                    v-if="destination.destination.endsWith('voicebox.local')"
                    class="q-pl-xs text-weight-bold"
                    style="white-space: nowrap"
                >
                    <q-icon
                        name="voicemail"
                    />
                    {{ $t('Voicebox') }}
                </span>
                <span
                    v-else-if="destination.destination.endsWith('fax2mail.local')"
                    class="q-pl-xs text-weight-bold"
                    style="white-space: nowrap"
                >
                    <q-icon
                        name="email"
                    />
                    {{ $t('Fax2Mail') }}
                </span>
                <span
                    v-else-if="destination.destination.endsWith('managersecretary.local')"
                    class="q-pl-xs text-weight-bold"
                    style="white-space: nowrap"
                >
                    <q-icon
                        name="phone_forwarded"
                    />
                    {{ $t('ManagerSecretary') }}
                </span>
                <span
                    v-else-if="destination.destination.endsWith('conference.local')"
                    class="q-pl-xs text-weight-bold"
                    style="white-space: nowrap"
                >
                    <q-icon
                        name="groups"
                    />
                    {{ $t('Conference') }}
                </span>
                <span
                    v-else-if="destination.announcement_id"
                    class="q-pl-xs text-primary text-weight-bold cursor-pointer"
                    style="white-space: nowrap"
                >
                    <q-icon
                        name="music_note"
                    />
                    {{ announcement ? announcement.label : '' }}
                    <q-popup-edit
                        v-model="announcement"
                        buttons
                        anchor="top left"
                        @before-show="$store.commit('callForwarding/popupShow', null)"
                        @save="updateAnnouncementEvent({
                            destinationIndex: destinationIndex,
                            destinationSetId: destinationSet.id
                        })"
                    >
                        <q-select
                            v-model="announcement"
                            emit-value
                            map-options
                            :rules="[ checkAnnouncement ]"
                            :options="announcements"
                            :label="$t('Custom Announcements')"
                            :disable="loading"
                        />
                    </q-popup-edit>
                </span>
                <span
                    v-else-if="destination.destination.endsWith('app.local')"
                    class="q-pl-xs text-weight-bold"
                    style="white-space: nowrap"
                >
                    <q-icon
                        name="app"
                    />
                    {{ $t('Application') }}
                </span>
                <span
                    v-else
                    class="q-pl-xs text-primary text-weight-bold cursor-pointer"
                    style="white-space: nowrap"
                >
                    <q-icon
                        name="phone_forwarded"
                    />
                    {{ destination.simple_destination }}
                    <q-popup-edit
                        v-model="changedDestination"
                        buttons
                        @before-show="$store.commit('callForwarding/popupShow', null)"
                        @save="updateDestinationEvent({
                            destinationIndex: destinationIndex,
                            destinationSetId: destinationSet.id
                        })"
                    >
                        <csc-input
                            v-model="changedDestination"
                            dense
                        >
                            <template
                                v-slot:prepend
                            >
                                <q-icon
                                    name="phone_forwarded"
                                />
                            </template>
                        </csc-input>
                    </q-popup-edit>
                </span>
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
import _ from 'lodash'
import {
    mapActions,
    mapGetters
} from 'vuex'
import CscMoreMenu from 'components/CscMoreMenu'
import CscPopupMenuItemDelete from 'components/CscPopupMenuItemDelete'
import CscInput from 'components/form/CscInput'
import CscSpinner from 'components/CscSpinner'
import {
    showGlobalError
} from 'src/helpers/ui'
export default {
    name: 'CscCfGroupItem',
    components: { CscSpinner, CscInput, CscPopupMenuItemDelete, CscMoreMenu },
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
        }
    },
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
            return 'csc-cf-group-item-' + this.destinationSet.id + '-' + this.destinationIndex
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
        if (this.mapping.type === 'cft' && this.destinationIndex === 0) {
            this.changedDestinationTimeout = this.ringTimeout
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
        async updateDestinationEvent (payload) {
            this.$wait.start(this.waitIdentifier)
            try {
                const validatedDest = await this.rewriteDestination(this.changedDestination)
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
                message: 'You are about to delete this destination',
                color: 'negative',
                cancel: true,
                persistent: true
            }).onOk(async data => {
                this.$wait.start(this.waitIdentifier)
                if (this.destinationSet.destinations.length > 1) {
                    await this.removeDestination(payload)
                    this.setAnnouncement()
                } else {
                    this.$emit('delete-last', payload)
                }
                this.$wait.end(this.waitIdentifier)
            })
        },
        async updateDestinationTimeoutEvent (payload) {
            this.$wait.start(this.waitIdentifier)
            await this.updateDestinationTimeout(payload)
            this.$wait.end(this.waitIdentifier)
        },
        async updateRingTimeoutEvent () {
            this.$wait.start('csc-cf-mappings-full')
            await this.updateRingTimeout(this.changedDestinationTimeout)
            this.$wait.end('csc-cf-mappings-full')
        },
        setAnnouncement () {
            this.announcement = _.first(this.announcements.filter(announcement => announcement.value === this.destination.announcement_id))
        },
        async updateAnnouncementEvent (payload) {
            this.$wait.start(this.waitIdentifier)
            try {
                await this.updateAnnouncement({ ...payload, announcementId: this.announcement })
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
