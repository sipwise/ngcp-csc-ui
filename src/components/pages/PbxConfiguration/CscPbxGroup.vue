<template>
    <q-card class="csc-pbx-group">
        <q-card-title class="cursor-pointer" @click="toggleMain()">
            <q-icon name="group" color="primary" size="24px"/>
            <span v-if="!expanded" class="csc-pbx-group-title">{{ group.display_name }}</span>
            <q-chip v-if="!expanded" pointing="left" color="primary" class="gt-md">
                {{ $t('pbxConfig.extension') }}: <span class="csc-important">{{ group.pbx_extension }}</span>
            </q-chip>
            <q-icon :name="titleIcon" color="primary" size="22px" slot="right"/>
        </q-card-title>
        <q-card-main v-if="expanded" class="transition-generic">
            <q-field :label="$t('pbxConfig.groupName')">
                <q-input v-model="changes.name" :after="nameButtons" />
            </q-field>
            <q-field :label="$t('pbxConfig.extension')">
                <q-input v-model="changes.extension" type="number" :after="extensionButtons" />
            </q-field>
            <q-field :label="$t('pbxConfig.huntPolicy')">
                <q-select v-model="changes.huntPolicy" :options="huntPolicyOptions" radio @change="huntPolicyChanged"/>
            </q-field>
            <q-field :label="$t('pbxConfig.huntTimeout')">
                <q-input v-model="changes.huntTimeout" type="number" suffix="seconds" :after="huntTimeoutButtons" min="0" />
            </q-field>
            <q-field :label="$t('pbxConfig.primaryNumber')">
                <q-input v-model="primaryNumber" readonly disabled />
            </q-field>
            <q-field :label="$t('pbxConfig.aliasNumbers')">
                <q-select ref="aliasNumbers" v-model="changes.aliasNumbers" :options="aliasNumberOptions"
                          multiple chips clearable :after="aliasNumberButtons" @change="aliasNumberChange"/>
            </q-field>
            <q-field :label="$t('pbxConfig.seats')">
                <q-select v-model="changes.seats" :options="seatOptions" multiple chips clearable
                          :after="seatButtons" @change="seatChange" />
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
        name: 'csc-pbx-group',
        props: [
            'group',
            'huntPolicyOptions',
            'aliasNumberOptions',
            'seatOptions',
            'loading'
        ],
        data () {
            return {
                expanded: false,
                changes: this.getGroup()
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
                return this.group.id;
            },
            name() {
                return this.group.display_name;
            },
            extension() {
                return this.group.pbx_extension;
            },
            huntPolicy() {
                return this.group.pbx_hunt_policy;
            },
            huntTimeout() {
                return this.group.pbx_hunt_timeout;
            },
            primaryNumber() {
                return numberFilter(this.group.primary_number);
            },
            groupModel() {
                return {
                    id: this.id,
                    name: this.changes.name,
                    extension: this.changes.extension,
                    huntPolicy: this.changes.huntPolicy,
                    huntTimeout: this.changes.huntTimeout,
                    primaryNumber: this.primaryNumber,
                    aliasNumbers: this.changes.aliasNumbers,
                    seats: this.changes.seats
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
            huntPolicyHasChanges() {
                return this.huntPolicy !== this.changes.huntPolicy;
            },
            huntPolicyButtons() {
                let buttons = [];
                let self = this;
                if(this.huntPolicyHasChanges) {
                    buttons.push({
                            icon: 'check',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.saveHuntPolicy();
                            }
                        }, {
                            icon: 'clear',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.resetHuntPolicy();
                            }
                        }
                    );
                }
                return buttons;
            },
            huntTimeoutHasChanges() {
                return this.huntTimeout !== this.changes.huntTimeout;
            },
            huntTimeoutButtons() {
                let buttons = [];
                let self = this;
                if(this.huntTimeoutHasChanges) {
                    buttons.push({
                            icon: 'check',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.saveHuntTimeout();
                            }
                        }, {
                            icon: 'clear',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.resetHuntTimeout();
                            }
                        }
                    );
                }
                return buttons;
            },
            aliasNumbersChanges() {
                return !_.isEqual(this.changes.aliasNumbers.sort(),
                    this.numbersToIds(this.group.alias_numbers).sort());
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
            seatChanges() {
                return !_.isEqual(this.changes.seats.sort(),
                    this.seatsToIds(this.group.seats).sort());
            },
            seatButtons() {
                let buttons = [];
                let self = this;
                if(this.seatChanges) {
                    buttons.push({
                            icon: 'check',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.saveSeats();
                            }
                        }, {
                            icon: 'clear',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.resetSeats();
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
                this.$emit('remove', this.groupModel);
            },
            resetName() {
                this.changes.name = this.group.display_name;
            },
            saveName() {
                this.$emit('save-name', this.groupModel);
            },
            resetExtension() {
                this.changes.extension = this.group.pbx_extension;
            },
            saveExtension() {
                this.$emit('save-extension', this.groupModel);
            },
            resetHuntPolicy() {
                this.changes.huntPolicy = this.group.pbx_hunt_policy;
            },
            saveHuntPolicy() {
                this.$emit('save-hunt-policy', this.groupModel);
            },
            resetHuntTimeout() {
                this.changes.huntTimeout = this.group.pbx_hunt_timeout;
            },
            saveHuntTimeout() {
                this.$emit('save-hunt-timeout', this.groupModel);
            },
            huntPolicyChanged() {
                this.saveHuntPolicy();
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
                this.changes.aliasNumbers = this.numbersToIds(this.group.alias_numbers);
            },
            saveAliasNumbers() {
                var oldNumbers = this.numbersToIds(this.group.alias_numbers);
                var numbersToAdd = _.difference(this.changes.aliasNumbers, oldNumbers);
                var numbersToRemove = _.difference(oldNumbers, this.changes.aliasNumbers);
                this.$emit('save-alias-numbers', {
                    item: this.groupModel,
                    add: numbersToAdd,
                    remove: numbersToRemove
                });
            },
            getGroup() {
                return {
                    name: this.group.display_name,
                    extension: this.group.pbx_extension,
                    huntPolicy: this.group.pbx_hunt_policy,
                    huntTimeout: this.group.pbx_hunt_timeout,
                    aliasNumbers: this.numbersToIds(this.group.alias_numbers),
                    seats: this.seatsToIds(this.group.seats)
                }
            },
            seatsToIds(seats) {
                let seatIds = [];
                if(_.isArray(seats)) {
                    seats.forEach((seat) => {
                        seatIds.push(seat.id);
                    });
                }
                return seatIds;
            },
            resetSeats() {
                this.changes.seats = this.seatsToIds(this.group.seats);
            },
            saveSeats() {
                this.$emit('save-seats', this.groupModel);
            },
        },
        watch: {
            group() {
                this.changes = this.getGroup()
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-pbx-group {
        position: relative;
    }
    .csc-pbx-group .csc-pbx-group-title {
        padding-left: 8px;
    }
    .csc-important {
        font-weight: bold;
    }
</style>
