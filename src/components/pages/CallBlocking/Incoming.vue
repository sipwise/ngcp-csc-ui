<template>
    <page title="Block incoming calls">
        <q-field id="toggle-incoming">
            <q-toggle :label="((!callBlockingEnabled)?'Enable':'Disable') + ' Call Blocking'"
                      @input="toggle()" v-model="callBlockingEnabled"/>
        </q-field>
        <div id="add-number-form">
            <q-field v-if="!addFormEnabled">
                <q-btn color="primary" icon="fa-plus" @click="enableAddForm()">Add number</q-btn>
            </q-field>
            <div v-if="addFormEnabled">
                <q-field :error="addFormError" error-label="Input a valid number or subscriber name">
                    <q-input type="text" float-label="Number" v-model="newNumber"
                             clearable @keyup.enter="saveNumber()" />
                </q-field>
                <q-btn @click="disableAddForm()">Cancel</q-btn>
                <q-btn color="primary" icon-right="fa-save" @click="saveNumber()">Save</q-btn>
            </div>
        </div>
        <div>
            <q-card v-for="(number, index) in numbers">
                <q-card-title>
                    {{ number }}
                    <q-icon slot="right" name="fa-remove" @click="removeNumber(index)" class="cursor-pointer"></q-icon>
                </q-card-title>
            </q-card>
            <q-inner-loading :visible="listLoading">
                <q-spinner-gears size="50px" color="primary"></q-spinner-gears>
            </q-inner-loading>
        </div>
    </page>
</template>

<script>
    import { startLoading, stopLoading, showGlobalError, showToast } from '../../../helpers/ui'
    import Page  from '../../Page'
    import { QInput, QCard, QBtn, QField, QIcon, QCardTitle, Dialog, QSpinnerGears,
        QToggle, Toast, QList, QItem, QItemMain, QCardMain, QInnerLoading } from 'quasar-framework'
    export default {
        data () {
            return {
                callBlockingEnabled: false,
                addFormEnabled: false,
                addFormError: false,
                newNumber: '',
                listLoading: false,
            }
        },
        mounted() {
            this.listLoading = true;
            this.$store.dispatch('callBlocking/loadIncoming').then(()=>{
                this.callBlockingEnabled = this.$store.state.callBlocking.incomingEnabled;
                this.listLoading = false;
            }).catch((err)=>{
                this.listLoading = false;
            });
        },
        components: {
            Page,
            QToggle,
            Toast,
            QField,
            QBtn,
            QCard,
            QInput,
            QList,
            QItem,
            QItemMain,
            QCardMain,
            QIcon,
            QCardTitle,
            Dialog,
            QInnerLoading,
            QSpinnerGears
        },
        computed: {
            numbers: {
                get(){
                    return this.$store.state.callBlocking.incomingList;
                }
            }
        },
        methods: {
            enableAddForm() {
                this.addFormEnabled = true;
                this.newNumber = '';
                this.addFormError = false;
            },
            disableAddForm() {
                this.addFormEnabled = false;
            },
            saveNumber() {
                this.listLoading = true;
                this.$store.dispatch('callBlocking/addNumberToIncoming', this.newNumber).then(()=>{
                    this.disableAddForm();
                    showToast('Added new number to list');
                    this.listLoading = false;
                }).catch((err)=>{
                    this.listLoading = false;
                    this.addFormError = true;
                });

            },
            removeNumber(index) {
                var store = this.$store;
                var state = this;
                Dialog.create({
                    title: 'Remove number',
                    message: 'You are about to remove the number',
                    buttons: [
                        'Cancel',
                        {
                            label: 'Remove',
                            handler () {
                                state.listLoading = true;
                                store.dispatch('callBlocking/removeNumberFromIncoming', index).then(()=>{
                                    state.listLoading = false;
                                    showToast('Removed number from list');
                                }).catch((err)=>{
                                    state.listLoading = false;
                                });
                            }
                        }
                    ]
                });
            },
            toggle () {
                this.$store.dispatch('callBlocking/toggleIncoming', this.callBlockingEnabled).then(()=>{
                    showToast('Call blocking for incoming calls ' + ((this.callBlockingEnabled)?'enabled':'disabled'));
                }).catch((err)=>{
                    console.log(err);
                });
            }
        }
    }
</script>

<style>
    #toggle-incoming {
        margin-bottom:60px;
    }
    #add-number-form {
        margin-bottom:15px;
    }
</style>
