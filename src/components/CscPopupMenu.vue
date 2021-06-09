<template>
    <q-popup-proxy
        @before-show="$store.commit('callForwarding/popupShow', null)"
    >
        <q-list
            v-bind="$attrs"
            v-on="$listeners"
        >
            <slot />
        </q-list>
    </q-popup-proxy>
</template>

<script>
export default {
    name: 'CscPopupMenu'
}
</script>
