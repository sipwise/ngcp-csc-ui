<template>
    <router-view />
</template>
<script>
import _ from 'lodash'
import { APP_NAME } from 'src/constants'

export default {
    name: 'App',
    meta () {
        return {
            title: this.pageTitle,
            titleTemplate: (title) => `${APP_NAME} - ${title}`
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
