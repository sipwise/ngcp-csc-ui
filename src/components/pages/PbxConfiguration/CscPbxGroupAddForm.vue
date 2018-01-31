<template>
    <q-card class="csc-pbx-group-add-form">
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
        <q-inner-loading :visible="addGroupIsRequesting">
            <q-spinner-mat size="60px" color="primary"></q-spinner-mat>
        </q-inner-loading>
    </q-card>
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
        QSpinnerDots,
        QSpinnerMat,
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
            QSpinnerDots,
            QSpinnerMat,
            Dialog
        },
        data () {
            return {
                group: {
                    name: '',
                    extension: '',
                    huntPolicy: 'serial',
                    huntTimeout: 10,
                    aliasNumbers: [],
                    seats: []
                },
            }
        },
        computed: {

        },
        methods: {
            save() {

            },
            cancel() {

            }
        }
    }
</script>

<style lang="stylus">
    @import '../../../../src/themes/app.variables.styl';
    .add-form {
        position: relative;
    }
    .add-form .q-field:last-child {
        margin-bottom: 36px;
    }
</style>
