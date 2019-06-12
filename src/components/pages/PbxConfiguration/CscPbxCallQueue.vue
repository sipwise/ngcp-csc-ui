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
                    @keyup.enter="saveMaxQueueLength"
                />
                <csc-fade>
                    <csc-form-save-button
                        v-if="hasMaxQueueLengthChanged && !$v.changes.max_queue_length.$error"
                        @click="saveMaxQueueLength"
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
                />
                <csc-fade>
                    <csc-form-save-button
                        v-if="hasQueueWrapUpTimeChanged && !$v.changes.queue_wrap_up_time.$error"
                        @keyup.enter="saveQueueWrapUpTime"
                        @click="saveQueueWrapUpTime"
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
    <!--<q-item-->
        <!--:class="itemClasses"-->
    <!--&gt;-->
        <!--<q-item-side-->
            <!--v-if="!expanded"-->
        <!--&gt;-->
            <!--<q-icon-->
                <!--size="24px"-->
                <!--name="queue"-->
                <!--color="white"-->
            <!--/>-->
        <!--</q-item-side>-->
        <!--<q-item-main>-->
            <!--<q-item-tile-->
                <!--v-if="!expanded"-->
                <!--class="csc-item-title"-->
                <!--label-->
            <!--&gt;-->
                <!--<q-icon-->
                    <!--v-if="subscriber.is_pbx_group"-->
                    <!--size="24px"-->
                    <!--name="group"-->
                    <!--color="white"-->
                <!--/>-->
                <!--<q-icon-->
                    <!--v-else-->
                    <!--size="24px"-->
                    <!--name="person"-->
                    <!--color="white"-->
                <!--/>-->
                <!--<span class="csc-item-label">{{ subscriber.display_name }}</span>-->
            <!--</q-item-tile>-->
            <!--<q-item-tile-->
                <!--v-if="!expanded"-->
                <!--class="csc-item-subtitle"-->
                <!--sublabel-->
            <!--&gt;-->
                <!--<span class="csc-item-label">{{ $t('pbxConfig.queueLength') }}:</span>-->
                <!--<span class="csc-item-value">{{ subscriber.max_queue_length }}</span>-->
            <!--</q-item-tile>-->
            <!--<q-item-tile-->
                <!--v-if="!expanded"-->
                <!--class="csc-item-subtitle"-->
                <!--sublabel-->
            <!--&gt;-->
                <!--<span class="csc-item-label">{{ $t('pbxConfig.wrapUpTime') }}:</span>-->
                <!--<span class="csc-item-value">{{ subscriber.queue_wrap_up_time }}</span>-->
            <!--</q-item-tile>-->
            <!--<q-item-tile-->
                <!--class="csc-list-item-main"-->
                <!--v-if="expanded"-->
            <!--&gt;-->
                <!--<q-field-->
                    <!--:label="$t('pbxConfig.queueExtensionName')"-->
                <!--&gt;-->
                    <!--<q-input-->
                        <!--dark-->
                        <!--readonly-->
                        <!--:value="subscriber.display_name"-->
                    <!--/>-->
                <!--</q-field>-->
                <!--<q-field-->
                    <!--:label="$t('pbxConfig.queueLength')"-->
                    <!--:error-label="queueLengthErrorMessage"-->
                <!--&gt;-->
                    <!--<q-input-->
                        <!--dark-->
                        <!--:suffix="$t('pbxConfig.callers')"-->
                        <!--v-model="changes.max_queue_length"-->
                        <!--:after="queueLengthButtons"-->
                        <!--@keyup.enter="saveQueueLength"-->
                        <!--@input="$v.changes.max_queue_length.$touch"-->
                        <!--@blur="$v.changes.max_queue_length.$touch"-->
                        <!--:error="$v.changes.max_queue_length.$error"-->
                    <!--/>-->
                <!--</q-field>-->
                <!--<q-field-->
                    <!--:label="$t('pbxConfig.wrapUpTime')"-->
                    <!--:error-label="wrapUpTimeErrorMessage"-->
                <!--&gt;-->
                    <!--<q-input-->
                        <!--dark-->
                        <!--v-model="changes.queue_wrap_up_time"-->
                        <!--:after="wrapUpTimeButtons"-->
                        <!--:suffix="$t('pbxConfig.seconds')"-->
                        <!--@keyup.enter="saveWrapUpTime"-->
                        <!--@input="$v.changes.queue_wrap_up_time.$touch"-->
                        <!--@blur="$v.changes.queue_wrap_up_time.$touch"-->
                        <!--:error="$v.changes.queue_wrap_up_time.$error"-->
                    <!--/>-->
                <!--</q-field>-->
            <!--</q-item-tile>-->
        <!--</q-item-main>-->
        <!--<q-item-side-->
            <!--right-->
            <!--class="csc-list-actions-pinned"-->
        <!--&gt;-->
            <!--<q-item-tile>-->
                <!--<q-btn-->
                    <!--v-if="expanded"-->
                    <!--icon="delete"-->
                    <!--:big="isMobile"-->
                    <!--color="negative"-->
                    <!--flat-->
                    <!--@click="remove()"-->
                <!--/>-->
                <!--<q-btn-->
                    <!--:icon="titleIcon"-->
                    <!--:big="isMobile"-->
                    <!--:color="caretColor"-->
                    <!--flat-->
                    <!--@click="toggleMain()"-->
                <!--/>-->
            <!--</q-item-tile>-->
        <!--</q-item-side>-->
        <!--<csc-object-spinner-->
            <!--v-if="loading"-->
            <!--:loading="loading"-->
        <!--/>-->
    <!--</q-item>-->
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
            },
            // highlighted() {
            //     return this.expanded && this.highlight && !this.highlightCollapsed;
            // },
            // itemClasses() {
            //     let classes = ['csc-list-item', 'csc-pbx-call-queue'];
            //     if (this.highlighted) {
            //         classes.push('csc-item-expanded');
            //         classes.push('csc-item-highlight');
            //     }
            //     else if (this.expanded) {
            //         classes.push('csc-item-expanded');
            //     }
            //     else {
            //         classes.push('csc-item-collapsed');
            //     }
            //     return classes;
            // },
            // isMobile() {
            //     return Platform.is.mobile;
            // },
            // titleIcon() {
            //     if(!this.expanded) {
            //         return 'keyboard arrow down';
            //     }
            //     else {
            //         return 'keyboard arrow up';
            //     }
            // },
            // wrapUpTimeButtons() {
            //     let buttons = [];
            //     let self = this;
            //     if (this.wrapUpTimeHasChanged && this.$v.changes.queue_wrap_up_time.$error) {
            //         buttons.push({
            //                 icon: 'clear',
            //                 error: true,
            //                 handler (event) {
            //                     event.stopPropagation();
            //                     self.resetWrapUpTime();
            //                 }
            //             }
            //         );
            //     }
            //     else if (this.wrapUpTimeHasChanged) {
            //         buttons.push({
            //                 icon: 'check',
            //                 error: false,
            //                 handler (event) {
            //                     event.stopPropagation();
            //                     self.saveWrapUpTime();
            //                 }
            //             }, {
            //                 icon: 'clear',
            //                 error: false,
            //                 handler (event) {
            //                     event.stopPropagation();
            //                     self.resetWrapUpTime();
            //                 }
            //             }
            //         );
            //     }
            //     return buttons;
            // },
            // wrapUpTime() {
            //     return this.subscriber.queue_wrap_up_time;
            // },
            // wrapUpTimeHasChanged() {
            //     return this.wrapUpTime + "" !== this.changes.queue_wrap_up_time + "";
            // },
            // queueLengthButtons() {
            //     let buttons = [];
            //     let self = this;
            //     if (this.queueLengthHasChanged && this.$v.changes.max_queue_length.$error) {
            //         buttons.push({
            //                 icon: 'clear',
            //                 error: true,
            //                 handler (event) {
            //                     event.stopPropagation();
            //                     self.resetQueueLength();
            //                 }
            //             }
            //         );
            //     }
            //     else if (this.queueLengthHasChanged) {
            //         buttons.push({
            //                 icon: 'check',
            //                 error: false,
            //                 handler (event) {
            //                     event.stopPropagation();
            //                     self.saveQueueLength();
            //                 }
            //             }, {
            //                 icon: 'clear',
            //                 error: false,
            //                 handler (event) {
            //                     event.stopPropagation();
            //                     self.resetQueueLength();
            //                 }
            //             }
            //         );
            //     }
            //     return buttons;
            // },
            // queueLength() {
            //     return this.subscriber.max_queue_length;
            // },
            // queueLengthHasChanged() {
            //     return this.queueLength + "" !== this.changes.max_queue_length + "";
            // },
            // isLoading() {
            //     return this.loading;
            // },
            // configModel() {
            //     return {
            //         id: this.subscriber.id,
            //         max_queue_length: this.changes.max_queue_length,
            //         queue_wrap_up_time: this.changes.queue_wrap_up_time
            //     }
            // },
            // caretColor() {
            //     return this.highlighted ? 'white' : 'primary';
            // }
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
            saveMaxQueueLength() {
                if(!this.$v.changes.max_queue_length.$error) {
                    this.$emit('save-max-queue-length', {
                        callQueueId: this.callQueue.id,
                        maxQueueLength: this.changes.max_queue_length
                    });
                }
            },
            resetMaxQueueLength() {
                this.changes.max_queue_length = this.getDefaultData().max_queue_length;
            },
            saveQueueWrapUpTime() {
                if(!this.$v.changes.queue_wrap_up_time.$error) {
                    this.$emit('save-queue-wrap-up-time', {
                        callQueueId: this.callQueue.id,
                        queueWrapUpTime: this.changes.queue_wrap_up_time
                    });
                }
            },
            resetQueueWrapUpTime() {
                this.changes.queue_wrap_up_time = this.getDefaultData().queue_wrap_up_time;
            },
            getDefaultData() {
                return {
                    max_queue_length: this.callQueue.max_queue_length || this.defaultMaxQueueLength,
                    queue_wrap_up_time: this.callQueue.queue_wrap_up_time || this.defaultQueueWrapUpTime
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
