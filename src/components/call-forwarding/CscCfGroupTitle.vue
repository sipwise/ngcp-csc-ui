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
                <span
                    v-if="mapping.type === 'cfu' || mapping.type === 'cft'"
                >
                    {{ $t('If available') }}
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
                    v-if="sourceSet"
                >
                    <template
                        v-if="sourceSet.mode === 'whitelist'"
                    >
                        {{ $t('and call from') }}
                    </template>
                    <template
                        v-else
                    >
                        {{ $t('and call not from') }}
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
                            :mapping="mapping"
                            :destination-set="destinationSet"
                            :source-set="sourceSet"
                            :time-set="timeSet"
                        />
                        <csc-cf-condition-popup-call-not-from
                            v-else
                            :mapping="mapping"
                            :destination-set="destinationSet"
                            :source-set="sourceSet"
                            :time-set="timeSet"
                        />
                    </span>
                </template>
                <template
                    v-if="timeSet"
                >
                    {{ $t('and') }}
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
                            {{ timeSet.times | timeSetDateExact }}
                            <csc-cf-condition-popup-date
                                :mapping="mapping"
                                :destination-set="destinationSet"
                                :source-set="sourceSet"
                                :time-set="timeSet"
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
                            {{ timeSet.times | timeSetDateRange }}
                            <csc-cf-condition-popup-date-range
                                :mapping="mapping"
                                :destination-set="destinationSet"
                                :source-set="sourceSet"
                                :time-set="timeSet"
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
                            {{ timeSet.times | timeSetWeekdays }}
                            <csc-cf-condition-popup-weekdays
                                :mapping="mapping"
                                :destination-set="destinationSet"
                                :source-set="sourceSet"
                                :time-set="timeSet"
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
                            {{ timeSet.times | timeSetOfficeHoursSameTime }}
                            <csc-cf-condition-popup-office-hours
                                :mapping="mapping"
                                :destination-set="destinationSet"
                                :source-set="sourceSet"
                                :time-set="timeSet"
                            />
                        </span>
                    </template>
                    <span
                        v-else
                        :class="clickableClasses"
                    >
                        {{ timeSet.times | timeSetTimes }}
                    </span>
                </template>
                <template
                    v-if="!sourceSet || !timeSet"
                >
                    <span>
                        {{ $t('and') }}
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
                            :source-set="sourceSet"
                            :time-set="timeSet"
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
                    v-slot:grid-column-1
                >
                    <csc-popup-menu-item
                        v-if="mapping.type === 'cfu' && hasSubscriberProfileAttribute('cft')"
                        icon="ring_volume"
                        :label="$t('Ring primary number')"
                        @click="ringPrimaryNumberEvent"
                    />
                    <csc-popup-menu-item
                        v-if="mapping.type === 'cft'"
                        icon="phone_disabled"
                        :label="$t('Do not ring primary number')"
                        @click="doNotRingPrimaryNumberEvent"
                    />
                    <csc-popup-menu-item
                        :icon="destinationIconByType('Number')"
                        :label="$t('Forward to Number')"
                        :disable="hasTermination"
                        @click="addDestinationEvent({
                            destinationSetId: destinationSet.id
                        })"
                    />
                    <csc-popup-menu-item
                        v-if="hasSubscriberProfileAttribute('voice_mail')"
                        :icon="destinationIconByType('VoiceBox')"
                        :label="$t('Forward to Voicebox')"
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
                        :disable="hasTermination"
                        @click="addDestinationEvent({
                            destination: 'conference',
                            destinationSetId: destinationSet.id
                        })"
                    />
                    <csc-popup-menu-item
                        v-if="platformInfo.faxserver"
                        :icon="destinationIconByType('Fax2Mail')"
                        :label="$t('Forward to Fax2Mail')"
                        :disable="hasTermination"
                        @click="addDestinationEvent({
                            destination: 'fax2mail',
                            destinationSetId: destinationSet.id
                        })"
                    />
                    <csc-popup-menu-item
                        v-if="platformInfo.manager_secretary"
                        :icon="destinationIconByType('ManagerSecretary')"
                        :label="$t('Forward to Manager Secretary')"
                        :disable="hasTermination"
                        @click="addDestinationEvent({
                            destination: 'managersecretary',
                            destinationSetId: destinationSet.id
                        })"
                    />
                    <csc-popup-menu-item
                        :icon="destinationIconByType('CustomAnnouncement')"
                        :label="$t('Forward to Custom Announcement')"
                        :disable="hasTermination"
                        @click="addDestinationEvent({
                            destination: 'customhours',
                            destinationSetId: destinationSet.id
                        })"
                    />
                </template>
                <template
                    v-slot:grid-column-2
                >
                    <csc-popup-menu-item
                        v-if="isPbxAttendant && platformInfo.cloudpbx"
                        :icon="destinationIconByType('AutoAttendant')"
                        :label="$t('Forward to Auto Attendant')"
                        :disable="hasTermination"
                        @click="addDestinationEvent({
                            destination: 'autoattendant',
                            destinationSetId: destinationSet.id
                        })"
                    />
                    <csc-popup-menu-item
                        v-if="isPbxAttendant && platformInfo.cloudpbx"
                        :icon="destinationIconByType('OfficeHoursAnnouncement')"
                        :label="$t('Forward to Office Hours Announcement')"
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
                        :disable="hasTermination"
                        @click="addDestinationEvent({
                            destination: 'localuser',
                            destinationSetId: destinationSet.id
                        })"
                    />
                    <csc-popup-menu-item
                        :icon="(mapping.enabled)?'toggle_on':'toggle_off'"
                        :label="(mapping.enabled)?$t('Disable'):$t('Enable')"
                        @click="toggleMappingEvent(mapping)"
                    />
                    <csc-popup-menu-item-delete
                        @click="deleteMappingEvent(mapping)"
                    />
                </template>
            </csc-more-menu>
        </q-item-section>
    </q-item>
</template>

<script>
import _ from 'lodash'
import {
    mapActions, mapGetters, mapState
} from 'vuex'
import CscMoreMenu from 'components/CscMoreMenu'
import CscPopupMenuItemDelete from 'components/CscPopupMenuItemDelete'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import CscCfConditionPopupAll from 'components/call-forwarding/CscCfConditionPopupAll'
import CscCfConditionPopupDate from 'components/call-forwarding/CscCfConditionPopupDate'
import CscCfConditionPopupCallFrom from 'components/call-forwarding/CscCfConditionPopupCallFrom'
import CscCfConditionPopupCallNotFrom from 'components/call-forwarding/CscCfConditionPopupCallNotFrom'
import CscCfConditionPopupDateRange from 'components/call-forwarding/CscCfConditionPopupDateRange'
import CscCfConditionPopupWeekdays from 'components/call-forwarding/CscCfConditionPopupWeekdays'
import CscCfConditionPopupOfficeHours from 'components/call-forwarding/CscCfConditionPopupOfficeHours'
import destination from 'src/mixins/destination'
export default {
    name: 'CscCfGroupTitle',
    components: {
        CscCfConditionPopupOfficeHours,
        CscCfConditionPopupWeekdays,
        CscCfConditionPopupDateRange,
        CscCfConditionPopupCallNotFrom,
        CscCfConditionPopupCallFrom,
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
    computed: {
        ...mapGetters('user', [
            'hasSubscriberProfileAttribute',
            'isPbxAttendant'
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
            return 'csc-cf-group-' + this.destinationSet.id
        },
        hasTermination () {
            return _.endsWith(_.last(this.destinationSet.destinations).destination, 'voicebox.local') ||
                _.endsWith(_.last(this.destinationSet.destinations).destination, 'fax2mail.local') ||
                _.endsWith(_.last(this.destinationSet.destinations).destination, 'managersecretary.local') ||
                _.endsWith(_.last(this.destinationSet.destinations).destination, 'conference.local') ||
                (_.endsWith(_.last(this.destinationSet.destinations).destination, 'app.local') && !_.last(this.destinationSet.destinations).announcement_id)
        }
    },
    methods: {
        ...mapActions('callForwarding', [
            'deleteMapping',
            'toggleMapping',
            'addDestination',
            'ringPrimaryNumber',
            'doNotRingPrimaryNumber'
        ]),
        async addDestinationEvent (payload) {
            this.$wait.start(this.waitIdentifier)
            payload.defaultAnnouncementId = null
            if (_.isArray(this.announcements) && this.announcements.length > 0) {
                payload.defaultAnnouncementId = this.announcements[0].value
            }
            await this.addDestination(payload)
            this.$wait.end(this.waitIdentifier)
        },
        async toggleMappingEvent (mapping) {
            this.$wait.start(this.waitIdentifier)
            await this.toggleMapping(mapping)
            this.$wait.end(this.waitIdentifier)
        },
        async deleteMappingEvent (mapping) {
            this.$q.dialog({
                title: this.$t('Delete forwarding'),
                message: 'You are about to delete this forwarding',
                color: 'negative',
                cancel: true,
                persistent: true
            }).onOk(async data => {
                this.$wait.start(this.waitIdentifier)
                await this.deleteMapping(mapping)
                this.$wait.end(this.waitIdentifier)
            })
        },
        async ringPrimaryNumberEvent () {
            this.$wait.start('csc-cf-mappings-full')
            await this.ringPrimaryNumber()
            this.$wait.end('csc-cf-mappings-full')
        },
        async doNotRingPrimaryNumberEvent () {
            this.$wait.start('csc-cf-mappings-full')
            await this.doNotRingPrimaryNumber()
            this.$wait.end('csc-cf-mappings-full')
        }
    }
}
</script>
