<template>
    <q-item
        :class="itemClasses"
    >
        <q-item-side
            v-if="!expanded"
        >
            <q-icon
                size="24px"
                name="record_voice_over"
                color="white"
            />
        </q-item-side>
        <q-item-main>
            <q-item-tile
                label
                v-if="!expanded"
                class="csc-item-title"
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
                sublabel
                v-if="!expanded"
                class="csc-item-subtitle"
            >
                <span class="csc-item-label">{{ $t('pbxConfig.secretaryNumbers') }}:</span>
                <span class="csc-item-value">{{ secretaryNumbersConcatenated }}</span>
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
                    :label="$t('pbxConfig.secretaryNumbers')"
                >
                    <q-select
                        dark
                        chips
                        disable
                        multiple
                        ref="secretaryNumbers"
                        v-model="changes.secretaryNumbers"
                        :options="secretaryNumberOptions"
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
                    flat
                    v-if="expanded"
                    icon="delete"
                    :big="isMobile"
                    color="negative"
                    @click="remove()"
                />
                <q-btn
                    flat
                    :icon="titleIcon"
                    :big="isMobile"
                    color="primary"
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
        QItemTile,
        QSelect
    } from 'quasar-framework'
    export default {
        name: 'csc-pbx-manager-secretary-config',
        props: [
            'subscriber',
            'loading'
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
            QInnerLoading,
            QSpinnerMat,
            QItem,
            QItemSide,
            QItemMain,
            QItemTile,
            QSelect
        },
        computed: {
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
            isLoading() {
                return this.loading;
            },
            itemClasses() {
                let classes = ['csc-list-item', 'csc-pbx-group'];
                if (this.expanded) {
                    classes.push('csc-item-expanded');
                }
                else {
                    classes.push('csc-item-collapsed');
                }
                return classes;
            },
            secretaryNumberOptions() {
                let options = [];
                this.subscriber.secretary_numbers.forEach((number) => {
                    options.push(
                        {
                            value: parseInt(number),
                            label: number
                        }
                    );
                });
                return options;
            },
            secretaryNumbersConcatenated() {
                return this.subscriber.secretary_numbers.join(', ');
            }
        },
        methods: {
            toggleMain() {
                this.expanded = !this.expanded;
            },
            getConfig() {
                return {
                    displayName: this.subscriber.display_name,
                    secretaryNumbers: this.secretaryNumbers()
                }
            },
            secretaryNumbers() {
                let numbers = [];
                this.subscriber.secretary_numbers.forEach((number) => {
                    numbers.push(parseInt(number))
                });
                return numbers;
            },
            remove() {
                this.$emit('remove', this.subscriber);
            }
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables';
</style>
