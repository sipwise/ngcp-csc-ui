<template>
    <div class="csc-add-form csc-pbx-seat-add-form">
        <q-card v-if="enabled">
            <q-card-title>
                <q-icon name="add" color="primary" size="24px"/>
                <span>{{ $t('pbxConfig.addSeat') }}</span>
            </q-card-title>
            <q-card-main>
                <q-field>
                    <q-input :disabled="isRequesting" ref="name" v-model="form.name" autofocus
                             :float-label="$t('pbxConfig.seatName')" clearable />
                </q-field>
                <q-field>
                    <q-input :disabled="isRequesting" type="number" v-model="form.extension" clearable
                             min="1" max="1000000" :float-label="$t('pbxConfig.extension')"  />
                </q-field>
                <q-field>
                    <q-select :disabled="isRequesting" v-model="form.aliasNumbers" multiple chips readonly clearable
                              :float-label="$t('pbxConfig.aliasNumbers')" :options="aliasNumberOptions" />
                </q-field>
                <q-field>
                    <q-select :disabled="isRequesting" v-model="form.groups" multiple chips readonly clearable
                              :float-label="$t('pbxConfig.groups')" :options="groupOptions" />
                </q-field>
            </q-card-main>
            <q-card-separator/>
            <q-card-actions align="center">
                <q-btn v-if="!isRequesting" flat color="secondary" icon="clear"
                       @click="cancel()">{{ $t('buttons.cancel') }}</q-btn>
                <q-btn loader v-model="isRequesting" flat color="primary" icon="done"
                       @click="save()">{{ $t('buttons.save') }}</q-btn>
            </q-card-actions>
            <q-inner-loading :visible="isRequesting">
                <q-spinner-mat size="60px" color="primary"></q-spinner-mat>
            </q-inner-loading>
        </q-card>
        <q-card v-else flat>
            <q-card-actions align="center">
                <q-btn color="primary" icon="add" flat @click="add()">{{ $t('pbxConfig.addSeat') }}</q-btn>
            </q-card-actions>
        </q-card>
    </div>
</template>

<script>
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
        QSpinnerDots,
        QSpinnerMat,
        Dialog
    } from 'quasar-framework'

    export default {
        name: 'csc-pbx-seat-add-form',
        props: [
            'aliasNumberOptions',
            'groupOptions'
        ],
        components: {
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
            QSpinnerDots,
            QSpinnerMat,
            Dialog
        },
        data () {
            return {
                form: this.getDefaultData(),
                enabled: false,
                loading: false
            }
        },
        computed: {
            isRequesting() {
                return this.loading;
            }
        },
        methods: {
            getDefaultData() {
                return {
                    name: '',
                    extension: '',
                    aliasNumbers: [],
                    groups: []
                }
            },
            cancel() {
                this.enabled = false;
            },
            add() {
                this.enabled = true;
                this.form =  this.getDefaultData();
            },
            save() {
                this.loading = true;
                this.$emit('save', {
                    name: this.form.name,
                    extension: this.form.extension,
                    aliasNumbers: this.form.aliasNumbers,
                    groups: this.form.groups
                });
            },
            succeeded() {
                this.loading = false;
                this.enabled = false;
            },
            failed() {
                this.loading = false;
                this.enabled = true;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';

    .csc-pbx-seat-add-form .q-card {
        position: relative;
    }
    .csc-pbx-seat-add-form .q-card .q-field:last-child {
        margin-bottom: 36px;
    }
</style>
