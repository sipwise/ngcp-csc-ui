<template>
    <csc-page :title="$t('pages.callBlocking' + suffix + '.title')">
        <q-field id="toggle-call-blocking">
            <csc-toggle :label="toggleButtonLabel" @change="toggle" :enabled="enabled"/>
        </q-field>
        <div id="add-number-form">
            <q-field v-if="!addFormEnabled">
                <q-btn flat color="primary"
                       icon="fa-plus"
                       @click="enableAddForm()">{{ $t('pages.callBlocking' + suffix + '.addNumberButton') }}</q-btn>
            </q-field>
            <div v-if="addFormEnabled">
                <q-field :error="addFormError" :error-label="$t('pages.callBlocking' + suffix + '.addInputError')">
                    <q-input type="text" float-label="Number" v-model="newNumber" clearable @keyup.enter="addNumber()" />
                </q-field>
                <q-btn flat @click="disableAddForm()">{{ $t('buttons.cancel') }}</q-btn>
                <q-btn flat color="primary" icon-right="fa-save" @click="addNumber()">{{ $t('buttons.save') }}</q-btn>
            </div>
        </div>
            <q-card class="blocked-number" v-for="(number, index) in numbers">
                <q-card-title>
                    <q-icon v-if="!(editing && editingIndex == index)" name="fa-ban" color="secondary" size="22px"/>
                    <span v-if="!(editing && editingIndex == index)" @click="editNumber(index)">{{ number }}</span>
                    <q-input autofocus v-if="editing && editingIndex == index" type="text" float-label="Number"
                             v-model="editingNumber" @keyup.enter="saveNumber(index)" />
                    <q-btn color="primary" flat small round v-if="editing && editingIndex == index" slot="right"
                           icon="fa-save" @click="saveNumber(index)" class="cursor-pointer">{{ $t('buttons.save') }}</q-btn>
                    <q-btn color="primary" flat small round v-if="editing && editingIndex == index" slot="right"
                           icon="clear" @click="saveNumber(index)" class="cursor-pointer">{{ $t('buttons.cancel') }}</q-btn>
                    <q-btn color="primary" flat small round v-if="!(editing && editingIndex == index)" slot="right"
                           icon="fa-edit" @click="editNumber(index)" class="cursor-pointer">{{ $t('buttons.edit') }}</q-btn>
                    <q-btn color="primary" flat small round v-if="!(editing && editingIndex == index)" slot="right"
                           icon="delete" @click="removeNumber(index)" class="cursor-pointer">{{ $t('buttons.remove') }}</q-btn>
                </q-card-title>
            </q-card>
            <q-inner-loading :visible="listLoading">
                <q-spinner-mat size="50px" color="primary"></q-spinner-mat>
            </q-inner-loading>
        </div>
    </csc-page>
</template>

<script>
    import _ from 'lodash';
    import { startLoading, stopLoading, showGlobalError, showToast } from '../../../helpers/ui'
    import CscPage  from '../../CscPage'
    import CscToggle from '../../form/CscToggle'
    import { QInput, QCard, QBtn, QField, QIcon, QCardTitle, QCardActions, Dialog, QSpinnerMat, QToggle,
        Toast, QList, QItem, QItemMain, QCardMain, QInnerLoading } from 'quasar-framework'
    export default {
        name: 'csc-call-blocking',
        props: [
            'pageName',
            'title',
            'loadMethod',
            'addMethod',
            'editMethod',
            'removeMethod',
            'toggleMethod'
        ],
        data () {
            return {
                addFormEnabled: false,
                addFormError: false,
                newNumber: '',
                listLoading: false,
                editing: false,
                editingIndex: 0,
                editingNumber: ''
            }
        },
        mounted() {
            this.listLoading = true;
            this.$store.dispatch('callBlocking/load' + this.suffix).then(()=>{
                this.listLoading = false;
            }).catch((err)=>{
                this.listLoading = false;
            });
        },
        components: {
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
            QCardActions,
            Dialog,
            QInnerLoading,
            QSpinnerMat,
            CscToggle,
            CscPage
        },
        computed: {
            numbers (){
                return this.$store.state.callBlocking[this.pageName + 'List'];
            },
            enabled () {
                return this.$store.state.callBlocking[this.pageName + 'Enabled'];
            },
            toggleButtonLabel() {
                if(!this.enabled) {
                    return this.$i18n.t('pages.callBlocking' + this.suffix + '.toggleEnableLabel');
                } else {
                    return this.$i18n.t('pages.callBlocking' + this.suffix + '.toggleDisableLabel');
                }
            },
            toggleToastMessage() {
                if(this.enabled) {
                    return this.$i18n.t('pages.callBlocking' + this.suffix + '.toggleEnabledToast');
                } else {
                    return this.$i18n.t('pages.callBlocking' + this.suffix + '.toggleDisabledToast');
                }
            },
            suffix () {
                return _.upperFirst(this.pageName);
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
            addNumber() {
                this.listLoading = true;
                this.$store.dispatch('callBlocking/addNumber' + this.suffix, this.newNumber).then(()=>{
                    this.disableAddForm();
                    showToast(this.$i18n.t('pages.callBlocking' + this.suffix + '.addedToast', {
                        number:this.newNumber
                    }));
                    this.listLoading = false;
                }).catch((err)=>{
                    this.listLoading = false;
                    this.addFormError = true;
                });
            },
            editNumber(index) {
                this.editing = true;
                this.editingIndex = index;
                this.editingNumber = this.numbers[index];
            },
            saveNumber(index) {
                this.editing = false;
                this.editingIndex = index;
                this.listLoading = true;
                if(this.numbers[index] !== this.editingNumber) {
                    this.$store.dispatch('callBlocking/editNumber' + this.suffix, {
                        index: index,
                        number: this.editingNumber
                    }).then(()=>{
                        this.listLoading = false;
                    }).catch((err)=>{
                        this.listLoading = false;
                    });
                } else {
                    this.listLoading = false;
                }
            },
            removeNumber(index) {
                var store = this.$store;
                var state = this;
                var i18n = this.$i18n;
                Dialog.create({
                    title: i18n.t('pages.callBlocking' + this.suffix + '.removeDialogTitle'),
                    message: i18n.t('pages.callBlocking' + this.suffix + '.removeDialogText', {
                        number: this.numbers[index]
                    }),
                    buttons: [
                        'Cancel',
                        {
                            label: i18n.t('buttons.remove'),
                            color: 'negative',
                            handler () {
                                state.listLoading = true;
                                store.dispatch('callBlocking/removeNumber' + state.suffix, index).then(()=>{
                                    state.listLoading = false;
                                    showToast(i18n.t('pages.callBlocking' + state.suffix + '.removedToast', {
                                        number: state.numbers[index]
                                    }));
                                }).catch((err)=>{
                                    state.listLoading = false;
                                });
                            }
                        }
                    ]
                });
            },
            toggle (enabled) {
                this.$store.dispatch('callBlocking/toggle' + this.suffix, enabled).then(()=>{
                    showToast(this.toggleToastMessage);
                }).catch((err)=>{
                    console.log(err);
                });
            }
        }
    }
</script>

<style>
    #toggle-call-blocking {
        margin-bottom:60px;
    }
    #add-number-form {
        margin-bottom:15px;
    }
    .blocked-number .q-input {
        margin:0;
    }
</style>
