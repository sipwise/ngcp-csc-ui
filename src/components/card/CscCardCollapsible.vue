<template>
    <div class="csc-card-collapsible">
        <q-card>
            <q-card-title @click="toggleCollapse()">
                <q-icon :name="firstIcon" />
                <q-icon :name="secondIcon" />
                <slot name="title"></slot>
                <q-icon v-show="collapsible" name="keyboard_arrow_down"
                    slot="right" />
                <span slot="subtitle">
                    {{ sublabel }}
                </span>
            </q-card-title>
            <q-card-main v-show="isExpanded">
                <slot name="main"></slot>
            </q-card-main>
            <!--<q-card-separator v-show="$refs.actions" />-->
            <q-card-separator />
            <q-card-actions align="center">
                <slot name="actions"><div ref="actions"></div></slot>
            </q-card-actions>
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
        mounted() {
            console.log(this.$refs.actions);
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
            },
            hasFooter() {
                return this.$refs.footer;
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
.csc-card-collapsible
    padding 15px
    .q-card-separator
        margin 0 15px
    .q-btn
        margin-bottom 5px
</style>
