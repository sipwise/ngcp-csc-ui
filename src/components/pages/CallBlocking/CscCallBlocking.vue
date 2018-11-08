<template>
    <csc-page
        :is-list="true"
    >
        <div
            class="row"
        >
            <q-list
                link
                no-border
                class="col col col-xs-12 col-md-6">
                <q-item
                    tag="label"
                >
                    <q-item-side
                    >
                        <q-radio
                            :value="listMode"
                            val="blacklist"
                            color="primary"
                            @input="updateListMode"
                        />
                    </q-item-side>
                    <q-item-main
                    >
                        <q-item-tile
                            label
                        >
                            {{ $t('pages.callBlocking' + suffix + '.toggleDisableLabel') }}
                            <csc-spinner
                                v-if="isNumberListLoading || (isToggleLoading && listMode == 'whitelist')"
                            />
                        </q-item-tile>
                    </q-item-main>
                </q-item>
                <q-item
                    tag="label"
                >
                    <q-item-side
                    >
                        <q-radio
                            :value="listMode"
                            val="whitelist"
                            color="primary"
                            @input="updateListMode"
                        />
                    </q-item-side>
                    <q-item-main
                    >
                        <q-item-tile
                            label
                        >
                            {{ $t('pages.callBlocking' + suffix + '.toggleEnableLabel') }}
                            <csc-spinner
                                v-if="isNumberListLoading || (isToggleLoading && listMode == 'blacklist')"
                            />
                        </q-item-tile>
                    </q-item-main>
                </q-item>
            </q-list>
        </div>
        <div
            class="row justify-center"
        >
            <csc-call-blocking-add-form
                class="csc-list-form col-xs-12 col-md-4 col-lg-6"
                ref="addForm"
                :loading="isAddNumberLoading"
                @save="addNumber"
            />
        </div>
        <div
            v-if="isNumberListLoading"
            class="row justify-center"
        >
            <csc-spinner />
        </div>
        <q-list
            v-if="numbers && numbers.length > 0"
            striped-odd
            no-border
        >
            <csc-blocked-number
                class="csc-list-item"
                v-for="(number, index) in numbers"
                :key="index"
                :number="number"
                :index="index"
                :loading="isEditNumberLoading && currentNumberIndex === index"
                :removing="isRemoveNumberLoading && currentNumberIndex === index"
                @save="saveNumber"
                @remove="removeNumberDialog"
            >
                {{ number }}
            </csc-blocked-number>
        </q-list>
        <div
            v-else
            class="csc-list-message"
        >
            {{ $t('callBlocking.listEmptyMessage') }}
        </div>
        <csc-remove-dialog
            ref="removeDialog"
            :title="$t('pages.callBlocking' + this.suffix + '.removeDialogTitle')"
            :message="removeDialogMessage"
            @remove="removeNumber"
        />
    </csc-page>
</template>

<script>
    import _ from 'lodash';
    import CscSpinner from '../../CscSpinner'
    import CscRemoveDialog from '../../CscRemoveDialog'
    import {
        mapGetters
    } from 'vuex'
    import CscPage  from '../../CscPage'
    import CscToggle from '../../form/CscToggle'
    import CscCallBlockingAddForm from '../../pages/CallBlocking/CscCallBlockingAddForm'
    import CscBlockedNumber from '../../pages/CallBlocking/CscBlockedNumber'
    import {
        QInput,
        QCard,
        QBtn,
        QField,
        QIcon,
        QCardTitle,
        QCardActions,
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
        QRadio,
        QSpinnerDots
    } from 'quasar-framework'
    export default {
        name: 'csc-call-blocking',
        props: [
            'pageName'
        ],
        data () {
            return {
                currentRemovingIndex: null
            }
        },
        mounted() {
            this.$store.dispatch('callBlocking/load' + this.suffix);
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
            QRadio,
            CscCallBlockingAddForm,
            QSpinnerDots,
            CscBlockedNumber,
            CscSpinner,
            CscRemoveDialog
        },
        computed: {
            ...mapGetters('callBlocking', [
                'toggleState',
                'isToggleLoading',
                'addNumberState',
                'isAddNumberLoading',
                'editNumberState',
                'isEditNumberLoading',
                'removeNumberState',
                'isRemoveNumberLoading',
                'numberListState',
                'isNumberListLoading',
                'numbers',
                'currentNumberIndex',
                'listMode'
            ]),
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
            },
            removeDialogMessage() {
                if(this.currentRemovingIndex !== null) {
                    return this.$t('pages.callBlocking' + this.suffix + '.removeDialogText', {
                        number: this.numbers[this.currentRemovingIndex]
                    });
                }
            }
        },
        watch: {
            mode(value) {
                this.toggle(value);
            },
            addNumberState(state) {
                if(state === 'succeeded') {
                    this.$refs.addForm.reset();
                }
            }
        },
        methods: {
            addNumber(number) {
                this.$store.dispatch('callBlocking/addNumber' + this.suffix, number);
            },
            saveNumber(data) {
                console.log(data);
                this.$store.dispatch('callBlocking/editNumber' + this.suffix, data);
            },
            removeNumberDialog(index) {
                this.currentRemovingIndex = index;
                this.$refs.removeDialog.open();
            },
            removeNumber() {
                if(this.currentRemovingIndex !== null) {
                    this.$store.dispatch('callBlocking/removeNumber' + this.suffix, this.currentRemovingIndex);
                    this.currentRemovingIndex = null;
                }
            },
            updateListMode(listMode) {
                this.$store.dispatch('callBlocking/toggle' + this.suffix, listMode === 'whitelist');
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl'
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

    .csc-list-item.q-item.csc-blocked-number
        padding-top $flex-gutter-xs
        padding-bottom $flex-gutter-xs
</style>
