<template>
    <q-card class="csc-pbx-seat">
        <q-card-title class="cursor-pointer" @click="toggleMain()">
            <q-icon name="person" color="primary" size="24px"/>
            <span v-if="!expanded" class="csc-pbx-seat-title">{{ name }}</span>
            <q-chip v-if="!expanded" pointing="left" color="primary">
                {{ $t('pbxConfig.extension') }}: <span class="csc-important">{{ extension }}</span>
            </q-chip>
            <q-icon :name="titleIcon" color="primary" size="22px" slot="right"/>
        </q-card-title>
        <q-card-main v-if="expanded">
            <q-field :label="$t('pbxConfig.seatName')">
                <q-input v-model="name" readonly />
            </q-field>
            <q-field :label="$t('pbxConfig.extension')">
                <q-input v-model="extension" readonly />
            </q-field>
            <q-field :label="$t('pbxConfig.primaryNumber')">
                <q-input v-model="primaryNumber" readonly disabled />
            </q-field>
            <q-field :label="$t('pbxConfig.aliasNumbers')">
                <q-select v-model="aliasNumbers" :options="aliasNumberOptions" multiple chips readonly clearable />
            </q-field>
            <q-field :label="$t('pbxConfig.groups')">
                <q-select v-model="groups" :options="groupOptions" multiple chips readonly clearable />
            </q-field>
        </q-card-main>
        <q-card-actions align="center">
            <q-btn flat :small="isMobile" :round="isMobile" color="negative"
                   icon="delete" @click="remove()">Delete</q-btn>
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
        Platform,
        Dialog
    } from 'quasar-framework'
    export default {
        name: 'csc-pbx-seat',
        props: [
            'seat',
            'aliasNumberOptions',
            'groupOptions',
            'deleting'
        ],
        data () {
            return {
                expanded: false
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
            aliasNumbers() {
                let numbers = [];
                if(_.isArray(this.seat.alias_numbers)) {
                    this.seat.alias_numbers.forEach((number)=>{
                        numbers.push(number.number_id);
                    });
                }
                return numbers;
            },
            groups() {
                let groups = [];
                if(_.isArray(this.seat.groups)) {
                    this.seat.groups.forEach((group)=>{
                        groups.push(group.id);
                    });
                }
                return groups;
            },
            seatModel() {
                return {
                    id: this.id,
                    name: this.name,
                    extension: this.extension,
                    primaryNumber: this.primaryNumber,
                    aliasNumbers: this.aliasNumbers,
                    groups: this.groups
                }
            },
            isLoading() {
                return this.deleting;
            },
            cardClasses() {
                var cardClasses = ['csc-pbx-seat'];
                if(this.isLoading) {
                    cardClasses.push('light-dimmed');
                }
                return cardClasses;
            },
            titleIcon() {
                if(this.expanded) {
                    return 'keyboard arrow down';
                } else {
                    return 'keyboard arrow up';
                }
            },
            isMobile() {
                return Platform.is.mobile;
            }
        },
        methods: {
            toggleMain() {
                this.expanded = !this.expanded
            },
            remove() {
                var store = this.$store;
                var state = this;
                var i18n = this.$i18n;
                Dialog.create({
                    title: i18n.t('pbxConfig.removeSeatTitle'),
                    message: i18n.t('pbxConfig.removeSeatText', { seat: this.name }),
                    buttons: [
                        'Cancel',
                        {
                            label: i18n.t('pbxConfig.removeSeat'),
                            color: 'negative',
                            handler () {
                                state.loading = true;
                                state.$emit('remove', state.seatModel);
                            }
                        }
                    ]
                });
            }
        }
    }
</script>

<style>
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
