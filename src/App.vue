<template>
    <router-view />
</template>
<script>
import { APP_NAME } from 'src/constants'
import _ from 'lodash'

export default {
    name: 'App',
    meta () {
        return {
            title: this.pageTitle,
            titleTemplate: title => `${APP_NAME} - ${title}`
        }
    },
    data () {
        return {
            pageTitle: ''
        }
    },
    watch: {
        $route (route) {
            this.updateTitle(route)
        }
    },
    async mounted () {
        this.$initWait()
        this.updateTitle(this.$route)
        await this.$router.push({ name: 'dashboard' })
    },
    methods: {
        updateTitle: function (route) {
            if (route) {
                const titleElements = []
                const title = _.get(route, 'meta.title', '')
                const subTitle = _.get(route, 'meta.subtitle', '')
                if (title !== '') {
                    titleElements.push(title)
                }
                if (subTitle !== '') {
                    titleElements.push(subTitle)
                }
                this.pageTitle = titleElements.join(' - ') || route.name || ''
            } else {
                this.pageTitle = ''
            }
        }
    }
}
</script>
