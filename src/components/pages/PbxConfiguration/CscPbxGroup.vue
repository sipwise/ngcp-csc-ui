<template>
    <q-card class="csc-card-collapsible csc-pbx-group">
        <q-card-title>
            <q-icon name="group" color="primary" size="22px"/>
            <span class="csc-pbx-group-title">{{ group.display_name }}</span>
            <csc-number-chip :item="group" />
        </q-card-title>
        <q-card-main>
            <q-field label="Name">
                <q-input v-model="name" readonly/>
            </q-field>
            <q-field label="Extension">
                <q-input v-model="extension" readonly />
            </q-field>
            <q-field label="Hunt Policy">
                <q-select v-model="huntPolicy" :options="huntPolicyOptions" readonly />
            </q-field>
            <q-field label="Hunt Timeout">
                <q-input v-model="huntTimeout" readonly suffix="s" readonly/>
            </q-field>
            <q-field label="Primary Number">
                <q-select v-model="primaryNumber" :options="allPrimaryNumbers" radio readonly disabled />
            </q-field>
            <q-field label="Alias Numbers">
                <q-select v-model="aliasNumbers" :options="allAliasNumbers" multiple chips readonly />
            </q-field>
            <q-field label="Seats">
                <q-select v-model="assignedSeats" :options="allSeats" multiple chips readonly />
            </q-field>
        </q-card-main>
        <q-card-actions>

        </q-card-actions>
    </q-card>
</template>

<script>
    import CscNumberChip  from '../../card/CscNumberChip'
    import numberFilter from '../../../filters/number'
    import {
        QCard,
        QCardTitle,
        QCardMain,
        QCardActions,
        QField,
        QInput,
        QIcon,
        QSelect
    } from 'quasar-framework'
    export default {
        name: 'csc-pbx-group',
        props: ['group'],
        data () {
            return {}
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
            CscNumberChip
        },
        computed: {
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
                return this.group.primary_number.number_id;
            },
            aliasNumbers() {
                let numbers = [];
                console.log(this.group.alias_numbers);
                if(this.group.alias_numbers) {
                    this.group.alias_numbers.forEach((number)=>{
                        numbers.push(number.number_id);
                    });
                }
                return numbers;
            },
            huntPolicyOptions() {
                return [
                    {
                        label: 'Serial Ringing',
                        value: 'serial'
                    },
                    {
                        label: 'Parallel Ringing',
                        value: 'parallel'
                    },
                    {
                        label: 'Random Ringing',
                        value: 'random'
                    },
                    {
                        label: 'Circular Ringing',
                        value: 'circular'
                    }
                ];
            },
            assignedSeats() {
                let seats = [];
                if(this.group.seats) {
                    this.group.seats.forEach((seat)=>{
                        seats.push(seat.id);
                    });
                }
                return seats;
            },
            allSeats() {
                let seats = [];
                if(this.$store.getters['pbxConfig/seats']) {
                    this.$store.getters['pbxConfig/seats'].forEach((seat)=>{
                        seats.push({
                            label: seat.display_name,
                            value: seat.id
                        });
                    });
                }
                return seats;
            },
            allPrimaryNumbers() {
                let numbers = [];
                if(this.$store.getters['pbxConfig/numbers']) {
                    this.$store.getters['pbxConfig/numbers'].forEach((number)=>{
                        if(number.is_primary) {
                            numbers.push({
                                label: numberFilter(number),
                                value: number.id
                            });
                        }
                    });
                }
                return numbers;
            },
            allAliasNumbers() {
                let numbers = [];
                if(this.$store.getters['pbxConfig/numbers']) {
                    this.$store.getters['pbxConfig/numbers'].forEach((number)=>{
                        if(!number.is_primary) {
                            numbers.push({
                                label: numberFilter(number),
                                value: number.id
                            });
                        }
                    });
                }
                return numbers;
            }
        }
    }
</script>

<style>
    .csc-pbx-group .csc-pbx-group-title {
        padding-left: 8px;
    }
</style>
