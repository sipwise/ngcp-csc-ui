
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
                        readonly
                        :value="subscriber.max_queue_length"
                    />
                </q-field>
                <q-field
                    :label="$t('pbxConfig.wrapUpTime')">
                    <q-input
                        dark
                        readonly
                        :value="subscriber.queue_wrap_up_time"
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
                    :color="caretColor"
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
            'subscriber',
            'highlight'
        ],
        data () {
            return {
                expanded: this.highlight,
                highlightCollapsed: false
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
            caretColor() {
                return this.highlighted ? 'white' : 'primary';
            }
        },
        methods: {
            toggleMain() {
                this.highlightCollapsed = true;
                this.expanded = !this.expanded;
            }
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables';
</style>
