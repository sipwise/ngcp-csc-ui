<template>
    <div class="csc-card-collapsible" :id="getId">
        <q-card>
            <q-item :link="collapsible" @click="toggleCollapse()" class="csc-card-title">
                <q-item-side class="csc-card-left-icons">
                    <q-item-tile color="secondary" :icon="firstIcon" />
                    <q-item-tile color="secondary" :icon="secondIcon" />
                </q-item-side>
                <q-item-main>
                    <q-item-tile label>
                        <slot name="title" />
                    </q-item-tile>
                    <q-item-tile sublabel>
                        {{ sublabel }}
                    </q-item-tile>
                </q-item-main>
                <q-item-side v-if="collapsible" right>
                    <q-item-tile color="secondary" icon="keyboard_arrow_down" />
                </q-item-side>
            </q-item>
            <q-card-main v-show="isExpanded">
                <slot name="main"></slot>
            </q-card-main>
            <slot name="footer"></slot>
        </q-card>
    </div>
</template>

<script>
    import { QCard, QCardTitle, QCardMain, QIcon, QItem,
        QItemSide, QItemMain, QItemTile } from 'quasar-framework'
    export default {
        name: 'csc-card-collapsible',
        props: [
            'listItem',
            'collapsible',
            'firstIcon',
            'secondIcon',
            'sublabel',
            'id'
        ],
        data() {
            return {
                expanded: false
            }
        },
        components: {
            QCard,
            QCardTitle,
            QCardMain,
            QIcon,
            QItem,
            QItemSide,
            QItemMain,
            QItemTile
        },
        computed: {
            isExpanded() {
                return this.expanded;
            },
            getId() {
                return this.id;
            }
        },
        methods: {
            toggleCollapse() {
                if (this.collapsible) {
                    this.expanded = !this.expanded;
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../themes/quasar.variables.styl'

    .csc-card-collapsible
        ul
            list-style none
            font-size 1rem
            line-height 2rem
            strong
                font-weight 500
        .q-item-icon
            font-size 22px
            padding-right 12px
            line-height 2rem
        div.q-item-label > span
            font-size 18px
            color #0c0c0c
            font-weight 400
        div.q-item-sublabel
            margin-top 5px

    .csc-card-left-icons
        margin-left 15px

    .csc-card-title
        padding 16px
</style>
