<template>
    <q-collapsible
        :label="label"
    >
        <!--TODO: 2. Platform can be passed down as props, or global-->
        <q-list
            striped-odd
            no-border
            multiline
            :highlight="!isMobile"
        >
            <q-item>
                <div class="col">
                    Handle
                </div>
                <div class="col">
                    Filename
                </div>
                <div class="col">
                    Looped
                </div>
            </q-item>
            <csc-pbx-sound-item
                v-for="item in group.items"
                :key="item.id"
                :item="item"
            />
        </q-list>
    </q-collapsible>
</template>

<script>
    import CscPbxSoundItem from './CscPbxSoundItem'
    import {
        Platform,
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
                checked: true
            }
        },
        mounted() {
        },
        computed: {
            isMobile() {
                return Platform.is.mobile;
            },
            label() {
                return 'Group: ' + this.group.name;
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
