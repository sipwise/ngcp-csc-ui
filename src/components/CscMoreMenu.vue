<template>
    <q-btn
        icon="more_vert"
        color="primary"
        flat
        dense
        @click.stop.prevent
    >
        <csc-popup-menu
            :grid-view="gridView"
        >
            <slot />
            <template
                v-slot:grid-column-1
            >
                <slot
                    name="grid-column-1"
                />
            </template>
            <template
                v-slot:grid-column-2
            >
                <slot
                    name="grid-column-2"
                />
            </template>
        </csc-popup-menu>
    </q-btn>
</template>
<script>
import CscPopupMenu from 'components/CscPopupMenu'
export default {
    name: 'CscMoreMenu',
    components: {
        CscPopupMenu
    },
    props: {
        gridView: {
            type: Boolean,
            default: false
        }
    }
}
</script>
