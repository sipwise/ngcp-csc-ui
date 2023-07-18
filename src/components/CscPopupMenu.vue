<template>
    <q-popup-proxy
        @before-show="$store.commit('callForwarding/popupShow', null)"
    >
        <q-list
            v-if="!gridView"
            v-bind="$attrs"
        >
            <slot />
        </q-list>
        <div
            v-else
            class="row"
        >
            <div
                class="col-xs-12 col-lg-6"
            >
                <q-list
                    v-bind="$attrs"
                >
                    <slot
                        name="grid-column-1"
                    />
                </q-list>
            </div>
            <div
                class="col-xs-12 col-lg-6"
            >
                <q-list
                    v-bind="$attrs"
                >
                    <slot
                        name="grid-column-2"
                    />
                </q-list>
            </div>
        </div>
    </q-popup-proxy>
</template>

<script>
export default {
    name: 'CscPopupMenu',
    props: {
        gridView: {
            type: Boolean,
            default: false
        }
    }
}
</script>
