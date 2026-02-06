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
                src="google-play-badge.png"
            >
        </a>
    </div>
</template>

<script setup>
defineOptions({ name: 'AppBadgeGoogle' })

defineProps({
    href: {
        type: String,
        required: true
    }
})
</script>
