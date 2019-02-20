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
                    @click="changeToEnglish()"
                    class="csc-subitem"
                >
                    <q-item-main
                        label="English"
                    />
                    </q-item-main>
                </q-item>
                <q-item
                    @click="changeToFrench()"
                    class="csc-subitem"
                >
                    <q-item-main
                        label="français"
                    />
                    </q-item-main>
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
            return {}
        },
        components: {
            QList,
            QItem,
            QItemMain,
            QCollapsible
        },
        methods: {
            changeToEnglish() {
                this.$emit('change-to-english');
                this.$refs.languageCollapsible.close();
            },
            changeToFrench() {
                this.$emit('change-to-french');
                this.$refs.languageCollapsible.close();
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
