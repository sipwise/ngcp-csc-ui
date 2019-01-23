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
                class="csc-list-item-main"
                v-if="expanded"
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
                        :value="set.desc"
                    />
                </q-field>
            </q-item-tile>
            <q-item-tile
                class="csc-list-collapsible"
                v-if="expanded"
            >
                <!--TODO: 0. Make changes in API and data structure-->
                <csc-pbx-sound-group
                    v-for="group in soundGroups"
                    :group="group"
                    :key="group.id"
                />
                <!--label="Group: digits"-->
                <!--label="Group: music_on_hold"-->
                <!--label="Group: pbx"-->
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
    import CscPbxSoundGroup from './CscPbxSoundGroup'
    import {
        Platform,
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
            set: Object
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
                expanded: false,
                checked: true
            }
        },
        mounted() {
        },
        computed: {
            soundGroups() {
                return [
                    {
                        name: 'digits',
                        id: 3,
                        items: [
                            {
                                handle: '0',
                                filename: '0.wav',
                                id: 0,
                                looped: true
                            },
                            {
                                handle: '1',
                                filename: '1.wav',
                                id: 1,
                                looped: true
                            },
                            {
                                handle: '2',
                                filename: '2.wav',
                                id: 2,
                                looped: true
                            },
                            {
                                handle: '3',
                                filename: '3.wav',
                                id: 3,
                                looped: true
                            },
                        ]
                    },
                    {
                        name: 'music_on_hold',
                        id: 5,
                        items: [
                            {
                                handle: 'music_on_hold',
                                filename: 'music_on_hold.wav',
                                id: 4,
                                looped: false
                            }
                        ]
                    },
                    {
                        name: 'pbx',
                        id: 7,
                        items: [
                            {
                                handle: 'pbx_0',
                                filename: 'pbx_0.wav',
                                id: 5,
                                looped: false
                            }
                        ]
                    }
                ]
            },
            isMobile() {
                return Platform.is.mobile;
            },
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

</style>
