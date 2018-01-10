<template>
    <q-card class="csc-pbx-group">
        <q-card-title>
            <q-icon name="group" color="primary" size="22px"/>
            <span class="csc-pbx-group-title">{{ group.display_name }}</span>
            <q-chip pointing="left" color="primary">
                {{ $t('pbxConfig.extension') }}: <span class="csc-important">{{ group.pbx_extension }}</span>
            </q-chip>
        </q-card-title>
        <q-card-main>
            <q-field :label="$t('pbxConfig.groupName')">
                <q-input v-model="name" readonly />
            </q-field>
            <q-field :label="$t('pbxConfig.extension')">
                <q-input v-model="extension" readonly />
            </q-field>
            <q-field :label="$t('pbxConfig.huntPolicy')">
                <q-select v-model="huntPolicy" :options="huntPolicyOptions" readonly radio />
            </q-field>
            <q-field :label="$t('pbxConfig.huntTimeout')">
                <q-input v-model="huntTimeout" readonly suffix="seconds" readonly min="0" />
            </q-field>
            <q-field :label="$t('pbxConfig.primaryNumber')">
                <q-input v-model="primaryNumber" readonly disabled />
            </q-field>
            <q-field :label="$t('pbxConfig.aliasNumbers')">
                <q-select v-model="aliasNumbers" :options="aliasNumberOptions" multiple chips readonly clearable />
            </q-field>
            <q-field :label="$t('pbxConfig.seats')">
                <q-select v-model="seats" :options="seatOptions" multiple chips readonly clearable />
            </q-field>
        </q-card-main>
        <q-card-actions align="center">
            <q-btn :loader="isLoading" v-model="isLoading" flat round
                   color="negative" icon="delete" @click="remove()">Delete</q-btn>
        </q-card-actions>
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
        QBtn
    } from 'quasar-framework'
    export default {
        name: 'csc-pbx-group',
        props: ['group',
            'huntPolicyOptions',
            'aliasNumberOptions',
            'seatOptions',
            'loading'
        ],
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
            QChip,
            QBtn
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
            aliasNumbers() {
                let numbers = [];
                if(_.isArray(this.group.alias_numbers)) {
                    this.group.alias_numbers.forEach((number)=>{
                        numbers.push(number.number_id);
                    });
                }
                return numbers;
            },
            seats() {
                let seats = [];
                if(_.isArray(this.group.seats)) {
                    this.group.seats.forEach((seat)=>{
                        seats.push(seat.id);
                    });
                }
                return seats;
            },
            groupModel() {
                return {
                    id: this.id,
                    name: this.name,
                    extension: this.extension,
                    huntPolicy: this.huntPolicy,
                    huntTimeout: this.huntTimeout,
                    primaryNumber: this.primaryNumber,
                    aliasNumbers: this.aliasNumbers,
                    seats: this.seats
                }
            },
            isLoading() {
                return this.loading;
            }
        },
        methods: {
            remove() {
                this.$emit('remove', this.groupModel);
            }
        }
    }
</script>

<style>
    .csc-pbx-group .csc-pbx-group-title {
        padding-left: 8px;
    }
    .csc-important {
        font-weight: bold;
    }
</style>
