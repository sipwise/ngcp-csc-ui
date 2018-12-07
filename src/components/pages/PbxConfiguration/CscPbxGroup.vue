<template>
    <q-item :class="itemClasses">
        <q-item-side
            v-if="!expanded"
        >
            <q-icon
                size="24px"
                name="group"
                color="white"
            />
        </q-item-side>
        <q-item-main>
            <q-item-tile
                v-if="!expanded"
                class="csc-item-title"
                label
            >
                {{ group.display_name }}
            </q-item-tile>
            <q-item-tile
                v-if="!expanded"
                class="csc-item-subtitle"
                sublabel
            >
                <div>
                    <span class="csc-item-label">{{ $t('pbxConfig.extension') }}:</span>
                    <span class="csc-item-value">{{ group.pbx_extension }}</span>
                </div>
            </q-item-tile>
            <q-item-tile
                v-if="!expanded"
                class="csc-item-subtitle"
                sublabel
            >
                <div
                    v-if="!hasSeats"
                    class="csc-form-info"
                >
                    <q-icon name="info" color="info" size="24px"/>
                    <span class="csc-info-text">{{ $t('pbxConfig.noSeatAssigned') }}</span>
                </div>
                <div
                    class="csc-item-field"
                    v-if="hasSeats"
                >
                    <span
                        class="csc-item-label"
                    >{{ $t('pbxConfig.seats') }}:
                    </span>
                    <span
                        class="csc-item-value"
                        v-for="seat in group.seats"
                    >{{ seat.display_name }}
                    </span>
                </div>
            </q-item-tile>
            <q-item-tile
                class="csc-list-item-main"
                v-if="expanded"
            >
                <q-field :label="$t('pbxConfig.groupName')">
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
                        type="number"
                        :after="extensionButtons"
                        @keyup.enter="saveExtension"
                    />
                </q-field>
                <q-field :label="$t('pbxConfig.huntPolicy')">
                    <q-select
                        dark
                        v-model="changes.huntPolicy"
                        :options="huntPolicyOptions"
                        radio
                        @change="huntPolicyChanged"
                    />
                </q-field>
                <q-field :label="$t('pbxConfig.huntTimeout')">
                    <q-input
                        dark
                        v-model="changes.huntTimeout"
                        type="number"
                        suffix="seconds"
                        :after="huntTimeoutButtons"
                        :min="0"
                        @keyup.enter="saveHuntTimeout"
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
                <q-field :label="$t('pbxConfig.seats')">
                    <q-select
                        dark
                        v-model="changes.seats"
                        :options="seatOptions"
                        multiple
                        chips
                        clearable
                        :after="seatButtons"
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
                    icon="more_vert"
                    color="primary"
                    flat
                >
                    <q-popover
                        ref="morePopover"
                        anchor="bottom right"
                        self="top right"
                    >
                        <q-list
                            class="csc-item-buttons-menu"
                            no-border
                        >
                            <q-item
                                link
                                @click="$router.push(callQueueRouteWithId)"
                            >
                                <q-item-side
                                    icon="queue"
                                    color="primary"
                                />
                                <q-item-main
                                    :label="$t('pbxConfig.callQueue')"
                                />
                            </q-item>
                            <q-item
                                link
                                @click="remove"
                            >
                                <q-item-side
                                    icon="delete"
                                    color="negative"
                                />
                                <q-item-main
                                    :label="$t('buttons.remove')"
                                />
                            </q-item>
                        </q-list>
                    </q-popover>
                </q-btn>
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
        QAlert,
        QList,
        QPopover
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
            QTransition,
            QItem,
            QItemSide,
            QItemMain,
            QItemTile,
            QAlert,
            QList,
            QPopover
        },
        computed: {
            callQueueRouteWithId() {
                return {
                    path: '/user/pbx-configuration/call-queues',
                    query: { item: this.id }
                   // query: { item: 341 }
                };
            },
            itemClasses() {
                let classes = ['csc-list-item', 'csc-pbx-group'];
                if (this.expanded) {
                    classes.push('csc-item-expanded');
                }
                else {
                    classes.push('csc-item-collapsed');
                }
                return classes;
            },
            entityTitle() {
                return this.group.display_name ?
                    this.group.display_name : this.group.username;
            },
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
            },
            hasSeats() {
                return _.isArray(_.get(this.group, 'seats')) && this.group.seats.length > 0;
            }
        },
        methods: {
            toggleMain() {
                this.expanded = !this.expanded;
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
                this.changes = this.getGroup();
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables';
</style>
