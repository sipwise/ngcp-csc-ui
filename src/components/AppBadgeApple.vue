<template>
    <div
        style="width: 100%"
    >
        <a
            :href="href"
            target="_blank"
        >
            <img
                style="width: 100%"
                src="apple-store-badge.svg"
            >
        </a>
    </div>
</template>

<script setup>
defineOptions({ name: 'AppBadgeApple' })

defineProps({
    href: {
        type: String,
        required: true
    }
})
</script>
