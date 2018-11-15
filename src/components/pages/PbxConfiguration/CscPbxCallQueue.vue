
<template>
    <q-item
        :class="itemClasses"
    >
        <q-item-side
            v-if="!expanded"
        >
            <q-icon
                size="24px"
                name="person"
                color="white"
            />
        </q-item-side>
        <q-item-main>
            <q-item-tile
                v-if="!expanded"
                class="csc-item-title"
                label
            >
                {{ subscriber.subscriber.display_name }}
            </q-item-tile>
            <q-item-tile
                v-if="!expanded"
                class="csc-item-subtitle"
                sublabel
            >
                <div>
                    <span class="csc-item-label">{{ $t('pbxConfig.queueLength') }}:</span>
                    <span class="csc-item-value">{{ subscriber.max_queue_length }}</span>
                </div>
                <div>
                    <span class="csc-item-label">{{ $t('pbxConfig.wrapUpTime') }}:</span>
                    <span class="csc-item-value">{{ subscriber.queue_wrap_up_time }}</span>
                </div>
            </q-item-tile>
            <q-item-tile
                class="csc-list-item-main"
                v-if="expanded"
            >
                <q-field :label="$t('pbxConfig.queueLength')">
                    <q-input
                        dark
                        readonly
                        :value="subscriber.max_queue_length"
                    />
                </q-field>
                <q-field :label="$t('pbxConfig.wrapUpTime')">
                    <q-input
                        dark
                        readonly
                        :value="subscriber.queue_wrap_up_time"
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
                expanded: false
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
            }
        },
        methods: {
            toggleMain() {
                this.expanded = !this.expanded;
            }
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common';
</style>
