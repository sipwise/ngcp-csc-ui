<template>
    <!--TODO: 4. Adjust collapsible header backgroung color and position of label-->
    <q-collapsible
        :label="groupLabel"
    >
        <q-list
            striped-odd
            no-border
            multiline
        >
            <csc-pbx-sound-item
                v-for="item in group.handles"
                :key="item.id"
                :item="item"
                :group="groupLabel"
            />
        </q-list>
    </q-collapsible>
</template>

<script>
    import _ from 'lodash'
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
            group: Object
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
            groupLabel() {
                let regex = /[-_]/g;
                let name = _.capitalize(this.group.name.replace(regex, ' '));
                return name;
            }
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
