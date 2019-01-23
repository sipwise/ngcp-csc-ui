<template>
    <q-collapsible
        :label="group.name"
    >
        <q-list
            striped-odd
            no-border
            multiline
            :highlight="!mobile"
        >
            <q-item
                v-if="!mobile"
            >
                <div class="col">
                    Handle
                </div>
                <div class="col">
                    Filename
                </div>
                <div class="col">
                    Loopplay
                </div>
            </q-item>
            <csc-pbx-sound-item
                v-for="item in group.handles"
                :key="item.id"
                :item="item"
                :mobile="mobile"
            />
        </q-list>
    </q-collapsible>
</template>

<script>
    import CscPbxSoundItem from './CscPbxSoundItem'
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
        name: 'csc-pbx-sound-group',
        props: {
            group: Object,
            mobile: Boolean
        },
        components: {
            CscPbxSoundItem,
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
