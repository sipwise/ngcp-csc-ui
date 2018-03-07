<template>
    <csc-page title="Seats">
        <csc-pbx-seat-add-form ref="addForm" :alias-number-options="aliasNumberOptions"
                               :group-options="groupOptions" @save="save" />
        <csc-pbx-seat-list :alias-number-options="aliasNumberOptions" :group-options="groupOptions"
                           :seats="seats" :loading="isListLoading" @remove="remove" :deleting-seat="deletingSeat" />
    </csc-page>
</template>

<script>
    import CscPage  from '../../CscPage'
    import CscPbxSeatAddForm  from './CscPbxSeatAddForm'
    import CscPbxSeatList  from './CscPbxSeatList'
    import { QChip, QCard, QCardSeparator, QCardTitle, QCardMain,
        QIcon, QPopover, QList, QItem, QItemMain } from 'quasar-framework'
    import aliasNumberOptions from '../../../mixins/alias-number-options'
    import { showGlobalError } from '../../../helpers/ui'

    export default {
        mixins: [aliasNumberOptions],
        mounted() {
            this.$store.dispatch('pbxConfig/listSeats');
        },
        data () {
            return {}
        },
        components: {
            CscPage,
            QChip,
            QCard,
            QCardSeparator,
            QCardTitle,
            QCardMain,
            QIcon,
            QPopover,
            QList,
            QItem,
            QItemMain,
            CscPbxSeatAddForm,
            CscPbxSeatList
        },
        computed: {
            addFormSucceeded() {
                return this.$store.state.pbxConfig.addSeatState === 'succeeded';
            },
            addFormFailed() {
                return this.$store.state.pbxConfig.addSeatState === 'failed';
            },
            addFormError() {
                return this.$store.state.pbxConfig.addSeatError;
            },
            isListLoading() {
                return this.$store.state.pbxConfig.listAllState === 'requesting';
            },
            removeError() {
                return this.$store.state.pbxConfig.removeSeatError;
            },
            groupOptions() {
                let groups = [];
                this.groups.forEach((group)=>{
                    groups.push({
                        label: group.display_name,
                        sublabel: this.$t('pbxConfig.extension') + ': ' + group.pbx_extension,
                        value: group.id
                    });
                });
                return groups;
            },
            seats() {
                return this.$store.getters['pbxConfig/seats'];
            },
            groups() {
                return this.$store.getters['pbxConfig/groups'];
            },
            deletingSeat() {
                return this.$store.state.pbxConfig.removeSeatItem;
            }
        },
        methods: {
            save(seat) {
                this.$store.dispatch('pbxConfig/addSeat', seat);
            },
            remove(seat) {
                this.$store.dispatch('pbxConfig/removeSeat', seat);
            }
        },
        watch: {
            addFormSucceeded() {
                this.$refs.addForm.succeeded();
            },
            addFormFailed() {
                if(this.addFormError !== null) {
                    this.$refs.addForm.failed();
                    showGlobalError(this.addFormError);
                }
            },
            removeError() {
                if(this.removeError !== null) {
                    showGlobalError(this.removeError);
                }
            }
        }
    }
</script>

<style>
    .pbx-seat .pbx-seat-title {
        padding-left: 8px;
    }
</style>
