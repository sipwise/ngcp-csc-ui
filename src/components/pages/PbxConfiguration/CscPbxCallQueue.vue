<template>
    <csc-list-item
        ref="listItem"
        icon="filter_none"
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
                    {{ $t('Maximum calls in queue') }}: {{ getDefaultData().max_queue_length }}
                </csc-list-item-subtitle>
            </q-slide-transition>
            <q-slide-transition>
                <csc-list-item-subtitle
                    v-if="!expanded"
                >
                    {{ $t('Wrap up time') }}: {{ getDefaultData().queue_wrap_up_time }}
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
            <q-input
                v-model="changes.max_queue_length"
                :label="$t('Maximum calls in queue')"
                :error="v$.changes.max_queue_length.$errors.length > 0"
                :error-message="queueMaxLengthErrorMessage"
                @update:model-value="v$.changes.max_queue_length.$touch()"
                @keyup.enter="save"
            >
                <template
                    v-if="hasMaxQueueLengthChanged"
                    #append
                >
                    <csc-input-button-save
                        v-if="v$.changes.max_queue_length.$errors.length <= 0"
                        @click.stop="save"
                    />
                    <csc-input-button-reset
                        @click.stop="resetMaxQueueLength"
                    />
                </template>
            </q-input>
            <q-input
                v-model="changes.queue_wrap_up_time"
                :suffix="$t('seconds')"
                :label="$t('Wrap up time')"
                :error="v$.changes.queue_wrap_up_time.$errors.length > 0"
                :error-message="queueWrapUpTimeErrorMessage"
                @update:model-value="v$.changes.queue_wrap_up_time.$touch()"
                @keyup.enter="save"
            >
                <template
                    v-if="hasQueueWrapUpTimeChanged"
                    #append
                >
                    <csc-input-button-save
                        v-if="v$.changes.queue_wrap_up_time.$errors.length <= 0"
                        @click.stop="save"
                    />
                    <csc-input-button-reset
                        @click.stop="resetQueueWrapUpTime"
                    />
                </template>
            </q-input>
        </template>
    </csc-list-item>
</template>

<script>
import useValidate from '@vuelidate/core'
import {
    maxValue,
    minValue,
    numeric
} from '@vuelidate/validators'
import CscListItem from 'components/CscListItem'
import CscListItemSubtitle from 'components/CscListItemSubtitle'
import CscListItemTitle from 'components/CscListItemTitle'
import CscListMenuItem from 'components/CscListMenuItem'
import CscInputButtonReset from 'components/form/CscInputButtonReset'
import CscInputButtonSave from 'components/form/CscInputButtonSave'

export default {
    name: 'CscPbxCallQueue',
    components: {
        CscInputButtonReset,
        CscInputButtonSave,
        CscListItem,
        CscListItemTitle,
        CscListItemSubtitle,
        CscListMenuItem
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
        callQueue: {
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
        defaultMaxQueueLength: {
            type: Number,
            default: 10
        },
        defaultQueueWrapUpTime: {
            type: Number,
            default: 300
        }
    },
    emits: ['save-queue-wrap-up-time', 'save-max-queue-length', 'expand', 'collapse', 'remove'],
    data () {
        return {
            changes: this.getDefaultData(),
            v$: useValidate()
        }
    },
    validations: {
        changes: {
            max_queue_length: {
                numeric,
                minValue: minValue(1),
                maxValue: maxValue(99999)
            },
            queue_wrap_up_time: {
                numeric,
                minValue: minValue(1),
                maxValue: maxValue(99999)
            }
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
        hasMaxQueueLengthChanged () {
            return this.callQueue.max_queue_length !== this.changes.max_queue_length
        },
        hasQueueWrapUpTimeChanged () {
            return this.callQueue.queue_wrap_up_time !== this.changes.queue_wrap_up_time
        },
        queueMaxLengthErrorMessage () {
            const errorsTab = this.v$.changes.max_queue_length.$errors
            if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'numeric') {
                return this.$t('{field} must consist of numeric characters only', {
                    field: this.$t('Queue Length')
                })
            } else if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'minValue') {
                return this.$t('{field} must be at least {minValue} second', {
                    field: this.$t('Queue Length'),
                    minValue: this.v$.changes.max_queue_length.minValue.$params.min
                })
            } else if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'maxValue') {
                return this.$t('{field} must be maximum of {maxValue} seconds', {
                    field: this.$t('Queue Length'),
                    maxValue: this.v$.changes.max_queue_length.maxValue.$params.max
                })
            }
            return ''
        },
        queueWrapUpTimeErrorMessage () {
            const errorsTab = this.v$.changes.queue_wrap_up_time.$errors
            if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'numeric') {
                return this.$t('{field} must consist of numeric characters only', {
                    field: this.$t('Wrap up time')
                })
            } else if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'minValue') {
                return this.$t('{field} must be at least {minValue} second', {
                    field: this.$t('Wrap up time'),
                    minValue: this.v$.changes.queue_wrap_up_time.minValue.$params.min
                })
            } else if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'maxValue') {
                return this.$t('{field} must be maximum of {maxValue} seconds', {
                    field: this.$t('Wrap up time'),
                    maxValue: this.v$.changes.queue_wrap_up_time.maxValue.$params.max
                })
            }
            return ''
        }
    },
    watch: {
        callQueue () {
            this.changes = this.getDefaultData()
        }
    },
    methods: {
        remove () {
            if (this.$refs.listItem) {
                this.$refs.listItem.closePopoverMenu()
            }
            this.$emit('remove', this.callQueue.id)
        },
        toggle () {
            if (this.expanded) {
                this.$emit('collapse')
            } else {
                this.$emit('expand')
            }
        },
        resetMaxQueueLength () {
            this.changes.max_queue_length = this.getDefaultData().max_queue_length
        },
        resetQueueWrapUpTime () {
            this.changes.queue_wrap_up_time = this.getDefaultData().queue_wrap_up_time
        },
        getDefaultData () {
            return {
                max_queue_length: this.callQueue.max_queue_length || this.defaultMaxQueueLength,
                queue_wrap_up_time: this.callQueue.queue_wrap_up_time || this.defaultQueueWrapUpTime
            }
        },
        save () {
            if (this.hasMaxQueueLengthChanged && this.v$.changes.max_queue_length.$errors.length <= 0) {
                this.$emit('save-max-queue-length', {
                    callQueueId: this.callQueue.id,
                    maxQueueLength: this.changes.max_queue_length
                })
            }
            if (this.hasQueueWrapUpTimeChanged && this.v$.changes.queue_wrap_up_time.$errors.length <= 0) {
                this.$emit('save-queue-wrap-up-time', {
                    callQueueId: this.callQueue.id,
                    queueWrapUpTime: this.changes.queue_wrap_up_time
                })
            }
        }
    }
}
</script>
<style lang="sass" rel="stylesheet/sass">
    .q-field__suffix
        margin: -100px
</style>
