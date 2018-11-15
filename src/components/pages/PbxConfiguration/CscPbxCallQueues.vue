
<template>
    <csc-page
        class="csc-list-page"
    >
        <q-list
            striped-odd
            no-border
            multiline
            :highlight="!isMobile"
        >

            <q-item
                v-for="(subscriber, index) in callQueueGroupsAndSeats"
                :class="itemClasses"
                :key="index"
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
                        {{ subscriber.display_name }}
                    </q-item-tile>
                    <q-item-tile
                        class="csc-list-item-main"
                        v-if="expanded"
                    >
                        PLACEHOLDER TEXT
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
        </q-list>
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    import { mapGetters } from 'vuex'
    import {
        QField,
        QInput,
        QIcon,
        QSelect,
        QChip,
        QBtn,
        QList,
        QItem,
        QItemSide,
        QItemMain,
        QItemTile,
        Platform
    } from 'quasar-framework'
    export default {
        components: {
            CscPage,
            QField,
            QInput,
            QIcon,
            QSelect,
            QChip,
            QBtn,
            QList,
            QItem,
            QItemSide,
            QItemMain,
            QItemTile
        },
        data () {
            return {
                subscribers: [],
                expanded: false
            }
        },
        mounted() {
            this.$store.dispatch('pbxConfig/listCallQueueGroupsAndSeats');
        },
        computed: {
            ...mapGetters('pbxConfig', [
               'callQueueGroupsAndSeats'
            ]),
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
    @import '../../../themes/quasar.variables.styl';
</style>
