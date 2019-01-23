<template>
    <q-item>
        <!--TODO: Currently this does not work well on mobile, but with 60 or-->
        <!--more items in some of the groups, I don't see a better way to-->
        <!--display it. Propose to keep, and additionally make a mobile-->
        <!--variant with one line per column item, like we're doing with call-->
        <!--forward destinations.-->
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
            item: Object
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
</style>
