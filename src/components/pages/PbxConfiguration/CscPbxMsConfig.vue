<template>
    <csc-list-item
        ref="listItem"
        icon="arrow_forward"
        :odd="odd"
        :loading="loading"
        :expanded="expanded"
        @toggle="toggle"
    >
        <template
            #title
        >
            <csc-list-item-title
                :icon="getTitleIcon"
            >
                {{ $filters.displayName(subscriber) }}
            </csc-list-item-title>
            <q-slide-transition>
                <csc-list-item-subtitle
                    v-if="!expanded"
                >
                    <template
                        v-if="currentSecretaryNumbers.length > 0"
                    >
                        {{ $t('Secretary numbers') }}:
                        <span
                            v-for="number in currentSecretaryNumbers"
                            :key="number"
                            class="csc-list-item-title-keyword"
                        >
                            <q-icon
                                name="call"
                                size="16px"
                            />
                            {{ number }}
                        </span>
                    </template>
                    <template
                        v-else
                    >
                        <span>
                            <q-icon
                                name="info"
                                color="info"
                                size="24px"
                            />
                            {{ $t('No numbers assigned') }}
                        </span>
                    </template>
                </csc-list-item-subtitle>
            </q-slide-transition>
        </template>
        <template #menu>
            <csc-list-menu-item
                icon="delete"
                icon-color="negative"
                @click="remove"
            >
                {{ $t('Remove') }}
            </csc-list-menu-item>
        </template>
        <template
            #body
        >
            <q-select
                v-model="changes.secretaryNumbers"
                emit-value
                map-options
                multiple
                chips
                :disable="loading || numberOptionsLoading"
                :readonly="loading"
                :label="$t('Select secretary numbers')"
                :options="numberOptions"
            >
                <template
                    v-if="hasSecretaryNumbersChanged"
                    #append
                >
                    <csc-input-button-save
                        @click.stop="saveSecretaryNumbers"
                    />
                    <csc-input-button-reset
                        @click.stop="resetSecretaryNumbers"
                    />
                </template>
            </q-select>
        </template>
    </csc-list-item>
</template>

<script>
import CscListItem from 'components/CscListItem'
import CscListItemSubtitle from 'components/CscListItemSubtitle'
import CscListItemTitle from 'components/CscListItemTitle'
import CscListMenuItem from 'components/CscListMenuItem'
import CscInputButtonReset from 'components/form/CscInputButtonReset'
import CscInputButtonSave from 'components/form/CscInputButtonSave'
import _ from 'lodash'
export default {
    name: 'CscPbxMsConfig',
    components: {
        CscListItem,
        CscListItemTitle,
        CscListItemSubtitle,
        CscListMenuItem,
        CscInputButtonSave,
        CscInputButtonReset
    },
    props: {
        odd: {
            type: Boolean,
            default: false
        },
        expanded: {
            type: Boolean,
            default: false
        },
        msConfig: {
            type: Object,
            default: null
        },
        subscriber: {
            type: Object,
            default: null
        },
        loading: {
            type: Boolean,
            default: false
        },
        numberOptions: {
            type: Array,
            default: () => []
        },
        numberOptionsLoading: {
            type: Boolean,
            default: false
        }
    },
    emits: ['save-secretary-numbers', 'expand', 'collapse', 'remove', 'ready'],
    data () {
        return {
            changes: this.getDefaultData()
        }
    },
    computed: {
        getTitleIcon () {
            let icon = 'person'
            if (this.subscriber.is_pbx_group) {
                icon = 'group'
            } else if (this.subscriber.is_pbx_pilot) {
                icon = 'person_outline'
            }
            return icon
        },
        hasSecretaryNumbersChanged () {
            const changedSecretaryNumbers = _.clone(_.get(this.changes, 'secretaryNumbers', []))
            const currentSecretaryNumbers = _.clone(this.currentSecretaryNumbers)
            return !_.isEqual(changedSecretaryNumbers.sort(), currentSecretaryNumbers.sort())
        },
        currentSecretaryNumbers () {
            return _.get(this.msConfig, 'secretary_numbers', [])
        }
    },
    watch: {
        msConfig () {
            this.changes = this.getDefaultData()
        }
    },
    mounted () {
        this.$emit('ready')
    },
    validations: {
        changes: {
        }
    },
    methods: {
        remove () {
            if (this.$refs.listItem) {
                this.$refs.listItem.closePopoverMenu()
            }
            this.$emit('remove', this.msConfig.id)
        },
        toggle () {
            if (this.expanded) {
                this.$emit('collapse')
            } else {
                this.$emit('expand')
            }
        },
        getDefaultData () {
            return {
                secretaryNumbers: _.clone(_.get(this.msConfig, 'secretary_numbers', []))
            }
        },
        resetSecretaryNumbers () {
            this.changes.secretaryNumbers = this.getDefaultData().secretaryNumbers
        },
        saveSecretaryNumbers () {
            if (this.hasSecretaryNumbersChanged) {
                this.$emit('save-secretary-numbers', {
                    msConfigId: this.msConfig.id,
                    secretaryNumbers: this.changes.secretaryNumbers
                })
            }
        }
    }
}
</script>
