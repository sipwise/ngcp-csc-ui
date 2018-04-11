<template>
    <q-card class="csc-pbx-seat">
        <q-card-title class="cursor-pointer" @click="toggleMain()">
            <q-icon name="person" color="primary" size="24px"/>
            <span v-if="!expanded" class="csc-pbx-seat-title">{{ seat.display_name }}</span>
            <q-chip v-if="!expanded" pointing="left" color="primary" class="gt-md">
                {{ $t('pbxConfig.extension') }}: <span class="csc-important">{{ seat.pbx_extension }}</span>
            </q-chip>
            <q-icon :name="titleIcon" color="primary" size="22px" slot="right"/>
        </q-card-title>
        <q-card-main v-if="expanded" class="transition-generic">
            <q-field :label="$t('pbxConfig.seatName')">
                <q-input v-model="changes.name" :after="nameButtons" @keyup.enter="saveName" />
            </q-field>
            <q-field :label="$t('pbxConfig.extension')">
                <q-input v-model="changes.extension" type="number"
                         :after="extensionButtons" @keyup.enter="saveExtension" />
            </q-field>
            <q-field :label="$t('pbxConfig.primaryNumber')">
                <q-input v-model="primaryNumber" readonly disabled />
            </q-field>
            <q-field :label="$t('pbxConfig.aliasNumbers')">
                <q-select ref="aliasNumbers" v-model="changes.aliasNumbers" :options="aliasNumberOptions"
                          multiple chips clearable :after="aliasNumberButtons" @change="aliasNumberChange"/>
            </q-field>
            <q-field :label="$t('pbxConfig.groups')">
                <q-select v-model="changes.groups" :options="groupOptions" multiple chips clearable
                          :after="groupButtons" @change="groupChange" />
            </q-field>
        </q-card-main>
        <q-card-actions align="center">
            <q-btn flat :small="isMobile" :round="isMobile"
                   color="negative" icon="delete" @click="remove()">Delete</q-btn>
        </q-card-actions>
        <q-inner-loading :visible="isLoading">
            <q-spinner-mat size="60px" color="primary"></q-spinner-mat>
        </q-inner-loading>
    </q-card>
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
        Platform
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
            QTransition
        },
        computed: {
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
                if(this.expanded) {
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
            }
        },
        methods: {
            toggleMain() {
                if(this.expanded) {
                    this.expanded = false;
                }
                else {
                    this.expanded = true;
                }
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
    .csc-pbx-seat {
        position: relative;
    }
    .csc-pbx-seat .csc-pbx-seat-title {
        padding-left: 8px;
    }
    .csc-important {
        font-weight: bold;
    }
</style>
