<template>
    <q-item :class="itemClasses">
        <q-item-side
            v-if="!expanded"
        >
            <q-icon
                size="24px"
                name="person"
                color="white"
            />
        </q-item-side>
        <q-item-main>
            <q-item-tile
                v-if="!expanded"
                class="csc-item-title"
                label
            >
                {{ seat.display_name }}
            </q-item-tile>
            <q-item-tile
                v-if="!expanded"
                class="csc-item-subtitle"
                sublabel
            >
                <div>
                    <span class="csc-item-label">{{ $t('pbxConfig.extension') }}:</span>
                    <span class="csc-item-value">{{ seat.pbx_extension }}</span>
                </div>
            </q-item-tile>
            <q-item-tile
                v-if="!expanded"
                class="csc-item-subtitle"
                sublabel
            >
                <div
                    v-if="!hasGroups"
                    class="csc-form-info"
                >
                    <q-icon name="info" color="info" size="24px"/>
                    <span class="csc-info-text">{{ $t('pbxConfig.noGroupAssigned') }}</span>
                </div>
                <div
                    class="csc-item-field"
                    v-if="hasGroups">
                    <span
                        class="csc-item-label">
                        {{ $t('pbxConfig.groups') }}:
                    </span>
                    <span
                        class="csc-item-value"
                        v-for="group in seat.groups"
                    >
                        {{ group.display_name }}
                    </span>
                </div>
            </q-item-tile>
            <q-item-tile
                class="csc-list-item-main"
                v-if="expanded"
            >
                <q-field :label="$t('pbxConfig.name')">
                    <q-input
                        dark
                        v-model="changes.name"
                        :after="nameButtons"
                        @keyup.enter="saveName"
                    />
                </q-field>
                <q-field :label="$t('pbxConfig.extension')">
                    <q-input
                        dark
                        v-model="changes.extension"
                        :after="extensionButtons"
                        @keyup.enter="saveExtension"
                    />
                </q-field>
                <q-field :label="$t('pbxConfig.primaryNumber')">
                    <q-input
                        dark
                        v-model="primaryNumber"
                        readonly
                        disable
                    />
                </q-field>
                <q-field :label="$t('pbxConfig.aliasNumbers')">
                    <q-select
                        dark
                        ref="aliasNumbers"
                        v-model="changes.aliasNumbers"
                        :options="aliasNumberOptions"
                        multiple
                        chips
                        clearable
                        :after="aliasNumberButtons"
                    />
                </q-field>
                <q-field :label="$t('pbxConfig.groups')">
                    <q-select
                        dark
                        v-model="changes.groups"
                        :options="groupOptions"
                        multiple
                        chips
                        clearable
                        :after="groupButtons"
                    />
                </q-field>
            </q-item-tile>
        </q-item-main>
        <q-item-side
            right
            class="csc-list-actions-pinned"
        >
            <q-item-tile>
                <q-btn
                    v-if="expanded"
                    icon="delete"
                    :big="isMobile"
                    color="negative"
                    flat
                    @click="remove()"
                />
                <q-btn
                    :icon="titleIcon"
                    :big="isMobile"
                    color="primary"
                    flat
                    @click="toggleMain()"
                />
            </q-item-tile>
        </q-item-side>
        <q-inner-loading :visible="isLoading">
            <q-spinner-mat
                size="60px"
                color="primary"
            />
        </q-inner-loading>
    </q-item>
</template>

<script>
    import _ from 'lodash';
    import numberFilter from '../../../filters/number'
    import {
        QCard,
        QCardTitle,
        QCardMain,
        QCardActions,
        QField,
        QInput,
        QIcon,
        QSelect,
        QChip,
        QBtn,
        QInnerLoading,
        QSpinnerMat,
        QTransition,
        Platform,
        QItem,
        QItemSide,
        QItemMain,
        QItemTile,
        QAlert
    } from 'quasar-framework'
    export default {
        name: 'csc-pbx-seat',
        props: [
            'seat',
            'aliasNumberOptions',
            'groupOptions',
            'loading'
        ],
        data () {
            return {
                expanded: false,
                changes: this.getSeat()
            }
        },
        components: {
            QCard,
            QCardTitle,
            QCardMain,
            QCardActions,
            QField,
            QInput,
            QIcon,
            QSelect,
            QChip,
            QBtn,
            QInnerLoading,
            QSpinnerMat,
            QTransition,
            QItem,
            QItemSide,
            QItemMain,
            QItemTile,
            QAlert
        },
        computed: {
            itemClasses() {
                let classes = ['csc-list-item', 'csc-pbx-seat'];
                if (this.expanded) {
                    classes.push('csc-item-expanded');
                }
                return classes;
            },
            entityTitle() {
                return this.seat.display_name ?
                    this.seat.display_name : this.seat.username;
            },
            id() {
                return this.seat.id;
            },
            name() {
                return this.seat.display_name;
            },
            extension() {
                return this.seat.pbx_extension;
            },
            primaryNumber() {
                return numberFilter(this.seat.primary_number);
            },
            seatModel() {
                return {
                    id: this.id,
                    name: this.changes.name,
                    extension: this.changes.extension,
                    primaryNumber: this.primaryNumber,
                    aliasNumbers: this.changes.aliasNumbers,
                    groups: this.changes.groups
                }
            },
            isLoading() {
                return this.loading;
            },
            titleIcon() {
                if(!this.expanded) {
                    return 'keyboard arrow down';
                }
                else {
                    return 'keyboard arrow up';
                }
            },
            isMobile() {
                return Platform.is.mobile;
            },
            nameHasChanges() {
                return this.name !== this.changes.name;
            },
            nameButtons() {
                let buttons = [];
                let self = this;
                if(this.nameHasChanges) {
                    buttons.push({
                            icon: 'check',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.saveName();
                            }
                        }, {
                            icon: 'clear',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.resetName();
                            }
                        }
                    );
                }
                return buttons;
            },
            extensionHasChanges() {
                return this.extension + "" !== this.changes.extension + "";
            },
            extensionButtons() {
                let buttons = [];
                let self = this;
                if(this.extensionHasChanges) {
                    buttons.push({
                            icon: 'check',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.saveExtension();
                            }
                        }, {
                            icon: 'clear',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.resetExtension();
                            }
                        }
                    );
                }
                return buttons;
            },
            aliasNumbersChanges() {
                return !_.isEqual(this.changes.aliasNumbers.sort(),
                    this.numbersToIds(this.seat.alias_numbers).sort());
            },
            aliasNumberButtons() {
                let buttons = [];
                let self = this;
                if(this.aliasNumbersChanges) {
                    buttons.push({
                            icon: 'check',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.saveAliasNumbers();
                            }
                        }, {
                            icon: 'clear',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.resetAliasNumbers();
                            }
                        }
                    );
                }
                return buttons;
            },
            groupChanges() {
                return !_.isEqual(this.changes.groups.sort(),
                    this.groupsToIds(this.seat.groups).sort());
            },
            groupButtons() {
                let buttons = [];
                let self = this;
                if(this.groupChanges) {
                    buttons.push({
                            icon: 'check',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.saveGroups();
                            }
                        }, {
                            icon: 'clear',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.resetGroups();
                            }
                        }
                    );
                }
                return buttons;
            },
            hasGroups() {
                return _.isArray(_.get(this.seat, 'groups')) && this.seat.groups.length > 0;
            }
        },
        methods: {
            toggleMain() {
                this.expanded = !this.expanded;
            },
            remove() {
                this.$emit('remove', this.seatModel);
            },
            resetName() {
                this.changes.name = this.seat.display_name;
            },
            saveName() {
                this.$emit('save-name', this.seatModel);
            },
            resetExtension() {
                this.changes.extension = this.seat.pbx_extension;
            },
            saveExtension() {
                this.$emit('save-extension', this.seatModel);
            },
            numbersToIds(aliasNumbers) {
                let numbers = [];
                if(_.isArray(aliasNumbers)) {
                    aliasNumbers.forEach((number) => {
                        numbers.push(number.number_id);
                    });
                }
                return numbers;
            },
            resetAliasNumbers() {
                this.changes.aliasNumbers = this.numbersToIds(this.seat.alias_numbers);
            },
            saveAliasNumbers() {
                var oldNumbers = this.numbersToIds(this.seat.alias_numbers);
                var numbersToAdd = _.difference(this.changes.aliasNumbers, oldNumbers);
                var numbersToRemove = _.difference(oldNumbers, this.changes.aliasNumbers);
                this.$emit('save-alias-numbers', {
                    item: this.seatModel,
                    add: numbersToAdd,
                    remove: numbersToRemove
                });
            },
            getSeat() {
                return {
                    name: this.seat.display_name,
                    extension: this.seat.pbx_extension,
                    aliasNumbers: this.numbersToIds(this.seat.alias_numbers),
                    groups: this.groupsToIds(this.seat.groups)
                }
            },
            groupsToIds(groups) {
                let groupIds = [];
                if(_.isArray(groups)) {
                    groups.forEach((group) => {
                        groupIds.push(group.id);
                    });
                }
                return groupIds;
            },
            resetGroups() {
                this.changes.groups = this.groupsToIds(this.seat.groups);
            },
            saveGroups() {
                this.$emit('save-groups', this.seatModel);
            },
        },
        watch: {
            seat() {
                this.changes = this.getSeat()
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common';
</style>
