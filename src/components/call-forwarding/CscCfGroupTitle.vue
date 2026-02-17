<template>
    <q-item
        :disable="loading || $wait.is(waitIdentifier)"
    >
        <q-item-section
            class="text-left"
        >
            <q-item-label
                class="text-weight-bold"
            >
                <q-toggle
                    :model-value="mapping.enabled"
                    data-cy="csc-forwarding-toggle"
                    @update:model-value="toggleMappingEvent(mapping)"
                />
                <span
                    v-if="mapping.type === 'cfu'"
                >
                    {{ $t('Always') }}
                </span>
                <template
                    v-else-if="mapping.type === 'cfna'"
                >
                    {{ $t('If not available') }}
                </template>
                <template
                    v-else-if="mapping.type === 'cfb'"
                >
                    {{ $t('If busy') }}
                </template>
                <template
                    v-else-if="mapping.type === 'cft'"
                >
                    {{ $t('On no answer') }}
                </template>
                <template v-if="sourceSet">
                    <template
                        v-if="sourceSet.mode === 'whitelist'"
                    >
                        {{ ' ' + $t('and call from') + ' ' }}
                    </template>
                    <template
                        v-else
                    >
                        {{ ' ' + $t('and call not from') + ' ' }}
                    </template>
                    <span
                        :class="clickableClasses"
                        style="white-space: nowrap"
                    >
                        <q-icon
                            v-if="sourceSet.mode === 'whitelist'"
                            name="person_add"
                        />
                        <q-icon
                            v-else
                            name="person_add_disabled"
                        />
                        {{ sourceSet.name }}
                        <csc-cf-condition-popup-call-from
                            v-if="sourceSet.mode === 'whitelist'"
                            data-cy="csc-condtion-call-from"
                            :mapping="mapping"
                            :destination-set="destinationSet"
                            :source-set="sourceSet"
                            :time-set="timeSet"
                            :subscriber-id="subscriberId"
                        />
                        <csc-cf-condition-popup-call-not-from
                            v-else
                            data-cy="csc-condtion-call-not-from"
                            :mapping="mapping"
                            :destination-set="destinationSet"
                            :source-set="sourceSet"
                            :time-set="timeSet"
                            :subscriber-id="subscriberId"
                        />
                    </span>
                </template>
                <template v-if="bNumberSet">
                    <span v-if="sourceSet">{{ ' ' + $t('or') + ' ' }} </span>
                    <span v-else>{{ ' ' + $t('and') + ' ' }} </span>

                    <template
                        v-if="bNumberSet.mode === 'whitelist'"
                    >
                        {{ ' ' + $t('call to') + ' ' }}
                    </template>
                    <template
                        v-else
                    >
                        {{ ' ' + $t('call not to') + ' ' }}
                    </template>
                    <span
                        :class="clickableClasses"
                        style="white-space: nowrap"
                    >
                        <q-icon
                            v-if="bNumberSet.mode === 'whitelist'"
                            name="person_add"
                        />
                        <q-icon
                            v-else
                            name="person_add_disabled"
                        />
                        {{ bNumberSet.name }}
                        <csc-cf-condition-popup-call-to
                            v-if="bNumberSet.mode === 'whitelist'"
                            data-cy="csc-condition-call-to"
                            :mapping="mapping"
                            :b-number-set="bNumberSet"
                            :subscriber-id="subscriberId"
                        />
                        <csc-cf-condition-popup-call-not-to
                            v-else
                            data-cy="csc-condition-call-not-to"
                            :mapping="mapping"
                            :b-number-set="bNumberSet"
                            :subscriber-id="subscriberId"
                        />
                    </span>
                </template>
                <template
                    v-if="timeSet"
                >
                    {{ ' ' + $t('and') + ' ' }}
                    <template
                        v-if="timeSet.name.startsWith('csc-date-exact')"
                    >
                        {{ $t('date is') }}
                        <span

                            :class="clickableClasses"
                        >
                            <q-icon
                                name="today"
                            />
                            {{ $filters.timeSetDateExact(timeSet.times) }}
                            <csc-cf-condition-popup-date
                                data-cy="csc-condtion-date"
                                :mapping="mapping"
                                :destination-set="destinationSet"
                                :source-set="sourceSet"
                                :time-set="timeSet"
                                :subscriber-id="subscriberId"
                            />
                        </span>
                    </template>
                    <template
                        v-else-if="timeSet.name.startsWith('csc-date-range')"
                    >
                        {{ $t('date range is') }}
                        <span

                            :class="clickableClasses"
                        >
                            <q-icon
                                name="book_online"
                            />
                            {{ $filters.timeSetDateRange(timeSet.times) }}
                            <csc-cf-condition-popup-date-range
                                data-cy="csc-condtion-date-range"
                                :mapping="mapping"
                                :destination-set="destinationSet"
                                :source-set="sourceSet"
                                :time-set="timeSet"
                                :subscriber-id="subscriberId"
                            />
                        </span>
                    </template>
                    <template
                        v-else-if="timeSet.name.startsWith('csc-weekdays')"
                    >
                        {{ $t('weekdays are') }}
                        <span

                            :class="clickableClasses"
                        >
                            <q-icon
                                name="calendar_today"
                            />
                            {{ $filters.timeSetWeekdays(timeSet.times) }}
                            <csc-cf-condition-popup-weekdays
                                data-cy="csc-condtion-weekdays"
                                :mapping="mapping"
                                :destination-set="destinationSet"
                                :source-set="sourceSet"
                                :time-set="timeSet"
                                :subscriber-id="subscriberId"
                            />
                        </span>
                    </template>
                    <template
                        v-else-if="timeSet.name.startsWith('csc-office-hours')"
                    >
                        {{ $t('office hours are') }}
                        <span
                            :class="clickableClasses"
                        >
                            <q-icon
                                name="access_time"
                            />
                            {{ $filters.timeSetOfficeHoursSameTime(timeSet.times) }}
                            <csc-cf-condition-popup-office-hours
                                data-cy="csc-condtion-office-hours"
                                :mapping="mapping"
                                :destination-set="destinationSet"
                                :source-set="sourceSet"
                                :time-set="timeSet"
                                :subscriber-id="subscriberId"
                            />
                        </span>
                    </template>
                    <template v-else>
                        <span :class="clickableClasses">
                            {{ $t('Custom time set') }}
                            <csc-cf-condition-popup-custom
                                data-cy="csc-condtion-custom"
                                :times="$filters.timeSetTimes(timeSet.times)"
                            />
                        </span>
                    </template>
                </template>
                <template
                    v-if="!sourceSet || !timeSet"
                >
                    <span>
                        {{ ' ' + $t('and') + ' ' }}
                    </span>
                    <span
                        :class="clickableClasses"
                        style="white-space: nowrap"
                    >
                        <q-icon
                            name="alt_route"
                        />
                        {{ $t('condition') }}
                        <csc-cf-condition-popup-all
                            step="menu"
                            :mapping="mapping"
                            :destination-set="destinationSet"
                            :b-number-set="bNumberSet"
                            :source-set="sourceSet"
                            :time-set="timeSet"
                            :subscriber-id="subscriberId"
                        />
                    </span>
                </template>
            </q-item-label>
        </q-item-section>
        <q-item-section
            side
        >
            <csc-more-menu
                :grid-view="true"
            >
                <template
                    #grid-column-1
                >
                    <csc-popup-menu-item
                        :icon="destinationIconByType('Number')"
                        :label="$t('Forward to Number')"
                        data-cy="csc-forwarding-to-number"
                        :disable="hasTermination"
                        @click="addDestinationEvent({
                            destinationSetId: destinationSet.id
                        })"
                    />
                    <csc-popup-menu-item
                        v-if="showVoicebox"
                        :icon="destinationIconByType('VoiceBox')"
                        :label="$t('Forward to Voicebox')"
                        data-cy="csc-forwarding-to-voicebox"
                        :disable="hasTermination"
                        @click="addDestinationEvent({
                            destination: 'voicebox',
                            destinationSetId: destinationSet.id
                        })"
                    />
                    <csc-popup-menu-item
                        v-if="platformInfo.conference"
                        :icon="destinationIconByType('Conference')"
                        :label="$t('Forward to Conference')"
                        data-cy="csc-forwarding-to-conference"
                        :disable="hasTermination"
                        @click="addDestinationEvent({
                            destination: 'conference',
                            destinationSetId: destinationSet.id
                        })"
                    />
                    <csc-popup-menu-item
                        v-if="isFaxFeatureEnabled"
                        :icon="destinationIconByType('Fax2Mail')"
                        :label="$t('Forward to Fax2Mail')"
                        data-cy="csc-forwarding-to-fax2mail"
                        :disable="hasTermination"
                        @click="addDestinationEvent({
                            destination: 'fax2mail',
                            destinationSetId: destinationSet.id
                        })"
                    />
                    <csc-popup-menu-item
                        v-if="showManagerSecretary"
                        :icon="destinationIconByType('ManagerSecretary')"
                        :label="$t('Forward to Manager Secretary')"
                        data-cy="csc-forwarding-to-manager-secretary"
                        :disable="hasTermination"
                        @click="addDestinationEvent({
                            destination: 'managersecretary',
                            destinationSetId: destinationSet.id
                        })"
                    />
                    <csc-popup-menu-item
                        :icon="destinationIconByType('CustomAnnouncement')"
                        :label="$t('Forward to Custom Announcement')"
                        data-cy="csc-forwarding-custom-annoucement"
                        :disable="hasTermination"
                        @click="addDestinationEvent({
                            destination: 'customhours',
                            destinationSetId: destinationSet.id
                        })"
                    />
                </template>
                <template
                    #grid-column-2
                >
                    <csc-popup-menu-item
                        v-if="isPbxAttendant && isPbxEnabled"
                        :icon="destinationIconByType('AutoAttendant')"
                        :label="$t('Forward to Auto Attendant')"
                        data-cy="csc-forwarding-to-auto-attendant"
                        :disable="hasTermination"
                        @click="addDestinationEvent({
                            destination: 'autoattendant',
                            destinationSetId: destinationSet.id
                        })"
                    />
                    <csc-popup-menu-item
                        v-if="isPbxAttendant && isPbxEnabled"
                        :icon="destinationIconByType('OfficeHoursAnnouncement')"
                        :label="$t('Forward to Office Hours Announcement')"
                        data-cy="csc-forwarding-to-office-hours-announcement"
                        :disable="hasTermination"
                        @click="addDestinationEvent({
                            destination: 'officehours',
                            destinationSetId: destinationSet.id
                        })"
                    />
                    <csc-popup-menu-item
                        v-if="platformInfo.callingcard"
                        :icon="destinationIconByType('CallingCard')"
                        :label="$t('Forward to Calling Card')"
                        data-cy="csc-forwarding-to-calling-card"
                        :disable="hasTermination"
                        @click="addDestinationEvent({
                            destination: 'callingcard',
                            destinationSetId: destinationSet.id
                        })"
                    />
                    <csc-popup-menu-item
                        v-if="platformInfo.callthrough"
                        :icon="destinationIconByType('CallThrough')"
                        :label="$t('Forward to Call Through')"
                        data-cy="csc-forwarding-to-call-through"
                        :disable="hasTermination"
                        @click="addDestinationEvent({
                            destination: 'callthrough',
                            destinationSetId: destinationSet.id
                        })"
                    />
                    <csc-popup-menu-item
                        v-if="platformInfo.callthrough || platformInfo.callingcard"
                        :icon="destinationIconByType('LocalSubscriber')"
                        :label="$t('Forward to Local Subscriber')"
                        data-cy="csc-forwarding-to-local-subscriber"
                        :disable="hasTermination"
                        @click="addDestinationEvent({
                            destination: 'localuser',
                            destinationSetId: destinationSet.id
                        })"
                    />
                    <csc-popup-menu-item-delete
                        data-cy="csc-forwarding-delete"
                        @click="deleteMappingEvent(mapping)"
                    />
                </template>
            </csc-more-menu>
        </q-item-section>
    </q-item>
</template>

<script>
import CscMoreMenu from 'components/CscMoreMenu'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import CscPopupMenuItemDelete from 'components/CscPopupMenuItemDelete'
import CscCfConditionPopupAll from 'components/call-forwarding/CscCfConditionPopupAll'
import CscCfConditionPopupCallFrom from 'components/call-forwarding/CscCfConditionPopupCallFrom'
import CscCfConditionPopupCallNotFrom from 'components/call-forwarding/CscCfConditionPopupCallNotFrom'
import CscCfConditionPopupCallNotTo from 'components/call-forwarding/CscCfConditionPopupCallNotTo'
import CscCfConditionPopupCallTo from 'components/call-forwarding/CscCfConditionPopupCallTo'
import CscCfConditionPopupCustom from 'components/call-forwarding/CscCfConditionPopupCustom'
import CscCfConditionPopupDate from 'components/call-forwarding/CscCfConditionPopupDate'
import CscCfConditionPopupDateRange from 'components/call-forwarding/CscCfConditionPopupDateRange'
import CscCfConditionPopupOfficeHours from 'components/call-forwarding/CscCfConditionPopupOfficeHours'
import CscCfConditionPopupWeekdays from 'components/call-forwarding/CscCfConditionPopupWeekdays'
import _ from 'lodash'
import { PROFILE_ATTRIBUTE_MAP } from 'src/constants'
import numberFilter from 'src/filters/number'
import destination from 'src/mixins/destination'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
    name: 'CscCfGroupTitle',
    components: {
        CscCfConditionPopupCustom,
        CscCfConditionPopupOfficeHours,
        CscCfConditionPopupWeekdays,
        CscCfConditionPopupDateRange,
        CscCfConditionPopupCallNotFrom,
        CscCfConditionPopupCallFrom,
        CscCfConditionPopupCallNotTo,
        CscCfConditionPopupCallTo,
        CscCfConditionPopupDate,
        CscCfConditionPopupAll,
        CscPopupMenuItem,
        CscPopupMenuItemDelete,
        CscMoreMenu
    },
    mixins: [destination],
    props: {
        mapping: {
            type: Object,
            required: true
        },
        destinationSet: {
            type: Object,
            required: true
        },
        bNumberSet: {
            type: Object,
            default: undefined
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
    computed: {
        ...mapState('pbxGroups', [
            'groupSelected'
        ]),
        ...mapState('pbxSeats', [
            'seatSelected'
        ]),
        ...mapGetters('user', [
            'hasSubscriberProfileAttribute',
            'isFaxFeatureEnabled',
            'isPbxAttendant',
            'isPbxEnabled'
        ]),
        ...mapState('user', [
            'platformInfo'
        ]),
        ...mapState('callForwarding', [
            'announcements'
        ]),
        clickableClasses () {
            return ['cursor-pointer', 'text-weight-bold', 'text-primary']
        },
        waitIdentifier () {
            return `csc-cf-group-${this.destinationSet.id}`
        },
        hasTermination () {
            const lastDestination = _.last(this.destinationSet.destinations).destination
            const lastDestinationId = _.last(this.destinationSet.destinations).announcement_id
            return _.endsWith(lastDestination, 'voicebox.local') ||
                _.endsWith(lastDestination, 'fax2mail.local') ||
                _.endsWith(lastDestination, 'managersecretary.local') ||
                _.endsWith(lastDestination, 'conference.local') ||
                (_.endsWith(lastDestination, 'app.local') && !lastDestinationId)
        },
        showVoicebox () {
            return this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.voiceMail)
        },
        showManagerSecretary () {
            return this.platformInfo.manager_secretary &&
                this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.managerSecretary)
        }
    },
    methods: {
        ...mapActions('callForwarding', [
            'deleteMapping',
            'toggleMapping',
            'addDestination'
        ]),
        async addDestinationEvent (originalPayload) {
            this.$wait.start(this.waitIdentifier)
            let payload = { ...originalPayload, defaultAnnouncementId: null }
            if (_.isArray(this.announcements) && this.announcements.length > 0) {
                payload.defaultAnnouncementId = this.announcements[0].value
            }
            if (this.subscriberId && this.subscriberId !== '') {
                payload = this.createSpecificDestination(payload)
            }
            await this.addDestination(payload)
            this.$wait.end(this.waitIdentifier)
        },
        async toggleMappingEvent (mapping) {
            this.$wait.start(this.waitIdentifier)
            const mappingWithSubscriberId = { ...mapping }
            mappingWithSubscriberId.subscriberId = this.subscriberId
            await this.toggleMapping(mappingWithSubscriberId)
            this.$wait.end(this.waitIdentifier)
        },
        async deleteMappingEvent (mapping) {
            this.$q.dialog({
                title: this.$t('Delete forwarding'),
                message: this.$t('You are about to delete this forwarding'),
                color: 'negative',
                cancel: true,
                persistent: true
            }).onOk(async (data) => {
                this.$wait.start(this.waitIdentifier)
                const mappingWithSubscriberId = { ...mapping }
                mappingWithSubscriberId.subscriberId = this.subscriberId
                await this.deleteMapping(mappingWithSubscriberId)
                this.$wait.end(this.waitIdentifier)
            })
        },
        createSpecificDestination (payload) {
            const newPayload = { ...payload }
            if (newPayload.destination) {
                switch (newPayload.destination) {
                case 'voicebox':
                    if (this.mapping.type === 'cfb') {
                        newPayload.destination = `sip:vmb${this.getPrimaryNumber()}@voicebox.local`
                    } else {
                        newPayload.destination = `sip:vmu${this.getPrimaryNumber()}@voicebox.local`
                    }
                    break
                case 'fax2mail':
                    newPayload.destination = `sip:fax=${this.getPrimaryNumber()}@fax2mail.local`
                    break
                case 'conference':
                    newPayload.destination = `sip:conf=${this.getPrimaryNumber()}@conference.local`
                    break
                case 'managersecretary':
                    newPayload.destination = `sip:${this.getPrimaryNumber()}@managersecretary.local`
                    break
                }
            }
            return newPayload
        },
        getPrimaryNumber () {
            if (this.groupSelected) {
                return numberFilter(this.groupSelected.primary_number)
            } else if (this.seatSelected) {
                return numberFilter(this.seatSelected.primary_number)
            }
            return null
        }
    }
}
</script>
