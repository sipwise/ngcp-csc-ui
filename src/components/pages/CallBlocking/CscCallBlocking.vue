<template>
    <csc-page :title="$t('pages.callBlocking' + suffix + '.title')">
        <div class="row">
            <q-list
                no-border
                class="mode-list col"
            >
                <q-item tag="label">
                    <q-item-side>
                        <q-radio
                            v-model="enabled"
                            val="blacklist"
                            color="negative"
                            checked-icon="block"
                            uncheck-icon="block"
                        />
                    </q-item-side>
                    <q-item-main>
                        <q-item-tile label>
                            {{ $t('pages.callBlocking' + suffix + '.toggleDisableLabel') }}
                        </q-item-tile>
                    </q-item-main>
                </q-item>
                <q-item tag="label">
                    <q-item-side>
                        <q-radio
                            v-model="enabled"
                            val="whitelist"
                            color="primary"
                            checked-icon="check_circle_outline"
                            uncheck-icon="check_circle_outline"
                        />
                    </q-item-side>
                    <q-item-main>
                        <q-item-tile label>
                            {{ $t('pages.callBlocking' + suffix + '.toggleEnableLabel') }}
                        </q-item-tile>
                    </q-item-main>
                </q-item>
            </q-list>
        </div>
        <div id="add-number-form">
            <div
                v-if="!addFormEnabled"
            >
                <q-btn color="primary"
                   icon="check" flat
                   @click="enableAddForm()"
                >
                    {{ $t('pages.callBlocking' + suffix + '.addNumberButton') }}
                </q-btn>
            </div>
            <q-field
                v-if="addFormEnabled"
                :error="addFormError"
                :error-label="$t('pages.callBlocking' + suffix + '.addInputError')"
            >
                <q-input
                    type="text"
                    :float-label="$t('callBlocking.number')"
                    v-model="newNumber"
                    clearable
                    @keyup.enter="addNumber()"
                />
            </q-field>
            <div
                v-if="addFormEnabled"
            >
                <q-btn
                    flat
                    color="secondary"
                    icon="clear"
                    @click="disableAddForm()"
                >
                    {{ $t('buttons.cancel') }}
                </q-btn>
                <q-btn
                    flat
                    color="primary"
                    icon="fa-save"
                    @click="addNumber()"
                >
                    {{ $t('buttons.save') }}
                </q-btn>
            </div>
        </div>
        <q-list
            no-border
            separator
            sparse
            multiline
        >
            <csc-call-blocking-number
                v-for="(number, index) in numbers"
                :number="number"
                :isLoading="listLoading"
                :key="index"
                :enabled="enabled"
                :index="index"
                @save="saveNumber"
                @delete="removeNumber"
            />
        </q-list>
        <div
            v-if="numbers.length === 0 && !listLoading"
            class="row justify-left csc-no-entities"
        >
            {{ $t('callBlocking.noNumbers') }}
        </div>
    </csc-page>
</template>

<script>
    import _ from 'lodash';
    import { showToast } from '../../../helpers/ui'
    import CscPage  from '../../CscPage'
    import CscCallBlockingNumber from './CscCallBlockingNumber'
    import {
        QBtn,
        QField,
        QInput,
        QList,
        QItem,
        QItemSide,
        QItemMain,
        QItemTile,
        QRadio,
        Dialog
    } from 'quasar-framework'
    export default {
        name: 'csc-call-blocking',
        props: [
            'pageName'
        ],
        data () {
            return {
                addFormEnabled: false,
                addFormError: false,
                newNumber: '',
                listLoading: false,
                mode: null
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
            CscCallBlockingNumber,
            CscPage,
            QBtn,
            QField,
            QInput,
            QList,
            QItem,
            QItemSide,
            QItemMain,
            QItemTile,
            QRadio
        },
        computed: {
            numbers() {
                return this.$store.state.callBlocking[this.pageName + 'List'] || [];
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
            },
            saveNumber(options) {
                this.listLoading = true;
                if (this.numbers[options.index] !== options.number) {
                    this.$store.dispatch('callBlocking/editNumber' + this.suffix, {
                        index: options.index,
                        number: options.number
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
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';

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
