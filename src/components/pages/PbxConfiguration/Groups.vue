<template>
    <csc-page title="Groups">
        <q-card v-if="groupFormEnabled" class="add-form">
            <q-card-title>
                <q-icon name="add" color="primary" size="22px"/>
                <span>Add Group</span>
            </q-card-title>
            <q-card-main>
                <q-field>
                    <q-input ref="groupName" v-model="groupForm.name" autofocus
                             :float-label="$t('pbxConfig.groupName')"  clearable />
                </q-field>
                <q-field>
                    <q-input type="number" v-model="groupForm.extension" clearable min="1" max="1000000"
                             :float-label="$t('pbxConfig.extension')"  />
                </q-field>
                <q-field>
                    <q-select v-model="groupForm.huntPolicy" :float-label="$t('pbxConfig.huntPolicy')"
                              :options="huntPolicyOptions" radio />
                </q-field>
                <q-field >
                    <q-input type="number" v-model="groupForm.huntTimeout" :float-label="$t('pbxConfig.huntTimeout')"
                             suffix="seconds" min="1" max="3600" clearable />
                </q-field>
                <q-field>
                    <q-select v-model="groupForm.aliasNumbers" :float-label="$t('pbxConfig.aliasNumbers')"
                              :options="aliasNumberOptions" multiple chips readonly clearable />
                </q-field>
                <q-field>
                    <q-select v-model="groupForm.seats" :float-label="$t('pbxConfig.seats')"
                              :options="seatOptions" multiple chips readonly clearable />
                </q-field>
            </q-card-main>
            <q-card-separator/>
            <q-card-actions align="center">
                <q-btn flat color="secondary" icon="clear" @click="disableGroupForm()">{{ $t('buttons.cancel') }}</q-btn>
                <q-btn flat color="primary" icon="done" @click="addGroup()">{{ $t('buttons.save') }}</q-btn>
            </q-card-actions>
        </q-card>
        <q-card v-else flat>
            <q-card-actions align="center">
                <q-btn color="primary" icon="add" flat @click="enableGroupForm">{{ $t('pbxConfig.addGroup') }}</q-btn>
            </q-card-actions>
        </q-card>
        <csc-pbx-group v-for="group in groups" :group="group" :all-seats="seats"
                       :all-alias-numbers="aliasNumbers" :all-primary-numbers="primaryNumbers"
                        :alias-number-options="aliasNumberOptions" :seat-options="seatOptions"
                        :hunt-policy-options="huntPolicyOptions"/>
    </csc-page>
</template>

<script>

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
        QSelect
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
            QSelect
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
            }
        },
        methods: {
            enableGroupForm() {
                this.groupFormEnabled = true;
            },
            disableGroupForm() {
                this.groupFormEnabled = false;
            },
            addGroup() {
                this.$store.dispatch('pbxConfig/addGroup', this.groupForm);
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
