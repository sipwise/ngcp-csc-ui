<template>
    <q-collapsible
        :label="groupLabel"
        :class="groupLabelClasses"
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
            group: Object,
            invalidGroup: Boolean
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
        computed: {
            groupLabel() {
                let regex = /[-_]/g;
                let name = _.capitalize(this.group.name.replace(regex, ' '));
                return name;
            },
            groupLabelClasses() {
                let classes = [];
                if (this.invalidGroup) {
                    classes.push('csc-collapsible-label-warning');
                }
                return classes;
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
