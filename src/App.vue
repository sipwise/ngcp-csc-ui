<template>
    <div id="q-app">
        <router-view/>
    </div>
</template>

<script>
    import {
        QTransition
    } from 'quasar-framework'

    export default {
        components: {
            QTransition
        }
    }
</script>

<style>
    .q-field-icon,
    .q-item-icon {
        font-size: 24px;
    }
</style>
