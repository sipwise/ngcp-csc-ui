<template>
    <q-list
        id="new-features-menu"
        no-border
        link
        inset-delimiter
    >
        <q-list-header
            v-if="!isMenuMinimized"
        >
            {{$t('navigation.newFeatures.header.title')}}
        </q-list-header>
        <q-side-link
            item
            to="/user/new-call-forward"
        >
            <q-item-side
                icon="phone forwarded"
            />
            <q-item-main
                :label="$t('navigation.callForward.title')"
            />
        </q-side-link>
    </q-list>
</template>

<script>
    import {
        QToolbar,
        QToolbarTitle,
        QList,
        QListHeader,
        QSideLink,
        QItemSide,
        QItemMain
    } from 'quasar-framework'
    export default {
        name: 'csc-new-features-menu',
        data () {
            return {
                isMenuMinimized: false
            }
        },
        components: {
            QToolbar,
            QToolbarTitle,
            QList,
            QListHeader,
            QSideLink,
            QItemSide,
            QItemMain
        },
        props: [
            'menuMinimized'
        ],
        watch: {
            menuMinimized(state){
                this.isMenuMinimized = state;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus"></style>
