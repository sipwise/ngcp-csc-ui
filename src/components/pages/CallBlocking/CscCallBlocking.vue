<template>
    <csc-page
        class="q-pa-lg"
    >
        <q-list
            v-if="pageName === 'incoming'"
            class="q-mb-lg"
        >
            <q-item
                v-if="hasSubscriberProfileAttribute('block_in_clir')"
            >
                <q-toggle
                    :label="$t('All anonymous incoming calls are blocked')"
                    :value="isAnonymousBlocked"
                    :disable="isAnonymousBlockRequesting"
                    data-cy="csc-enable-incoming"
                    checked-icon="block"
                    unchecked-icon="block"
                    @input="toggleBlockAnonymous()"
                />
                <csc-spinner
                    v-if="isAnonymousBlockRequesting"
                    class="self-center"
                />
            </q-item>
        </q-list>
        <csc-ncos
            :page-type=pageType
    />
        <div
            v-if="hasSubscriberProfileAttribute(blockMode)"
            class="row q-mb-lg"
        >
            <q-list
                dense
                class="col col-xs-12 col-md-6"
            >
                <q-item>
                    <q-item-section>
                        <q-radio
                            :value="listMode"
                            :label="getTranslation('toggleDisableLabel')"
                            data-cy="csc-block-all"
                            val="blacklist"
                            color="primary"
                            @input="updateListMode"
                        />
                    </q-item-section>
                    <q-item-section
                        side
                    >
                        <csc-spinner
                            v-if="isNumberListLoading || (isToggleLoading && listMode === 'whitelist')"
                        />
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section>
                        <q-radio
                            :value="listMode"
                            :label="getTranslation('toggleEnableLabel')"
                            data-cy="csc-block-listed"
                            val="whitelist"
                            color="primary"
                            @input="updateListMode"
                        />
                    </q-item-section>
                    <q-item-section
                        side
                    >
                        <csc-spinner
                            v-if="isNumberListLoading || (isToggleLoading && listMode === 'blacklist')"
                        />
                    </q-item-section>
                </q-item>
            </q-list>
        </div>
        <div
            v-if="hasSubscriberProfileAttribute(blockList)"
        >
            <div
                class="row justify-center q-mb-lg"
            >
                <csc-call-blocking-add-form
                    ref="addForm"
                    class="col-xs-12 col-md-4 col-lg-8"
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
            <div
                v-if="numbers && numbers.length > 0"
                class="row justify-center"
            >
                <q-list
                    class="col-xs-12 col-md-4 col-lg-8"
                >
                    <csc-blocked-number
                        v-for="(number, index) in numbers"
                        :key="index"
                        :class="'q-pa-sm csc-item-' + ((index % 2 === 0)?'odd':'even')"
                        :icon="(listMode === 'whitelist')? 'check' : 'block'"
                        :number="number"
                        :index="index"
                        :loading="isEditNumberLoading && currentNumberIndex === index"
                        :removing="isRemoveNumberLoading && currentNumberIndex === index"
                        @save="saveNumber"
                        @remove="numberDeletionConfirm"
                    >
                        {{ number }}
                    </csc-blocked-number>
                </q-list>
            </div>
            <div
                v-else
                class="row justify-center"
            >
                {{ $t('No numbers found') }}
            </div>
        </div>
    </csc-page>
</template>

<script>
import _ from 'lodash'
import CscSpinner from '../../CscSpinner'
import {
    mapGetters
} from 'vuex'
import CscPage from '../../CscPage'
import CscNcos from '../../CscNcos'
import CscCallBlockingAddForm from '../../pages/CallBlocking/CscCallBlockingAddForm'
import CscBlockedNumber from '../../pages/CallBlocking/CscBlockedNumber'
export default {
    name: 'CscCallBlocking',
    components: {
        CscPage,
        CscNcos,
        CscCallBlockingAddForm,
        CscBlockedNumber,
        CscSpinner
    },
    props: {
        pageName: {
            type: String,
            default: 'incoming'
        },
        pageType: {
            type: String,
            default: null
        },
        blockMode: {
            type: String,
            default: null
        },
        blockList: {
            type: String,
            default: null
        }
    },
    data () {
        return {
            currentRemovingIndex: null
        }
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
            'listMode',
            'isAnonymousBlocked',
            'isAnonymousBlockRequesting'
        ]),
        ...mapGetters('user', [
            'hasSubscriberProfileAttribute'
        ]),
        toggleButtonLabel () {
            if (!this.enabled) {
                return this.getTranslation('toggleEnableLabel')
            } else {
                return this.getTranslation('toggleDisableLabel')
            }
        },
        toggleToastMessage () {
            if (this.mode) {
                return this.getTranslation('toggleEnabledToast')
            } else {
                return this.getTranslation('toggleDisabledToast')
            }
        },
        suffix () {
            return _.upperFirst(this.pageName)
        },
        removeDialogMessage () {
            if (this.currentRemovingIndex !== null) {
                return this.getTranslation('removeDialogText', {
                    number: this.numbers[this.currentRemovingIndex]
                })
            } else {
                return ''
            }
        },
        blockAnonymousClasses () {
            const classes = ['csc-block-anonymous']
            if (!this.isAnonymousBlocked) {
                classes.push('csc-toggle-disabled')
            }
            return classes
        }
    },
    watch: {
        mode (value) {
            this.toggle(value)
        },
        addNumberState (state) {
            if (state === 'succeeded') {
                this.$refs.addForm.reset()
            }
        }
    },
    mounted () {
        this.$store.dispatch('callBlocking/load' + this.suffix)
    },
    methods: {
        addNumber (number) {
            this.$store.dispatch('callBlocking/addNumber' + this.suffix, number)
        },
        saveNumber (data) {
            this.$store.dispatch('callBlocking/editNumber' + this.suffix, data)
        },
        removeNumber () {
            if (this.currentRemovingIndex !== null) {
                this.$store.dispatch('callBlocking/removeNumber' + this.suffix, this.currentRemovingIndex)
                this.currentRemovingIndex = null
            }
        },
        updateListMode (listMode) {
            this.$store.dispatch('callBlocking/toggle' + this.suffix, listMode === 'whitelist')
        },
        toggleBlockAnonymous () {
            this.$store.dispatch('callBlocking/toggleBlockAnonymous', !this.isAnonymousBlocked)
        },
        numberDeletionConfirm (index) {
            this.currentRemovingIndex = index
            this.$q.dialog({
                title: this.getTranslation('removeDialogTitle'),
                message: this.removeDialogMessage,
                color: 'primary',
                cancel: true,
                persistent: true
            }).onOk(data => {
                this.removeNumber()
            })
        },
        getTranslation (key, params) {
            let translationsMap
            switch (this.suffix) {
            case 'Incoming':
                translationsMap = {
                    toggleEnableLabel: this.$t('Only incoming calls from listed numbers are allowed'),
                    toggleDisableLabel: this.$t('All incoming calls from listed numbers are blocked'),
                    toggleEnabledToast: this.$t('All listed numbers are allowed'),
                    toggleDisabledToast: this.$t('All listed numbers are blocked'),
                    removeDialogTitle: this.$t('Remove number'),
                    removeDialogText: this.$t('You are about to remove the number {number}', params)
                }
                break
            case 'Outgoing':
                translationsMap = {
                    toggleEnableLabel: this.$t('Only outgoing calls to listed numbers are allowed'),
                    toggleDisableLabel: this.$t('All outgoing calls to listed numbers are blocked'),
                    toggleEnabledToast: this.$t('All listed numbers are allowed'),
                    toggleDisabledToast: this.$t('All listed numbers are blocked'),
                    removeDialogTitle: this.$t('Remove number'),
                    removeDialogText: this.$t('You are about to remove the number {number}', params)
                }
                break
            }
            return translationsMap[key]
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

    .csc-list-item.q-item.csc-blocked-number
        padding-top $flex-gutter-xs
        padding-bottom $flex-gutter-xs
    .csc-block-anonymous
        margin-bottom $flex-gutter-md

</style>