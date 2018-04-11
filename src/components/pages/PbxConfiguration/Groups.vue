<template>
    <csc-page id="csc-page-pbx-groups" title="Groups">
        <csc-pbx-group-add-form v-show="addFormEnabled" ref="addForm" @save="addGroup" @cancel="disableAddForm"
                                :loading="isAdding" :alias-number-options="aliasNumberOptions"
                                :seat-options="seatOptions" :hunt-policy-options="huntPolicyOptions"/>
        <q-card v-show="!addFormEnabled" flat>
            <q-card-actions align="center">
                <q-btn color="primary" icon="add" flat @click="enableAddForm">
                    {{ $t('pbxConfig.addGroup') }}
                </q-btn>
            </q-card-actions>
        </q-card>
        <q-card v-if="isListRequesting && !listLoadingSilently" flat>
            <q-card-actions align="center">
                <q-spinner-dots  color="primary" :size="40"/>
            </q-card-actions>
        </q-card>
        <csc-pbx-group v-for="group in groups" :key="group.id" :group="group" :alias-number-options="aliasNumberOptions"
                       :seat-options="seatOptions" :hunt-policy-options="huntPolicyOptions" @remove="removeGroup"
                       :loading="isItemLoading(group.id)" @save-name="setGroupName" @save-extension="setGroupExtension"
                        @save-hunt-policy="setGroupHuntPolicy" @save-hunt-timeout="setGroupHuntTimeout"
                        @save-alias-numbers="updateAliasNumbers" @save-seats="updateSeats" />
    </csc-page>
</template>

<script>
    import { mapGetters } from 'vuex'
    import CscPage  from '../../CscPage'
    import CscPbxGroup  from './CscPbxGroup'
    import CscPbxGroupAddForm  from './CscPbxGroupAddForm'
    import { QChip, QCard, QCardSeparator, QCardTitle, QCardMain,
        QCardActions, QIcon, QPopover, QList, QItem, QItemMain,
        QField, QInput, QBtn, QSelect, QInnerLoading, QSpinnerDots,
        QSpinnerMat, Dialog
    } from 'quasar-framework'
    import aliasNumberOptions from '../../../mixins/alias-number-options'
    import itemError from '../../../mixins/item-error'

    export default {
        mixins: [aliasNumberOptions, itemError],
        components: {
            CscPage, CscPbxGroup, CscPbxGroupAddForm,
            QChip, QCard, QCardSeparator, QCardTitle, QCardMain,
            QCardActions, QIcon, QPopover, QList, QItem, QItemMain,
            QField, QInput, QBtn, QSelect, QInnerLoading, QSpinnerDots,
            QSpinnerMat, Dialog
        },
        mounted() {
            this.$store.dispatch('pbxConfig/listGroups');
        },
        data () {
            return {
                addFormEnabled: false
            }
        },
        computed: {
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
            ...mapGetters('pbxConfig', [
                'groups',
                'seats',
                'aliasNumbers',
                'addState',
                'isAdding',
                'isUpdating',
                'updateItemId',
                'isRemoving',
                'removeItemId',
                'isListRequesting',
                'listState',
                'listError',
                'listLoadingSilently'
            ])
        },
        watch: {
            addState(state) {
                if(state === 'succeeded') {
                    this.disableAddForm();
                }
            }
        },
        methods: {
            isItemLoading(groupId) {
                return (this.isUpdating && this.updateItemId + "" === groupId + "") ||
                    (this.isRemoving && this.removeItemId + "" === groupId + "");
            },
            resetAddForm() {
                this.$refs.addForm.reset();
            },
            enableAddForm() {
                this.resetAddForm();
                this.addFormEnabled = true;
            },
            disableAddForm() {
                this.resetAddForm();
                this.addFormEnabled = false;
            },
            addGroup(group) {
                this.$store.dispatch('pbxConfig/addGroup', group);
            },
            removeGroup(group) {
                var store = this.$store;
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
            },
            setGroupName(group) {
                this.$store.dispatch('pbxConfig/setGroupName', group);
            },
            setGroupExtension(group) {
                this.$store.dispatch('pbxConfig/setGroupExtension', group);
            },
            setGroupHuntPolicy(group) {
                this.$store.dispatch('pbxConfig/setGroupHuntPolicy', group);
            },
            setGroupHuntTimeout(group) {
                this.$store.dispatch('pbxConfig/setGroupHuntTimeout', group);
            },
            updateAliasNumbers(data) {
                this.$store.dispatch('pbxConfig/updateAliasNumbers', data);
            },
            updateSeats(data) {
                this.$store.dispatch('pbxConfig/updateSeats', data);
            }
        }
    }
</script>

<style lang="stylus">
    @import '../../../themes/quasar.variables.styl';
    .add-form {
        position: relative;
    }
    .add-form .q-field:last-child {
        margin-bottom: 36px;
    }
</style>
