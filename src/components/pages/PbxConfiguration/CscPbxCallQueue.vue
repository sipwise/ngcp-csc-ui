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
            slot="title"
        >
            <csc-list-item-title
                :icon="getTitleIcon"
            >
                {{ subscriber | displayName }}
            </csc-list-item-title>
            <q-slide-transition>
                <csc-list-item-subtitle
                    v-if="!expanded"
                >
                    {{ $t('pbxConfig.callQueueMaxLength')}}: {{ this.getDefaultData().max_queue_length }}
                </csc-list-item-subtitle>
            </q-slide-transition>
            <q-slide-transition>
                <csc-list-item-subtitle
                    v-if="!expanded"
                >
                    {{ $t('pbxConfig.callQueueWrapUpTime')}}: {{ this.getDefaultData().queue_wrap_up_time }}
                </csc-list-item-subtitle>
            </q-slide-transition>
        </template>
        <template slot="menu">
            <csc-list-menu-item
                icon="delete"
                icon-color="negative"
                @click="remove"
            >
                {{ $t('buttons.remove') }}
            </csc-list-menu-item>
        </template>
        <template
            slot="body"
        >
            <q-field
                :label="$t('pbxConfig.callQueueMaxLength')"
                :error="$v.changes.max_queue_length.$error"
                :error-label="queueMaxLengthErrorMessage"
            >
                <q-input
                    dark
                    v-model="changes.max_queue_length"
                    :error="$v.changes.max_queue_length.$error"
                    @input="$v.changes.max_queue_length.$touch"
                    @keyup.enter="save"
                />
                <csc-fade>
                    <csc-form-save-button
                        v-if="hasMaxQueueLengthChanged && !$v.changes.max_queue_length.$error"
                        @click="save"
                    />
                </csc-fade>
                <csc-fade>
                    <csc-form-reset-button
                        v-if="hasMaxQueueLengthChanged"
                        @click="resetMaxQueueLength"
                    />
                </csc-fade>
            </q-field>
            <q-field
                :label="$t('pbxConfig.callQueueWrapUpTime')"
                :error="$v.changes.queue_wrap_up_time.$error"
                :error-label="queueWrapUpTimeErrorMessage"
            >
                <q-input
                    dark
                    v-model="changes.queue_wrap_up_time"
                    :suffix="$t('pbxConfig.seconds')"
                    :error="$v.changes.queue_wrap_up_time.$error"
                    @input="$v.changes.queue_wrap_up_time.$touch"
                    @keyup.enter="save"
                />
                <csc-fade>
                    <csc-form-save-button
                        v-if="hasQueueWrapUpTimeChanged && !$v.changes.queue_wrap_up_time.$error"
                        @click="save"
                    />
                </csc-fade>
                <csc-fade>
                    <csc-form-reset-button
                        v-if="hasQueueWrapUpTimeChanged"
                        @click="resetQueueWrapUpTime"
                    />
                </csc-fade>
            </q-field>
        </template>
    </csc-list-item>
</template>

<script>
    // import _ from 'lodash'
    // import {
    //     showGlobalError
    // } from '../../../helpers/ui'
    import {
        minValue,
        maxValue,
        numeric
    } from 'vuelidate/lib/validators'
    import {
        QSlideTransition,
        QField,
        QInput,
        // QIcon,
        // QBtn,
        // QInnerLoading,
        // QSpinnerMat,
        // QItem,
        // QItemSide,
        // QItemMain,
        // QItemTile
    } from 'quasar-framework'
    import CscFade from "../../transitions/CscFade";
    import CscObjectSpinner from "../../CscObjectSpinner";
    import CscListItem from "../../CscListItem";
    import CscListItemTitle from "../../CscListItemTitle";
    import CscListItemSubtitle from "../../CscListItemSubtitle";
    import CscListMenuItem from "../../CscListMenuItem";
    import CscFormSaveButton from "../../form/CscFormSaveButton";
    import CscFormResetButton from "../../form/CscFormResetButton";
    export default {
        name: 'csc-pbx-call-queue',
        props: [
            'odd',
            'expanded',
            'callQueue',
            'subscriber',
            'loading',
            'defaultMaxQueueLength',
            'defaultQueueWrapUpTime'
        ],
        data () {
            return {
                // expanded: this.highlight,
                changes: this.getDefaultData(),
                // highlightCollapsed: false
            }
        },
        components: {
            CscFormResetButton,
            CscFormSaveButton,
            CscListItem,
            CscListItemTitle,
            CscListItemSubtitle,
            CscObjectSpinner,
            CscListMenuItem,
            QSlideTransition,
            QField,
            QInput,
            CscFade
            // QIcon,
            // QBtn,
            // QInnerLoading,
            // QSpinnerMat,
            // QItem,
            // QItemSide,
            // QItemMain,
            // QItemTile
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
            getTitleIcon() {
                let icon = 'person';
                if(this.subscriber.is_pbx_group) {
                    icon = 'group';
                }
                else if (this.subscriber.is_pbx_pilot) {
                    icon = 'person_outline';
                }
                return icon;
            },
            hasMaxQueueLengthChanged() {
                return this.callQueue.max_queue_length !== this.changes.max_queue_length;
            },
            hasQueueWrapUpTimeChanged() {
                return this.callQueue.queue_wrap_up_time !== this.changes.queue_wrap_up_time;
            },
            queueMaxLengthErrorMessage() {
                if (!this.$v.changes.max_queue_length.numeric) {
                    return this.$t('validationErrors.numeric', {
                        field: this.$t('pbxConfig.queueLength'),
                    });
                }
                else if (!this.$v.changes.max_queue_length.minValue) {
                    return this.$t('validationErrors.minValueSecond', {
                        field: this.$t('pbxConfig.queueLength'),
                        minValue: this.$v.changes.max_queue_length.$params.minValue.min
                    });
                }
                else if (!this.$v.changes.max_queue_length.maxValue) {
                    return this.$t('validationErrors.maxValueSecond', {
                        field: this.$t('pbxConfig.queueLength'),
                        maxValue: this.$v.changes.max_queue_length.$params.maxValue.max
                    });
                }
            },
            queueWrapUpTimeErrorMessage() {
                if (!this.$v.changes.queue_wrap_up_time.numeric) {
                    return this.$t('validationErrors.numeric', {
                        field: this.$t('pbxConfig.wrapUpTime'),
                    });
                }
                else if (!this.$v.changes.queue_wrap_up_time.minValue) {
                    return this.$t('validationErrors.minValueSecond', {
                        field: this.$t('pbxConfig.wrapUpTime'),
                        minValue: this.$v.changes.queue_wrap_up_time.$params.minValue.min
                    });
                }
                else if (!this.$v.changes.queue_wrap_up_time.maxValue) {
                    return this.$t('validationErrors.maxValueSecond', {
                        field: this.$t('pbxConfig.wrapUpTime'),
                        maxValue: this.$v.changes.queue_wrap_up_time.$params.maxValue.max
                    });
                }
            }
        },
        methods: {
            remove() {
                if(this.$refs.listItem) {
                    this.$refs.listItem.closePopoverMenu();
                }
                this.$emit('remove', this.callQueue.id);
            },
            toggle() {
                if(this.expanded) {
                    this.$emit('collapse');
                }
                else {
                    this.$emit('expand');
                }
            },
            resetMaxQueueLength() {
                this.changes.max_queue_length = this.getDefaultData().max_queue_length;
            },
            resetQueueWrapUpTime() {
                this.changes.queue_wrap_up_time = this.getDefaultData().queue_wrap_up_time;
            },
            getDefaultData() {
                return {
                    max_queue_length: this.callQueue.max_queue_length || this.defaultMaxQueueLength,
                    queue_wrap_up_time: this.callQueue.queue_wrap_up_time || this.defaultQueueWrapUpTime
                }
            },
            save(){
                if(this.hasMaxQueueLengthChanged && !this.$v.changes.max_queue_length.$error) {
                    this.$emit('save-max-queue-length', {
                        callQueueId: this.callQueue.id,
                        maxQueueLength: this.changes.max_queue_length
                    });
                }
                if(this.hasQueueWrapUpTimeChanged && !this.$v.changes.queue_wrap_up_time.$error) {
                    this.$emit('save-queue-wrap-up-time', {
                        callQueueId: this.callQueue.id,
                        queueWrapUpTime: this.changes.queue_wrap_up_time
                    });
                }
            }
        },
        watch: {
            callQueue() {
                this.changes = this.getDefaultData();
            },
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables';
</style>
