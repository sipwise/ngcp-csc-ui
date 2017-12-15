<template>
    <div class="csc-card-collapsible">
        <q-card>
            <q-card-title @click="toggleCollapse()">
                <q-icon :name="firstIcon" />
                <q-icon :name="secondIcon" />
                <slot name="title"></slot>
                <q-icon name="keyboard_arrow_down" slot="right" />
                <span slot="subtitle">
                    {{ sublabel }}
                </span>
            </q-card-title>
            <q-card-main v-show="isExpanded">
                <slot name="main"></slot>
            </q-card-main>
            <q-card-separator />
            <q-card-actions align="center">
                <slot name="actions"></slot>
            </q-card-actions>
            </div>
        </q-card>
    </div>
</template>

<script>
    import { QCard, QCardTitle, QCardMain, QCardActions,
        QCardSeparator, QIcon } from 'quasar-framework'
    export default {
        name: 'csc-card-collapsible',
        props: [
            'listItem',
            'collapsible',
            'firstIcon',
            'secondIcon',
            'sublabel'
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
            QCardActions,
            QCardSeparator,
            QIcon
        },
        computed: {
            isExpanded() {
                return this.expanded;
            }
        },
        methods: {
            isType(type) {
                return this.conversation.type == type;
            },
            toggleCollapse() {
                if (this.collapsible) {
                    this.expanded = !this.expanded;
                }
            }
        }
    }
</script>

<style lang="stylus">
@import '~variables'
// TODO: Styling
</style>
