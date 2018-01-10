<template>
    <csc-page id="csc-page-pbx-groups" title="Groups">
        <q-card v-if="groupFormEnabled" class="add-form">
            <q-card-title>
                <q-icon name="add" color="primary" size="22px"/>
                <span>Add Group</span>
            </q-card-title>
            <q-card-main>
                <q-field>
                    <q-input :disabled="addGroupIsRequesting" ref="groupName" v-model="groupForm.name" autofocus
                             :float-label="$t('pbxConfig.groupName')"  clearable />
                </q-field>
                <q-field>
                    <q-input :disabled="addGroupIsRequesting" type="number" v-model="groupForm.extension" clearable min="1" max="1000000"
                             :float-label="$t('pbxConfig.extension')"  />
                </q-field>
                <q-field>
                    <q-select :disabled="addGroupIsRequesting" v-model="groupForm.huntPolicy" :float-label="$t('pbxConfig.huntPolicy')"
                              :options="huntPolicyOptions" radio />
                </q-field>
                <q-field >
                    <q-input :disabled="addGroupIsRequesting" type="number" v-model="groupForm.huntTimeout" :float-label="$t('pbxConfig.huntTimeout')"
                             suffix="seconds" min="1" max="3600" clearable />
                </q-field>
                <q-field>
                    <q-select :disabled="addGroupIsRequesting" v-model="groupForm.aliasNumbers" :float-label="$t('pbxConfig.aliasNumbers')"
                              :options="aliasNumberOptions" multiple chips readonly clearable />
                </q-field>
                <q-field>
                    <q-select :disabled="addGroupIsRequesting" v-model="groupForm.seats" :float-label="$t('pbxConfig.seats')"
                              :options="seatOptions" multiple chips readonly clearable />
                </q-field>
            </q-card-main>
            <q-card-separator/>
            <q-card-actions align="center">
                <q-btn v-if="!addGroupIsRequesting" flat color="secondary" icon="clear" @click="disableGroupForm()">{{ $t('buttons.cancel') }}</q-btn>
                <q-btn loader v-model="addGroupIsRequesting" flat color="primary" icon="done" @click="addGroup()">{{ $t('buttons.save') }}</q-btn>
            </q-card-actions>
        </q-card>
        <q-card v-else flat>
            <q-card-actions align="center">
                <q-btn color="primary" icon="add" flat @click="enableGroupForm">{{ $t('pbxConfig.addGroup') }}</q-btn>
            </q-card-actions>
        </q-card>
        <q-card v-if="listIsRequesting && !removeGroupIsRequesting" flat>
            <q-card-actions align="center">
                <q-spinner-dots  color="primary" :size="40"/>
            </q-card-actions>
        </q-card>
        <csc-pbx-group v-for="group in groups" :group="group" :alias-number-options="aliasNumberOptions"
                       :seat-options="seatOptions" :hunt-policy-options="huntPolicyOptions" @remove="removeGroup"
                       :loading="removeGroupIsRequesting && group.id == removeGroupId" />
    </csc-page>
</template>

<script>

    import { startLoading, stopLoading, showGlobalError, showToast } from '../../../helpers/ui'
    import CscPage  from '../../CscPage'
    import CscPbxGroup  from './CscPbxGroup'
    import {
        QChip,
        QCard,
        QCardSeparator,
        QCardTitle,
        QCardMain,
        QCardActions,
        QIcon,
        QPopover,
        QList,
        QItem,
        QItemMain,
        QField,
        QInput,
        QBtn,
        QSelect,
        QInnerLoading,
        QSpinnerGears,
        QSpinnerDots,
        Dialog
    } from 'quasar-framework'
    import { mapState } from 'vuex'
    import numberFilter from '../../../filters/number'

    export default {
        components: {
            CscPage,
            QChip,
            QCard,
            QCardSeparator,
            QCardTitle,
            QCardMain,
            QCardActions,
            QIcon,
            QPopover,
            QList,
            QItem,
            QItemMain,
            QField,
            QInput,
            CscPbxGroup,
            QBtn,
            QSelect,
            QInnerLoading,
            QSpinnerGears,
            QSpinnerDots,
            Dialog
        },
        mounted() {
            this.$store.dispatch('pbxConfig/listGroups');
        },
        data () {
            return {
                groupForm: {
                    name: '',
                    extension: '',
                    huntPolicy: 'serial',
                    huntTimeout: 10,
                    aliasNumbers: [],
                    seats: []
                },
                groupFormEnabled: false,
            }
        },
        computed: {
            groups() {
                return this.$store.getters['pbxConfig/groups'];
            },
            seats() {
                return this.$store.getters['pbxConfig/seats'];
            },
            aliasNumbers() {
                return this.$store.getters['pbxConfig/aliasNumbers'];
            },
            huntPolicyOptions() {
                return [
                    {
                        label: this.$t('pbxConfig.serialRinging'),
                        value: 'serial'
                    },
                    {
                        label: this.$t('pbxConfig.parallelRinging'),
                        value: 'parallel'
                    },
                    {
                        label: this.$t('pbxConfig.randomRinging'),
                        value: 'random'
                    },
                    {
                        label: this.$t('pbxConfig.circularRinging'),
                        value: 'circular'
                    }
                ];
            },
            aliasNumberOptions() {
                let aliasNumber = [];
                this.aliasNumbers.forEach((number)=>{
                    let owner = this.$t('pbxConfig.allocatedByNobody');
                    if(number.subscriber !== null && number.subscriber.display_name !== null &&
                        number.subscriber.is_pbx_group) {
                        owner = this.$t('pbxConfig.allocatedBy', {
                            type: this.$t('pbxConfig.group'),
                            name:  number.subscriber.display_name
                        });
                    } else if (number.subscriber !== null && number.subscriber.display_name !== null) {
                        owner = this.$t('pbxConfig.allocatedBy', {
                            type: this.$t('pbxConfig.seat'),
                            name:  number.subscriber.display_name
                        });
                    }
                    aliasNumber.push({
                        label: numberFilter(number),
                        sublabel: owner,
                        value: number.id
                    });
                });
                return aliasNumber;
            },
            seatOptions() {
                let seats = [];
                this.seats.forEach((seat)=>{
                    seats.push({
                        label: seat.display_name,
                        sublabel: this.$t('pbxConfig.extension') + ': ' + seat.pbx_extension,
                        value: seat.id
                    });
                });
                return seats;
            },
            listIsRequesting() {
                return this.listState === 'requesting';
            },
            listState() {
                return this.$store.state.pbxConfig.listAllState;
            },
            listError() {
                return this.$store.state.pbxConfig.listAllError;
            },
            addGroupIsRequesting() {
                return this.addGroupState === 'requesting';
            },
            addGroupState() {
                return this.$store.state.pbxConfig.addGroupState;
            },
            addGroupError() {
                return this.$store.state.pbxConfig.addGroupError;
            },
            removeGroupState() {
                return this.$store.state.pbxConfig.removeGroupState;
            },
            removeGroupIsRequesting() {
                return this.removeGroupState === 'requesting' ||
                    this.removeGroupState === 'succeeded';
            },
            removeGroupId() {
                return this.$store.state.pbxConfig.removeGroupItem.id;
            }
        },
        watch: {
            addGroupState(state) {
                if(state === 'failed') {
                    showGlobalError(this.addGroupError);
                }
                if(state === 'succeeded') {
                    this.disableGroupForm();
                }
            },
            removeGroupState(state) {
                if(state === 'failed') {
                    showGlobalError(this.removeGroupError);
                }
            }
        },
        methods: {
            resetGroupForm() {
                this.groupForm = {
                    name: '',
                    extension: '',
                    huntPolicy: 'serial',
                    huntTimeout: 10,
                    aliasNumbers: [],
                    seats: []
                }
            },
            enableGroupForm() {
                this.resetGroupForm();
                this.groupFormEnabled = true;
            },
            disableGroupForm() {
                this.resetGroupForm();
                this.groupFormEnabled = false;
            },
            addGroup() {
                this.$store.dispatch('pbxConfig/addGroup', this.groupForm);
            },
            removeGroup(group) {
                var store = this.$store;
                var state = this;
                var i18n = this.$i18n;
                Dialog.create({
                    title: i18n.t('pbxConfig.removeGroupTitle'),
                    message: i18n.t('pbxConfig.removeGroupText', { group: group.name }),
                    buttons: [
                        'Cancel',
                        {
                            label: i18n.t('pbxConfig.removeGroup'),
                            color: 'negative',
                            handler () {
                                store.dispatch('pbxConfig/removeGroup', group);
                            }
                        }
                    ]
                });
            }
        }
    }
</script>

<style lang="stylus">
    @import '../../../../src/themes/app.variables.styl';
    .add-form .q-field:last-child {
        margin-bottom: 36px;
    }
</style>
