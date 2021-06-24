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

<script>
export default {
    name: 'AppBadgeGoogle',
    props: {
        href: {
            type: String,
            required: true
        }
    }
}
</script>
