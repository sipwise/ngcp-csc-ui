<template>
    <q-banner
        :class="bannerClasses"
        inline-actions
        rounded
        v-bind="$attrs"
    >
        <slot />
        <template
            v-if="icon !== null && icon !== undefined"
            #avatar
        >
            <q-icon
                :name="icon"
                color="dark"
                size="24px"
            />
        </template>
        <template
            #action
        >
            <slot
                name="action"
            />
        </template>
    </q-banner>
</template>

<script>
export default {
    name: 'CscInlineAlert',
    props: {
        icon: {
            type: String,
            default: null
        },
        color: {
            type: String,
            default: 'primary'
        }
    },
    computed: {
        bannerClasses () {
            return ['text-weight-bold', 'text-dark', 'bg-' + this.color, 'content-start']
        }
    }
}
</script>
