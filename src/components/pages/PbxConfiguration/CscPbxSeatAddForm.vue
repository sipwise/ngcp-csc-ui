<template>
    <q-card class="csc-pbx-seat-add-form shadow-1">
        <q-card-title>
            <q-icon name="add" color="primary" size="22px"/>
            <span>{{ $t('pbxConfig.addSeat') }}</span>
        </q-card-title>
        <q-card-main>
            <q-field>
                <q-input :disabled="loading" :readonly="loading" v-model="data.name" autofocus
                         :float-label="$t('pbxConfig.seatName')"  clearable />
            </q-field>
            <q-field>
                <q-input :disabled="loading" :readonly="loading" type="number" v-model="data.extension"
                         clearable min="1" max="1000000" :float-label="$t('pbxConfig.extension')"  />
            </q-field>
            <q-field>
                <q-select :disabled="loading" :readonly="loading" v-model="data.aliasNumbers" multiple chips clearable
                          :float-label="$t('pbxConfig.aliasNumbers')" :options="aliasNumberOptions" />
            </q-field>
            <q-field>
                <q-select :disabled="loading" :readonly="loading" v-model="data.groups" multiple chips clearable
                          :float-label="$t('pbxConfig.groups')" :options="groupOptions" />
            </q-field>
        </q-card-main>
        <q-card-separator/>
        <q-card-actions align="center">
            <q-btn v-if="!loading" flat color="secondary" icon="clear"
                   @click="cancel()">{{ $t('buttons.cancel') }}</q-btn>
            <q-btn v-if="!loading" flat color="primary" icon="done"
                   @click="save()">{{ $t('buttons.save') }}</q-btn>
        </q-card-actions>
        <q-inner-loading :visible="loading">
            <q-spinner-mat size="60px" color="primary"></q-spinner-mat>
        </q-inner-loading>
    </q-card>
</template>

<script>

    import { QCard, QCardTitle, QCardMain, QCardActions, QCardSeparator, QBtn,
        QInnerLoading, QSpinnerMat, QField, QInput, QSelect, QIcon } from 'quasar-framework'

    export default {
        name: 'csc-pbx-seat-add-form',
        props: [
            'aliasNumberOptions',
            'groupOptions',
            'loading'
        ],
        components: {
            QCard, QCardTitle, QCardMain, QCardActions, QCardSeparator, QBtn,
            QInnerLoading, QSpinnerMat, QField, QInput, QSelect, QIcon
        },
        data () {
            return {
                data: this.getDefaults()
            }
        },
        methods: {
            getDefaults() {
                return {
                    name: '',
                    extension: '',
                    aliasNumbers: [],
                    groups: []
                }
            },
            cancel() {
                this.$emit('cancel');
            },
            save() {
                this.$emit('save', this.data);
            },
            reset() {
                this.data = this.getDefaults();
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
    .csc-pbx-seat-add-form
        position: relative
    .csc-pbx-seat-add-form
        .q-field:last-child
            margin-bottom: 36px
</style>
