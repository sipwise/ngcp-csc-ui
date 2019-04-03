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
                @remove-file="removeFile"
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
            groupLabel: String,
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
            groupLabelClasses() {
                let classes = [];
                if (this.invalidGroup) {
                    classes.push('csc-collapsible-label-warning');
                }
                return classes;
            }
        },
        methods: {
            removeFile(id) {
                this.$emit('remove-file', id);
            }
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>
