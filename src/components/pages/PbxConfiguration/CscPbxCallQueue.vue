
<template>
    <q-item
        :class="itemClasses"
    >
        <q-item-side
            v-if="!expanded"
        >
            <q-icon
                size="24px"
                name="queue"
                color="white"
            />
        </q-item-side>
        <q-item-main>
            <q-item-tile
                v-if="!expanded"
                class="csc-item-title"
                label
            >
                <q-icon
                    v-if="subscriber.is_pbx_group"
                    size="24px"
                    name="group"
                    color="white"
                />
                <q-icon
                    v-else
                    size="24px"
                    name="person"
                    color="white"
                />
                <span class="csc-item-label">{{ subscriber.name }}</span>
            </q-item-tile>
            <q-item-tile
                v-if="!expanded"
                class="csc-item-subtitle"
                sublabel
            >
                <span class="csc-item-label">{{ $t('pbxConfig.queueLength') }}:</span>
                <span class="csc-item-value">{{ subscriber.max_queue_length }}</span>
            </q-item-tile>
            <q-item-tile
                v-if="!expanded"
                class="csc-item-subtitle"
                sublabel
            >
                <span class="csc-item-label">{{ $t('pbxConfig.wrapUpTime') }}:</span>
                <span class="csc-item-value">{{ subscriber.queue_wrap_up_time }}</span>
            </q-item-tile>
            <q-item-tile
                class="csc-list-item-main"
                v-if="expanded"
            >
                <q-field
                    :label="$t('pbxConfig.queueExtensionName')"
                >
                    <q-input
                        dark
                        readonly
                        :value="subscriber.display_name"
                    />
                </q-field>
                <q-field
                    :label="$t('pbxConfig.queueLength')"
                    :error-label="queueLengthErrorMessage"
                >
                    <q-input
                        dark
                        :suffix="$t('pbxConfig.callers')"
                        v-model="changes.max_queue_length"
                        :after="queueLengthButtons"
                        @keyup.enter="saveQueueLength"
                        @input="$v.changes.max_queue_length.$touch"
                        @blur="$v.changes.max_queue_length.$touch"
                        :error="$v.changes.max_queue_length.$error"
                    />
                </q-field>
                <q-field
                    :label="$t('pbxConfig.wrapUpTime')"
                    :error-label="wrapUpTimeErrorMessage"
                >
                    <q-input
                        dark
                        v-model="changes.queue_wrap_up_time"
                        :after="wrapUpTimeButtons"
                        :suffix="$t('pbxConfig.seconds')"
                        @keyup.enter="saveWrapUpTime"
                        @input="$v.changes.queue_wrap_up_time.$touch"
                        @blur="$v.changes.queue_wrap_up_time.$touch"
                        :error="$v.changes.queue_wrap_up_time.$error"
                    />
                </q-field>
            </q-item-tile>
        </q-item-main>
        <q-item-side
            right
            class="csc-list-actions-pinned"
        >
            <q-item-tile>
                <q-btn
                    v-if="expanded"
                    icon="delete"
                    :big="isMobile"
                    color="negative"
                    flat
                    @click="remove()"
                />
                <q-btn
                    :icon="titleIcon"
                    :big="isMobile"
                    :color="caretColor"
                    flat
                    @click="toggleMain()"
                />
            </q-item-tile>
        </q-item-side>
        <q-inner-loading :visible="isLoading">
            <q-spinner-mat
                size="60px"
                color="primary"
            />
        </q-inner-loading>
    </q-item>
</template>

<script>
    import { showGlobalError } from '../../../helpers/ui'
    import {
        minValue,
        maxValue,
        numeric
    } from 'vuelidate/lib/validators'
    import {
        QField,
        QInput,
        QIcon,
        Platform,
        QBtn,
        QInnerLoading,
        QSpinnerMat,
        QItem,
        QItemSide,
        QItemMain,
        QItemTile
    } from 'quasar-framework'
    export default {
        name: 'csc-pbx-call-queue',
        props: [
            'subscriber',
            'loading',
            'highlight'
        ],
        data () {
            return {
                expanded: this.highlight,
                changes: this.getConfig(),
                highlightCollapsed: false
            }
        },
        components: {
            QField,
            QInput,
            QIcon,
            QBtn,
            QInnerLoading,
            QSpinnerMat,
            QItem,
            QItemSide,
            QItemMain,
            QItemTile
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
            queueLengthErrorMessage() {
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
            wrapUpTimeErrorMessage() {
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
            highlighted() {
                return this.expanded && this.highlight && !this.highlightCollapsed;
            },
            itemClasses() {
                let classes = ['csc-list-item', 'csc-pbx-call-queue'];
                if (this.highlighted) {
                    classes.push('csc-item-expanded');
                    classes.push('csc-item-highlight');
                }
                else if (this.expanded) {
                    classes.push('csc-item-expanded');
                }
                else {
                    classes.push('csc-item-collapsed');
                }
                return classes;
            },
            isMobile() {
                return Platform.is.mobile;
            },
            titleIcon() {
                if(!this.expanded) {
                    return 'keyboard arrow down';
                }
                else {
                    return 'keyboard arrow up';
                }
            },
            wrapUpTimeButtons() {
                let buttons = [];
                let self = this;
                if (this.wrapUpTimeHasChanged && this.$v.changes.queue_wrap_up_time.$error) {
                    buttons.push({
                            icon: 'clear',
                            error: true,
                            handler (event) {
                                event.stopPropagation();
                                self.resetWrapUpTime();
                            }
                        }
                    );
                }
                else if (this.wrapUpTimeHasChanged) {
                    buttons.push({
                            icon: 'check',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.saveWrapUpTime();
                            }
                        }, {
                            icon: 'clear',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.resetWrapUpTime();
                            }
                        }
                    );
                }
                return buttons;
            },
            wrapUpTime() {
                return this.subscriber.queue_wrap_up_time;
            },
            wrapUpTimeHasChanged() {
                return this.wrapUpTime + "" !== this.changes.queue_wrap_up_time + "";
            },
            queueLengthButtons() {
                let buttons = [];
                let self = this;
                if (this.queueLengthHasChanged && this.$v.changes.max_queue_length.$error) {
                    buttons.push({
                            icon: 'clear',
                            error: true,
                            handler (event) {
                                event.stopPropagation();
                                self.resetQueueLength();
                            }
                        }
                    );
                }
                else if (this.queueLengthHasChanged) {
                    buttons.push({
                            icon: 'check',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.saveQueueLength();
                            }
                        }, {
                            icon: 'clear',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.resetQueueLength();
                            }
                        }
                    );
                }
                return buttons;
            },
            queueLength() {
                return this.subscriber.max_queue_length;
            },
            queueLengthHasChanged() {
                return this.queueLength + "" !== this.changes.max_queue_length + "";
            },
            isLoading() {
                return this.loading;
            },
            configModel() {
                return {
                    id: this.subscriber.id,
                    max_queue_length: this.changes.max_queue_length,
                    queue_wrap_up_time: this.changes.queue_wrap_up_time
                }
            },
            caretColor() {
                return this.highlighted ? 'white' : 'primary';
            }
        },
        methods: {
            toggleMain() {
                this.highlightCollapsed = true;
                this.expanded = !this.expanded;
            },
            getConfig() {
                return {
                    max_queue_length: this.subscriber.max_queue_length,
                    queue_wrap_up_time: this.subscriber.queue_wrap_up_time
                }
            },
            resetWrapUpTime() {
                this.changes.queue_wrap_up_time = this.subscriber.queue_wrap_up_time;
            },
            saveWrapUpTime() {
                if (this.$v.changes.$invalid) {
                    showGlobalError(this.$t('validationErrors.generic'));
                }
                else {
                    this.$emit('save-wrap-up-time', this.configModel);
                }
            },
            resetQueueLength() {
                this.changes.max_queue_length = this.subscriber.max_queue_length;
            },
            saveQueueLength() {
                if (this.$v.changes.$invalid) {
                    showGlobalError(this.$t('validationErrors.generic'));
                }
                else {
                    this.$emit('save-queue-length', this.configModel);
                }
            },
            remove() {
                this.$emit('remove', this.subscriber);
            }
        },
        watch: {
            subscriber() {
                this.resetQueueLength();
                this.resetWrapUpTime();
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables';
</style>
