<template>
    <q-item
        highlight
    >
        <q-item-main
            v-if="!mobile"
            class="row"
        >

            <!--NOTE: Would like some feedback on this, please. Made separate styling-->
            <!--for mobile/desktop, as with 60 or more items in some of the groups-->
            <!--I don't see a better way to display it. Will clean up css once-->
            <!--feedback is implemented-->
            <div class="col">
                {{ item.handle }}
            </div>
            <div class="col">
                {{ item.filename }}
            </div>
            <div class="col">
                <q-checkbox
                    readonly
                    :value="loop"
                />
            </div>
        </q-item-main>
        <q-item-main
            v-if="mobile"
            class="sound-item-row mobile"
        >
            <div>
                <span class="item-sublabel">
                    Handle:
                </span>
                <span class="item-values">
                    {{ item.handle }}
                </span>
            </div>
            <div>
                <span class="item-sublabel">
                    Filename:
                </span>
                <span class="item-values">
                    {{ item.filename }}
                </span>
            </div>
            <div>
                <span class="item-sublabel">
                    Loopplay:
                </span>
                <span class="item-values">
                    <q-checkbox
                        readonly
                        :value="loop"
                    />
                </span>
            </div>
        </q-item-main>
    </q-item>
</template>

<script>
    import {
        QList,
        QItem,
        QItemSide,
        QItemMain,
        QItemTile,
        QBtn,
        QIcon,
        QCollapsible,
        QCheckbox
    } from 'quasar-framework'
    export default {
        name: 'csc-pbx-sound-item',
        props: {
            item: Object,
            mobile: Boolean
        },
        components: {
            QList,
            QItem,
            QItemSide,
            QItemMain,
            QItemTile,
            QBtn,
            QIcon,
            QCollapsible,
            QCheckbox
        },
        data () {
            return {
                loop: this.hasLoop()
            }
        },
        mounted() {
        },
        computed: {
        },
        methods: {
            hasLoop() {
                return !!this.item.loopplay;
            }
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
    @import '../../../themes/quasar.variables.styl';

    .sound-item-row.mobile
        padding 16px
        padding-left 0px
        display block
        color $white
        white-space nowrap
        overflow hidden
        font-size 16px

        .item-values
            color $white

        .item-sublabel
            color $light

</style>
