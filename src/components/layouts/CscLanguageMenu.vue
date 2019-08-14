<template>
    <q-list
        no-border
        link
        highlight
        class="csc-language-selection csc-toolbar-btn-popover"
    >
        <q-collapsible
            ref="languageCollapsible"
            :label="languageLabel"
            intend
        >
            <q-item
                v-for="(language, index) in languageLabels"
                @click="changeLanguage(language[0])"
                :key="index"
                highlight
                link
            >
                <q-item-main
                    :label="language[1]"
                />
            </q-item>
        </q-collapsible>
    </q-list>
</template>

<script>
    import {
        QList,
        QItem,
        QItemMain,
        QCollapsible,
        QItemSide,
        QSideLink
    } from 'quasar-framework'
    export default {
        name: 'csc-language-menu',
        props: [
            'languageLabel',
            'languageLabels'
        ],
        data () {
            return {}
        },
        components: {
            QList,
            QItem,
            QItemMain,
            QCollapsible,
            QItemSide,
            QSideLink
        },
        methods: {
            changeLanguage(language) {
                this.$emit('change-language', language);
                this.$refs.languageCollapsible.close();
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-language-selection
        .q-item-side-right
            color white
</style>
