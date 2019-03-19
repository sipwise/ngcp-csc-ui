<template>
    <q-list
        no-border
        link
        highlight
        class="csc-toolbar-btn-popover"
    >
        <q-collapsible
            ref="languageCollapsible"
            :label="languageLabel"
            class="csc-collapsible-menu"
        >
            <q-list
                no-border
                highlight
            >
                <q-item
                    v-for="(language, index) in languages"
                    @click="changeLanguage(language[0])"
                    class="csc-subitem"
                    :key="index"
                >
                    <q-item-main
                        :label="language[1]"
                    />
                </q-item>
            </q-list>
        </q-collapsible>
    </q-list>
</template>

<script>
    import {
        QList,
        QItem,
        QItemMain,
        QCollapsible
    } from 'quasar-framework'
    export default {
        name: 'csc-user-menu',
        props: [
            'languageLabel'
        ],
        data () {
            return {
                languages: [
                    ['en', 'English'],
                    ['fr', 'français']
                ]
            }
        },
        components: {
            QList,
            QItem,
            QItemMain,
            QCollapsible
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
</style>
