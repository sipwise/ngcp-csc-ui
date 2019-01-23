<template>
    <q-item>
        <!--TODO: 1. Make new version with one line per col, or different style for-->
        <!--mobile, in line with CF-->
        <div class="col">
            {{ item.handle }}
        </div>
        <div class="col">
            {{ item.filename }}
        </div>
        <div class="col">
            <q-checkbox
                 readonly
                :value="item.looped"
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
                checked: true
            }
        },
        mounted() {
        },
        computed: {
        },
        methods: {
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>
