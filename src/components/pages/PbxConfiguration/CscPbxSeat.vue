<template>
    <csc-list-item
        ref="listItem"
        icon="person"
        :expanded="expanded"
        :odd="odd"
        :loading="loading"
        @toggle="toggle"
    >
        <template slot="title">
            <csc-list-item-title
            >
                {{ seat | seatName }}
            </csc-list-item-title>
            <q-slide-transition>
                <csc-list-item-subtitle
                    v-if="!expanded"
                >
                    <span
                    >
                        {{ $t('pbxConfig.extension')}}:
                    </span>
                    <span
                        class="csc-list-item-title-value"
                    >
                        {{ seat.pbx_extension }}
                    </span>
                </csc-list-item-subtitle>
            </q-slide-transition>
            <q-slide-transition>
                <csc-list-item-subtitle
                    v-if="!expanded"
                >
                    <span
                        v-if="seat.pbx_group_ids.length > 0"
                    >
                        {{ $t('pbxConfig.groups')}}:
                        <span
                            v-for="groupId in seat.pbx_group_ids"
                            :key="groupId"
                            class="csc-list-item-title-keyword"
                        >
                            <q-icon
                                name="group"
                                size="16px"
                            />
                            {{ groups[groupId] | groupName }}
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
                        {{ $t('pbxConfig.noGroupAssigned') }}
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
                    @keyup.enter="saveName"
                />
                <csc-fade>
                    <csc-form-save-button
                        v-if="hasNameChanged"
                        @click="saveName"
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
                    @keyup.enter="saveExtension"
                />
                <csc-fade>
                    <csc-form-save-button
                        v-if="hasExtensionChanged"
                        @click="saveExtension"
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
                        @click="saveAliasNumbers"
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
                :label="$t('pbxConfig.groups')">
                <q-select
                    dark
                    chips
                    multiple
                    v-model="changes.groups"
                    :options="groupOptions"
                />
                <csc-fade>
                    <csc-form-save-button
                        v-if="hasGroupsChanged"
                        @click="saveGroups"
                    />
                </csc-fade>
                <csc-fade>
                    <csc-form-reset-button
                        v-if="hasGroupsChanged"
                        @click="resetGroups"
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
                        @click="saveSoundSet"
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
        name: 'csc-pbx-seat',
        props: [
            'seat',
            'groups',
            'soundSet',
            'expanded',
            'loading',
            'aliasNumberOptions',
            'groupOptions',
            'soundSetOptions',
            'odd',
            'labelWidth',
            'hasCallQueue'
        ],
        data () {
            return {
                changes: this.getSeatData()
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
                return numberFilter(this.seat.primary_number);
            },
            hasNameChanged() {
                return this.changes.name !== this.seat.display_name;
            },
            hasExtensionChanged() {
                return this.changes.extension !== this.seat.pbx_extension;
            },
            hasAliasNumbersChanged() {
                return !_.isEqual(this.changes.aliasNumbers.sort(), this.getAliasNumberIds().sort());
            },
            hasGroupsChanged() {
                return !_.isEqual(this.changes.groups.sort(), this.seat.pbx_group_ids.sort());
            },
            hasSoundSetChanged() {
                return this.changes.soundSet !== this.getSoundSetId();
            }
        },
        methods: {
            getAliasNumberIds() {
                let numberIds = [];
                this.seat.alias_numbers.forEach((number) => {
                    numberIds.push(number.number_id);
                });
                return numberIds;
            },
            getGroupIds() {
                return _.clone(this.seat.pbx_group_ids);
            },
            getSoundSetId() {
                if(this.soundSet !== null) {
                    return this.soundSet.id;
                }
                return null;
            },
            getSeatData() {
                return {
                    name: this.seat.display_name,
                    extension: this.seat.pbx_extension,
                    aliasNumbers: this.getAliasNumberIds(),
                    groups: this.getGroupIds(),
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
            saveName() {
                if(this.hasNameChanged) {
                    this.$emit('save-name', {
                        seatId: this.seat.id,
                        seatName: this.changes.name
                    });
                }
            },
            resetName() {
                this.changes.name = this.seat.display_name;
            },
            saveExtension() {
                if(this.hasExtensionChanged) {
                    this.$emit('save-extension', {
                        seatId: this.seat.id,
                        seatExtension: this.changes.extension
                    });
                }
            },
            resetExtension() {
                this.changes.extension = this.seat.pbx_extension;
            },
            saveAliasNumbers() {
                if(this.hasAliasNumbersChanged) {
                    this.$emit('save-alias-numbers', {
                        seatId: this.seat.id,
                        assignedNumbers: _.difference(this.changes.aliasNumbers, this.getAliasNumberIds()),
                        unassignedNumbers: _.difference(this.getAliasNumberIds(), this.changes.aliasNumbers)
                    });
                }
            },
            resetAliasNumbers() {
                this.changes.aliasNumbers = this.getAliasNumberIds();
            },
            saveGroups() {
                if(this.hasGroupsChanged) {
                    this.$emit('save-groups', {
                        seatId: this.seat.id,
                        groupIds: this.changes.groups
                    });
                }
            },
            resetGroups() {
                this.changes.groups = this.getGroupIds();
            },
            saveSoundSet() {
                if(this.hasSoundSetChanged) {
                    this.$emit('save-sound-set', {
                        seatId: this.seat.id,
                        soundSetId: this.changes.soundSet
                    });
                }
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
                this.$emit('jump-to-call-queue', this.seat);
            }
        },
        watch: {
            seat() {
                this.changes = this.getSeatData()
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common';
</style>