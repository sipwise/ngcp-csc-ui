<template>
    <div
        class="proxy-iframe-wrapper flex flex-center"
    >
        <iframe
            v-show="loaded"
            ref="proxyIframe"
            class="proxy-iframe"
            :src="finalSrc"
            @load="loadedEvent"
        />
        <q-spinner
            v-if="!loaded"
            color="primary"
            size="xl"
        />
    </div>
</template>

<script>
import _ from 'lodash'
import {
    mapActions,
    mapState
} from 'vuex'
import { showGlobalError } from 'src/helpers/ui'
import { getCurrentLangAsV1Format } from 'src/i18n'
export default {
    name: 'Proxy',
    data () {
        return {
            loaded: false
        }
    },
    computed: {
        ...mapState('user', [
            'currentPathIframe'
        ]),
        language () {
            return getCurrentLangAsV1Format()
        },
        finalSrc () {
            let url = null
            if (_.isString(this.$appConfig.baseHttpUrl) && _.trim(this.$appConfig.baseHttpUrl) !== '') {
                url = new URL(this.$appConfig.baseHttpUrl)
            } else {
                url = new URL(location.origin)
            }
            url.searchParams.set('framed', '1')
            url.searchParams.set('lang', this.language)
            if (this.$route?.meta?.proxyRewrite) {
                return this.$route?.meta?.proxyRewrite({
                    route: this.$route,
                    url: url
                }).toString()
            } else {
                url.pathname = this.$route.path
                return url.toString()
            }
        }
    },
    watch: {
        currentPathIframe (path) {
            const routeData = this.$router.resolve(path)
            if (!routeData?.route?.meta?.proxy && !routeData?.route?.meta?.proxyReverseInvisible) {
                this.$router.push({
                    path: path
                })
            }
        }
    },
    mounted () {
        window.addEventListener('message', this.trackMessagesFromV1, false)
    },
    beforeDestroy () {
        window.removeEventListener('message', this.trackMessagesFromV1, false)
    },
    methods: {
        ...mapActions('user', [
            'logout'
        ]),
        loadedEvent () {
            try {
                const domEl = this.$refs.proxyIframe.contentWindow.document.getElementById('login_page_v1')
                if (domEl !== null) {
                    this.logout()
                    return
                }

                this.injectDarkUITheme()
            } catch (err) {
                console.debug('Session expiration detection is disabled')
                console.debug(err)
            } finally {
                this.loaded = true
            }
        },
        injectDarkUITheme () {
            const framedWindow = this.$refs.proxyIframe.contentWindow
            const $ = framedWindow.$
            const darkThemeCSS = `
                body {
                    background: #3b3440; /* $darkBase */
                    color: white;
                    overflow: auto;
                }
                h1, h2, h3, h4, h5, h6 { color: white; }

                .table-hover, .table-highlight { color: black; }
                .table-hover tbody tr:hover > td,
                .table-hover tbody tr:hover > th { background: none; }

                .table-highlight.table-bordered tbody tr td,
                .table-highlight.table-bordered tbody tr th { background-color: #F0F3F7; }

                .table-highlight.table-bordered thead tr,
                 table.ngcp-datatable tfoot tr { background: silver; }

                .table-highlight.table-bordered thead th,
                 table.ngcp-datatable tfoot td {
                    text-shadow: none;
                    color: black;
                    border-left: 1px solid #F1F1F1;
                    border-right: 1px solid #CCC;
                    box-shadow: none;
                }

                .ngcp-modal,
                .jquery-msgbox { color: #333; }
                .modal-header { background: silver; border-color: white; }
                .modal-header h3 { color: black; text-shadow: none; }

                .accordion-inner { border-top: none; }
            `
            $(`<style>${darkThemeCSS}</style>`).appendTo(framedWindow.document.head)
        },
        trackMessagesFromV1 (event) {
            if (event?.data?.origin === 'ngcp-panel') {
                if (event?.data?.error) {
                    showGlobalError(event.data.error)
                }
            }
            if (event?.data?.origin === 'ngcp-panel-beforeunload') {
                this.loaded = false
            }
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">
    .proxy-iframe-wrapper
        height: calc(100vh - 100px)
        width: 100%
        .proxy-iframe
            border: none
            height: calc(100vh - 100px)
            width: 100%
</style>
