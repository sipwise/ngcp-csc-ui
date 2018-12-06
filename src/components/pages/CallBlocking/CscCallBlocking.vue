<template>
    <csc-page :title="$t('pages.callBlocking' + suffix + '.title')">
        <div class="row">
            <q-list link no-border class="mode-list col">
                <q-item tag="label">
                    <q-item-side>
                        <q-radio v-model="enabled" val="blacklist" color="negative"
                                 checked-icon="fa-ban" uncheck-icon="fa-ban"/>
                    </q-item-side>
                    <q-item-main>
                        <q-item-tile label>{{ $t('pages.callBlocking' + suffix + '.toggleDisableLabel') }}</q-item-tile>
                    </q-item-main>
                </q-item>
                <q-item tag="label">
                    <q-item-side>
                        <q-radio v-model="enabled" val="whitelist" color="primary"
                                 checked-icon="check" uncheck-icon="check" />
                    </q-item-side>
                    <q-item-main>
                        <q-item-tile label>{{ $t('pages.callBlocking' + suffix + '.toggleEnableLabel') }}</q-item-tile>
                    </q-item-main>
                </q-item>
            </q-list>
        </div>
        <div id="add-number-form">
            <q-field v-if="!addFormEnabled">
                <q-btn color="primary"
                   flat icon="add"
                   @click="enableAddForm()">{{ $t('pages.callBlocking' + suffix + '.addNumberButton') }}</q-btn>
            </q-field>
            <div v-if="addFormEnabled">
                <csc-call-input
                    :label="$t('callBlocking.number')"
                    v-model="newNumber"
                    @submit="addNumber"
                    @error="error"
                />
                <q-btn flat icon="clear" @mousedown.native="disableAddForm()">{{ $t('buttons.cancel') }}</q-btn>
                <q-btn flat icon="check" :disabled="numberError" color="primary" @click="addNumber()">{{ $t('buttons.save') }}</q-btn>
            </div>
        </div>
        <div>
            <q-card class="blocked-number" v-for="(number, index) in numbers" :key="index">
                <q-card-title>
                    <q-icon v-if="!(editing && editingIndex == index) && enabled == 'blacklist'" name="fa-ban" color="negative" size="22px"/>
                    <q-icon v-if="!(editing && editingIndex == index) && enabled == 'whitelist'" name="check" color="primary" size="22px"/>
                    <span class="blocked-number-title" v-if="!(editing && editingIndex == index)"
                          @click="editNumber(index)">{{ number }}</span>
                    <q-input autofocus v-if="editing && editingIndex == index" type="text" float-label="Number"
                             v-model="editingNumber" @keyup.enter="saveNumber(index)" />
                    <q-btn color="primary" flat v-if="editing && editingIndex == index" slot="right"
                           icon="check" @click="saveNumber(index)" class="cursor-pointer"><span class="gt-sm">{{ $t('buttons.save') }}</span></q-btn>
                    <q-btn flat v-if="editing && editingIndex == index" slot="right"
                           icon="clear" @click="cancelEdit()" class="cursor-pointer"><span class="gt-sm">{{ $t('buttons.cancel') }}</span></q-btn>
                    <q-btn color="primary" flat v-if="!(editing && editingIndex == index)" slot="right"
                           icon="fa-edit" @click="editNumber(index)" class="cursor-pointer"><span class="gt-sm">{{ $t('buttons.edit') }}</span></q-btn>
                    <q-btn color="negative" flat v-if="!(editing && editingIndex == index)" slot="right"
                           icon="delete" @click="removeNumber(index)" class="cursor-pointer"><span class="gt-sm">{{ $t('buttons.remove') }}</span></q-btn>
                </q-card-title>
            </q-card>
            <q-inner-loading :visible="listLoading">
                <q-spinner-mat size="50px" color="primary"></q-spinner-mat>
            </q-inner-loading>
        </div>
    </csc-page>
</template>

<script>
    import CscCallInput from '../../form/CscCallInput'
    import _ from 'lodash';
    import { showToast } from '../../../helpers/ui'
    import CscPage  from '../../CscPage'
    import CscToggle from '../../form/CscToggle'
    import {
        QInput,
        QCard,
        QBtn,
        QField,
        QIcon,
        QCardTitle,
        QCardActions,
        Dialog,
        QSpinnerMat,
        QToggle,
        Toast,
        QList,
        QItem,
        QItemSide,
        QItemMain,
        QItemTile,
        QCardMain,
        QInnerLoading,
        QOptionGroup,
        QSelect,
        QRadio
    } from 'quasar-framework'
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
                editingNumber: '',
                mode: null,
                numberError: false
            }
        },
        mounted() {
            this.listLoading = true;
            this.$store.dispatch('callBlocking/load' + this.suffix).then(() => {
                this.listLoading = false;
            }).catch(() => {
                this.listLoading = false;
            });
        },
        components: {
            CscCallInput,
            QToggle,
            Toast,
            QField,
            QBtn,
            QCard,
            QInput,
            QList,
            QItem,
            QItemSide,
            QItemMain,
            QItemTile,
            QCardMain,
            QIcon,
            QCardTitle,
            QCardActions,
            QInnerLoading,
            QSpinnerMat,
            CscToggle,
            CscPage,
            QOptionGroup,
            QSelect,
            QRadio
        },
        computed: {
            numbers() {
                return this.$store.state.callBlocking[this.pageName + 'List'];
            },
            enabled: {
                get() {
                    var enabled = this.$store.state.callBlocking[this.pageName + 'Enabled'];
                    if(enabled) {
                        return 'whitelist';
                    }
                    else {
                        return 'blacklist';
                    }
                },
                set(value) {
                    if(value === 'blacklist') {
                        this.mode = false;
                    }
                    else {
                        this.mode = true;
                    }
                }
            },
            toggleButtonLabel() {
                if(!this.enabled) {
                    return this.$i18n.t('pages.callBlocking' + this.suffix + '.toggleEnableLabel');
                }
                else {
                    return this.$i18n.t('pages.callBlocking' + this.suffix + '.toggleDisableLabel');
                }
            },
            toggleToastMessage() {
                if(this.mode) {
                    return this.$i18n.t('pages.callBlocking' + this.suffix + '.toggleEnabledToast');
                }
                else {
                    return this.$i18n.t('pages.callBlocking' + this.suffix + '.toggleDisabledToast');
                }
            },
            suffix() {
                return _.upperFirst(this.pageName);
            }
        },
        watch: {
            mode(value) {
                this.toggle(value);
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
                if (!this.numberError) {
                    this.listLoading = true;
                    this.$store.dispatch('callBlocking/addNumber' + this.suffix, this.newNumber).then(()=>{
                        this.disableAddForm();
                        showToast(this.$i18n.t('pages.callBlocking' + this.suffix + '.addedToast', {
                            number:this.newNumber
                        }));
                        this.listLoading = false;
                    }).catch(()=>{
                        this.listLoading = false;
                        this.addFormError = true;
                    });
                }
            },
            editNumber(index) {
                this.editing = true;
                this.editingIndex = index;
                this.editingNumber = this.numbers[index];
            },
            cancelEdit() {
                this.editing = false;
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
                    }).catch(()=>{
                        this.listLoading = false;
                    });
                }
                else {
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
                                }).catch(()=>{
                                    state.listLoading = false;
                                });
                            }
                        }
                    ]
                });
            },
            toggle(enabled) {
                this.$store.dispatch('callBlocking/toggle' + this.suffix, enabled).then(()=>{
                    showToast(this.toggleToastMessage);
                }).catch((err)=>{
                    console.log(err);
                });
            },
            error(state) {
                this.numberError = state;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">

    #toggle-call-blocking
        margin-bottom 60px

    #add-number-form
        margin-bottom 15px

    .blocked-number .q-input
        margin 0

    .blocked-number-title
        padding-left 8px

    .mode-list
        margin-bottom 30px
</style>
