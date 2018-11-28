
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
                <span class="csc-item-label">{{ subscriber.display_name }}</span>
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
                    :label="$t('pbxConfig.queueExtensionName')">
                    <q-input
                        dark
                        readonly
                        :value="subscriber.display_name"
                    />
                </q-field>
                <q-field
                    :label="$t('pbxConfig.queueLength')">
                    <q-input
                        dark
                        v-model="changes.max_queue_length"
                        :after="queueLengthButtons"
                    />
                </q-field>
                <q-field
                    :label="$t('pbxConfig.wrapUpTime')">
                    <q-input
                        dark
                        v-model="changes.queue_wrap_up_time"
                        :after="wrapUpTimeButtons"
                        suffix="seconds"
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
                    :icon="titleIcon"
                    :big="isMobile"
                    color="primary"
                    flat
                    @click="toggleMain()"
                />
            </q-item-tile>
        </q-item-side>
    </q-item>
</template>

<script>
    import {
        QField,
        QInput,
        QIcon,
        Platform,
        QBtn,
        QItem,
        QItemSide,
        QItemMain,
        QItemTile
    } from 'quasar-framework'
    export default {
        name: 'csc-pbx-call-queue',
        props: [
            'subscriber'
        ],
        data () {
            return {
                expanded: false,
                changes: this.getConfig()
            }
        },
        components: {
            QField,
            QInput,
            QIcon,
            QBtn,
            QItem,
            QItemSide,
            QItemMain,
            QItemTile
        },
        computed: {
            itemClasses() {
                let classes = ['csc-list-item', 'csc-pbx-call-queue'];
                if (this.expanded) {
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
                if (this.wrapUpTimeHasChanges) {
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
            wrapUpTimeHasChanges() {
                return this.wrapUpTime + "" !== this.changes.queue_wrap_up_time + "";
            },
            queueLengthButtons() {
                let buttons = [];
                let self = this;
                if (this.queueLengthHasChanges) {
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
            queueLengthHasChanges() {
                return this.queueLength + "" !== this.changes.max_queue_length + "";
            },
            configModel() {
                return {
                    id: this.subscriber.id,
                    max_queue_length: this.changes.max_queue_length,
                    queue_wrap_up_time: this.changes.queue_wrap_up_time
                }
            }
        },
        methods: {
            toggleMain() {
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
                this.$emit('save-wrap-up-time', this.configModel);
            },
            resetQueueLength() {
                this.changes.max_queue_length = this.subscriber.max_queue_length;
            },
            saveQueueLength() {
                this.$emit('save-queue-length', this.configModel);
            }
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables';
</style>
