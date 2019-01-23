<template>
    <q-item :class="itemClasses">
        <q-item-side
            v-if="!expanded"
        >
            <q-icon
                size="24px"
                name="music_note"
                color="white"
            />
        </q-item-side>
        <q-item-main>
            <q-item-tile
                v-if="!expanded"
                class="csc-item-title"
                label
            >
                {{ set.name }}
            </q-item-tile>
            <q-item-tile
                v-if="!expanded"
                class="csc-item-subtitle"
                sublabel
            >
                <div>
                    <span class="csc-item-label">{{ $t('pbxConfig.description') }}:</span>
                    <span class="csc-item-value">{{ set.description }}</span>
                </div>
            </q-item-tile>
            <q-item-tile
                v-if="expanded"
                class="csc-list-item-main"
            >
                <q-field label="Name">
                    <q-input
                        dark
                        readonly
                        :value="set.name"
                    />
                </q-field>
                <q-field label="Description">
                    <q-input
                        dark
                        readonly
                        :value="set.description"
                    />
                </q-field>
            </q-item-tile>
            <q-item-tile
                class="csc-list-collapsible"
                v-if="expanded"
            >
                <csc-pbx-sound-group
                    v-for="(group, index) in set.groups"
                    :group="group"
                    :key="index"
                    :highlight="!mobile"
                />
            </q-item-tile>
        </q-item-main>
        <q-item-side
            right
            class="csc-list-actions-pinned"
        >
            <q-item-tile>
                <q-btn
                    :icon="titleIcon"
                    :big="mobile"
                    color="primary"
                    flat
                    @click="toggleMain()"
                />
            </q-item-tile>
        </q-item-side>
    </q-item>
</template>

<script>
    import CscPbxSoundGroup from './CscPbxSoundGroup'
    import {
        QItem,
        QItemSide,
        QItemMain,
        QItemTile,
        QBtn,
        QIcon,
        QCollapsible,
        QCheckbox,
        QField,
        QInput
    } from 'quasar-framework'
    export default {
        name: 'csc-pbx-sound-set',
        props: {
            set: Object,
            mobile: Boolean
        },
        components: {
            CscPbxSoundGroup,
            QItem,
            QItemSide,
            QItemMain,
            QItemTile,
            QBtn,
            QIcon,
            QCollapsible,
            QCheckbox,
            QField,
            QInput
        },
        data () {
            return {
                expanded: false
            }
        },
        mounted() {
        },
        computed: {
            itemClasses() {
                let classes = ['csc-list-item', 'csc-pbx-seat'];
                if (this.expanded) {
                    classes.push('csc-item-expanded');
                }
                else {
                    classes.push('csc-item-collapsed');
                }
                return classes;
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
    @import '../../../themes/quasar.variables.styl';

    .csc-list-collapsible
        margin-top $flex-gutter-md

        .q-item
            padding-left 0

        .q-item-section
            padding-top 0

        .q-item-icon
            color $primary

        .q-collapsible-sub-item
            padding 0

</style>
