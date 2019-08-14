<template>
    <q-list
        no-border
        link
    >
        <q-item @click="logout">
            <q-item-side
                icon="exit_to_app"
                color="primary"
            />
            <q-item-main
                :label="$t('userMenu.logout')"
                :sublabel="username"
            >
            </q-item-main>
        </q-item>
        <q-item
            @click="settings">
            <q-item-side
                icon="settings_applications"
                color="primary"
            />
            <q-item-main
                :label="$t('userMenu.settings')"
            >
            </q-item-main>
        </q-item>
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
        name: 'csc-user-menu',
        props: [
            'username'
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
            logout() {
                this.$emit('logout');
            },
            settings() {
                this.$emit('settings');
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
