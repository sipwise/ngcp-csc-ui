<template>
    <div
        :class="itemClasses"
    >
        <div
            class="csc-list-item-head row items-center"
            @click="toggle"
        >
            <div
                v-if="!image"
                class="csc-list-item-head-icon"
            >
                <q-icon
                    :name="icon"
                    size="24px"
                />
            </div>
            <div
                class="csc-list-item-head-image"
                v-if="image"
            >
                <img
                    :src="image"
                />
            </div>
            <div
                class="csc-list-item-head-title col"
            >
                <slot
                    name="title"
                />
            </div>
            <div
                class="csc-list-item-head-menu"
            >
                <csc-fade-down>
                    <q-btn
                        icon="more_vert"
                        color="primary"
                        flat
                    >
                        <q-popover
                            ref="popoverMenu"
                        >
                            <q-list
                                no-border
                                link
                            >
                                <slot
                                    name="menu"
                                />
                            </q-list>
                        </q-popover>
                    </q-btn>
                </csc-fade-down>
            </div>
        </div>
        <q-slide-transition>
            <div
                v-if="expanded"
                class="csc-list-item-body"
            >
                <div
                    class="csc-list-item-body-content"
                >
                    <slot
                        name="body"
                    />
                </div>
            </div>
        </q-slide-transition>
        <csc-object-spinner
            v-if="loading"
            :loading="loading"
        />
    </div>
</template>

<script>
    import {
        QIcon,
        QPopover,
        QBtn,
        QSlideTransition,
        QList
    } from 'quasar-framework'
    import CscFadeDown from "./transitions/CscFadeDown";
    import CscFade from "./transitions/CscFade";
    import CscZoom from "./transitions/CscZoom";
    import CscFadeIn from "./transitions/CscFadeIn";
    import CscObjectSpinner from "./CscObjectSpinner";
    export default {
        name: "csc-list-item",
        props: [
            'icon',
            'image',
            'expanded',
            'loading',
            'odd'
        ],
        data () {
            return {}
        },
        components: {
            CscFade,
            CscFadeDown,
            CscZoom,
            CscFadeIn,
            CscObjectSpinner,
            QIcon,
            QPopover,
            QBtn,
            QSlideTransition,
            QList
        },
        computed: {
            itemClasses() {
                let classes = ['csc-list-item', 'transition-generic'];
                if(this.expanded) {
                    classes.push('csc-list-item-expanded');
                }
                if(this.odd) {
                    classes.push('csc-list-item-background');
                }
                return classes;
            }
        },
        methods: {
            toggle() {
                this.$emit('toggle', !this.expanded);
            },
            closePopoverMenu() {
                if(this.$refs.popoverMenu) {
                    this.$refs.popoverMenu.close();
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../themes/app.common';
    .csc-list-item-title-value,
    .csc-list-item-title-keyword
        margin-right $flex-gutter-xs
        font-weight bold
        vertical-align middle
    .csc-list-item.csc-list-item-background
        .csc-list-item-head
            background-color $item-stripe-color
    .csc-list-item
        position relative
        .csc-list-item-head
            cursor pointer
            padding $flex-gutter-sm
            .csc-list-item-head-icon
                padding 0
                padding-right $flex-gutter-xs
                padding-left $flex-gutter-xs
            .csc-list-item-head-image
                width 32px
                height 32px
                position relative
                overflow hidden
                img
                    position absolute
                    width 100%
            .csc-list-item-head-title
                padding-left $flex-gutter-sm
                .csc-list-item-title
                    font-size 1rem
                    vertical-align middle
                .csc-list-item-subtitle
                    margin-top 0.2 rem
                    font-size 90%
                    vertical-align middle
            .csc-list-item-head-menu
                .q-btn
                    padding 0
                    padding-left $flex-gutter-xs
                    padding-right $flex-gutter-xs
                    .q-btn-inner
                        i
                            margin 0
        .csc-list-item-body
            background-color $item-highlight-color
            .csc-list-item-body-content
                padding $flex-gutter-md
    .csc-list-item.csc-list-item-expanded
        .csc-list-item-head
            background-color $item-highlight-color
            .csc-list-item-head-icon
                color $primary
            .csc-list-item-head-title
                .csc-list-item-title
                    color $primary
        .csc-list-item-body
            background-color $item-highlight-color
            .csc-list-item-body-content
                padding $flex-gutter-md
                padding-top $flex-gutter-sm
</style>
