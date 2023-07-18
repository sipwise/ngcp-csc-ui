<template>
    <csc-popup-menu-item
        icon="delete"
        color="negative"
        :label="$t('Remove')"
        @click="$emit('click', $event)"
    />
</template>
<script>
import CscPopupMenuItem from 'components/CscPopupMenuItem'
export default {
    name: 'CscPopupMenuItemDelete',
    components: { CscPopupMenuItem },
    emits: ['click']
}
</script>
