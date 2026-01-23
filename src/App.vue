<template>
    <router-view />
</template>

<script setup>
import { useMeta } from 'quasar'
import { APP_NAME } from 'src/constants'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const pageTitle = ref('')

const updateTitle = (route) => {
    if (route) {
        const titleElements = []
        const title = route.meta?.title || ''
        const subTitle = route.meta?.subtitle || ''
        if (title !== '') {
            titleElements.push(title)
        }
        if (subTitle !== '') {
            titleElements.push(subTitle)
        }
        pageTitle.value = titleElements.join(' - ') || route.name || ''
    } else {
        pageTitle.value = ''
    }
}

watch(route, (newRoute) => {
    updateTitle(newRoute)
}, { immediate: true })

useMeta(() => ({
    title: pageTitle.value,
    titleTemplate: (title) => `${APP_NAME} - ${title}`
}))

</script>
