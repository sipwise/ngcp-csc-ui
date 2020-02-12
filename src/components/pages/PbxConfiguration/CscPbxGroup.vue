<template>
    <csc-list-item
        ref="listItem"
        icon="group"
        :expanded="expanded"
        :odd="odd"
        :loading="loading"
        @toggle="toggle"
    >
        <template slot="title">
            <csc-list-item-title
            >
                {{ group | groupName }}
            </csc-list-item-title>
            <q-slide-transition>
                <csc-list-item-subtitle
                    v-if="!expanded"
                >
                    {{ $t('pbxConfig.extension')}}: {{ group.pbx_extension }}
                </csc-list-item-subtitle>
            </q-slide-transition>
            <q-slide-transition>
                <csc-list-item-subtitle
                    v-if="!expanded"
                >
                    <span
                        v-if="group.pbx_groupmember_ids.length > 0"
                    >
                        {{ $t('pbxConfig.seats')}}:
                        <span
                            v-for="seatId in group.pbx_groupmember_ids"
                            :key="seatId"
                            class="csc-list-item-title-keyword"
                        >
                            <q-icon
                                name="person"
                                size="16px"
                            />
                            {{ seats[seatId] | seatName }}
                        </span>
                    </span>
                    <span
                        v-else
                    >
                        <q-icon
                            name="info"
                            color="info"
                            size="24px"
                        />
                        {{ $t('pbxConfig.noSeatAssigned') }}
                    </span>
                </csc-list-item-subtitle>
            </q-slide-transition>
        </template>
        <template slot="menu">
            <csc-list-menu-item
                icon="delete"
                icon-color="negative"
                @click="deleteSeat"
            >
                {{ $t('buttons.remove') }}
            </csc-list-menu-item>
        </template>
        <template slot="body">
            <q-field
                :labelWidth="labelWidth"
                :label="$t('pbxConfig.name')"
            >
                <q-input
                    dark
                    v-model="changes.name"
                    @keyup.enter="save"
                />
                <csc-fade>
                    <csc-form-save-button
                        v-if="hasNameChanged"
                        @click="save"
                    />
                </csc-fade>
                <csc-fade>
                    <csc-form-reset-button
                        v-if="hasNameChanged"
                        @click="resetName"
                    />
                </csc-fade>
            </q-field>
            <q-field
                :labelWidth="labelWidth"
                :label="$t('pbxConfig.extension')"
            >
                <q-input
                    dark
                    v-model="changes.extension"
                    @keyup.enter="save"
                />
                <csc-fade>
                    <csc-form-save-button
                        v-if="hasExtensionChanged"
                        @click="save"
                    />
                </csc-fade>
                <csc-fade>
                    <csc-form-reset-button
                        v-if="hasExtensionChanged"
                        @click="resetExtension"
                    />
                </csc-fade>
            </q-field>
            <q-field
                :labelWidth="labelWidth"
                :label="$t('pbxConfig.primaryNumber')"
            >
                <q-input
                    dark
                    readonly
                    disable
                    :value="getPrimaryNumber"
                />
            </q-field>
            <q-field
                :labelWidth="labelWidth"
                :label="$t('pbxConfig.huntPolicy')">
                <q-select
                    dark
                    radio
                    v-model="changes.huntPolicy"
                    :options="huntPolicyOptions"
                />
                <csc-fade>
                    <csc-form-save-button
                        v-if="hasHuntPolicyChanged"
                        @click="save"
                    />
                </csc-fade>
                <csc-fade>
                    <csc-form-reset-button
                        v-if="hasHuntPolicyChanged"
                        @click="resetHuntPolicy"
                    />
                </csc-fade>
            </q-field>
            <q-field
                :labelWidth="labelWidth"
                :label="$t('pbxConfig.huntTimeout')"
            >
                <q-input
                    dark
                    v-model="changes.huntTimeout"
                    @keyup.enter="save"
                />
                <csc-fade>
                    <csc-form-save-button
                        v-if="hasHuntTimeoutChanged"
                        @click="save"
                    />
                </csc-fade>
                <csc-fade>
                    <csc-form-reset-button
                        v-if="hasHuntTimeoutChanged"
                        @click="resetHuntTimeout"
                    />
                </csc-fade>
            </q-field>
            <q-field
                :labelWidth="labelWidth"
                :label="$t('pbxConfig.aliasNumbers')">
                <q-select
                    dark
                    chips
                    multiple
                    v-model="changes.aliasNumbers"
                    :options="aliasNumberOptions"
                />
                <csc-fade>
                    <csc-form-save-button
                        v-if="hasAliasNumbersChanged"
                        @click="save"
                    />
                </csc-fade>
                <csc-fade>
                    <csc-form-reset-button
                        v-if="hasAliasNumbersChanged"
                        @click="resetAliasNumbers"
                    />
                </csc-fade>
            </q-field>
            <q-field
                :labelWidth="labelWidth"
                :label="$t('pbxConfig.seats')">
                <q-select
                    dark
                    chips
                    multiple
                    v-model="changes.seats"
                    :options="seatOptions"
                />
                <csc-fade>
                    <csc-form-save-button
                        v-if="hasSeatsChanged"
                        @click="save"
                    />
                </csc-fade>
                <csc-fade>
                    <csc-form-reset-button
                        v-if="hasSeatsChanged"
                        @click="resetSeats"
                    />
                </csc-fade>
            </q-field>
            <q-field
                :labelWidth="labelWidth"
                :label="$t('pbxConfig.soundSet')">
                <q-select
                    dark
                    radio
                    v-model="changes.soundSet"
                    :options="soundSetOptions"
                />
                <csc-fade>
                    <csc-form-save-button
                        v-if="hasSoundSetChanged"
                        @click="save"
                    />
                </csc-fade>
                <csc-fade>
                    <csc-form-reset-button
                        v-if="hasSoundSetChanged"
                        @click="resetSoundSet"
                    />
                </csc-fade>
            </q-field>
            <q-field
                v-if="hasCallQueue"
                :labelWidth="labelWidth"
                label=" "
                dark
            >
                <q-btn
                    icon="filter_none"
                    flat
                    color="primary"
                    @click="jumpToCallQueue"
                >
                    {{ $t('pbxConfig.callQueue') }}
                </q-btn>
            </q-field>
        </template>
    </csc-list-item>
</template>

<script>
    import _ from 'lodash'
    import {
        QField,
        QInput,
        QIcon,
        QSelect,
        QChip,
        QBtn,
        QItem,
        QItemSide,
        QItemMain,
        QItemTile,
        QTransition,
        QList,
        QSlideTransition
    } from 'quasar-framework'
    import CscListItem from "../../CscListItem";
    import CscListItemTitle from "../../CscListItemTitle";
    import CscListItemSubtitle from "../../CscListItemSubtitle";
    import CscFadeDown from "../../transitions/CscFadeDown";
    import CscFade from "../../transitions/CscFade";
    import CscListMenuItem from "../../CscListMenuItem";
    import CscFormSaveButton from "../../form/CscFormSaveButton"
    import CscFormResetButton from "../../form/CscFormResetButton"
    import numberFilter from '../../../filters/number'
    export default {
        name: 'csc-pbx-group',
        props: [
            'group',
            'seats',
            'soundSet',
            'expanded',
            'loading',
            'aliasNumberOptions',
            'seatOptions',
            'soundSetOptions',
            'huntPolicyOptions',
            'odd',
            'labelWidth',
            'hasCallQueue'
        ],
        data () {
            return {
                changes: this.getGroupData()
            }
        },
        components: {
            CscListMenuItem,
            CscFade,
            CscFadeDown,
            CscListItem,
            CscListItemTitle,
            CscListItemSubtitle,
            QSlideTransition,
            QField,
            QInput,
            QIcon,
            QSelect,
            QChip,
            QBtn,
            QItem,
            QItemSide,
            QItemMain,
            QItemTile,
            QTransition,
            QList,
            CscFormSaveButton,
            CscFormResetButton
        },
        computed: {
            getPrimaryNumber() {
                return numberFilter(this.group.primary_number);
            },
            hasNameChanged() {
                return this.changes.name !== this.group.display_name;
            },
            hasExtensionChanged() {
                return this.changes.extension !== this.group.pbx_extension;
            },
            hasHuntPolicyChanged() {
                return this.changes.huntPolicy !== this.group.pbx_hunt_policy;
            },
            hasHuntTimeoutChanged() {
                return this.changes.huntTimeout !== this.group.pbx_hunt_timeout;
            },
            hasAliasNumbersChanged() {
                return !_.isEqual(this.changes.aliasNumbers.sort(), this.getAliasNumberIds().sort());
            },
            hasSeatsChanged() {
                return !_.isEqual(this.changes.seats.sort(), this.group.pbx_groupmember_ids.sort());
            },
            hasSoundSetChanged() {
                return this.changes.soundSet !== this.getSoundSetId();
            }
        },
        methods: {
            getAliasNumberIds() {
                let numberIds = [];
                this.group.alias_numbers.forEach((number) => {
                    numberIds.push(number.number_id);
                });
                return numberIds;
            },
            getSeatIds() {
                return _.clone(this.group.pbx_groupmember_ids);
            },
            getSoundSetId() {
                if(this.soundSet !== null) {
                    return this.soundSet.id;
                }
                return null;
            },
            getGroupData() {
                return {
                    name: this.group.display_name,
                    extension: this.group.pbx_extension,
                    huntPolicy: this.group.pbx_hunt_policy,
                    huntTimeout: this.group.pbx_hunt_timeout,
                    aliasNumbers: this.getAliasNumberIds(),
                    seats: this.getSeatIds(),
                    soundSet: this.getSoundSetId()
                };
            },
            toggle() {
                if(this.expanded) {
                    this.$emit('collapse');
                }
                else {
                    this.$emit('expand');
                }
            },
            resetName() {
                this.changes.name = this.group.display_name;
            },
            resetExtension() {
                this.changes.extension = this.group.pbx_extension;
            },
            resetHuntPolicy() {
                this.changes.huntPolicy = this.group.pbx_hunt_policy;
            },
            resetHuntTimeout() {
                this.changes.huntTimeout = this.group.pbx_hunt_timeout;
            },
            resetAliasNumbers() {
                this.changes.aliasNumbers = this.getAliasNumberIds();
            },
            resetSeats() {
                this.changes.seats = this.getSeatIds();
            },
            resetSoundSet() {
                this.changes.soundSet = this.getSoundSetId();
            },
            deleteSeat() {
                if(this.$refs.listItem) {
                    this.$refs.listItem.closePopoverMenu();
                }
                this.$emit('remove');
            },
            jumpToCallQueue() {
                this.$emit('jump-to-call-queue', this.group);
            },
            save(){
                if(this.hasNameChanged) {
                    this.$emit('save-name', {
                        groupId: this.group.id,
                        groupName: this.changes.name
                    });
                }
                if(this.hasExtensionChanged) {
                    this.$emit('save-extension', {
                        groupId: this.group.id,
                        groupExtension: this.changes.extension
                    });
                }
                if(this.hasHuntPolicyChanged) {
                    this.$emit('save-hunt-policy', {
                        groupId: this.group.id,
                        groupHuntPolicy: this.changes.huntPolicy
                    });
                }
                if(this.hasHuntTimeoutChanged) {
                    this.$emit('save-hunt-timeout', {
                        groupId: this.group.id,
                        groupHuntTimeout: this.changes.huntTimeout
                    });
                }
                if(this.hasAliasNumbersChanged) {
                    this.$emit('save-alias-numbers', {
                        groupId: this.group.id,
                        assignedNumbers: _.difference(this.changes.aliasNumbers, this.getAliasNumberIds()),
                        unassignedNumbers: _.difference(this.getAliasNumberIds(), this.changes.aliasNumbers)
                    });
                }
                if(this.hasSeatsChanged) {
                    this.$emit('save-seats', {
                        groupId: this.group.id,
                        seatIds: this.changes.seats
                    });
                }
                if(this.hasSoundSetChanged) {
                    this.$emit('save-sound-set', {
                        groupId: this.group.id,
                        soundSetId: this.changes.soundSet
                    });
                }
            }
        },
        watch: {
            group() {
                this.changes = this.getGroupData()
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common';
</style>
