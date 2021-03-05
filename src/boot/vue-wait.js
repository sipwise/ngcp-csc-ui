import VueWait from 'vue-wait'

export default ({ Vue, app, store }) => {
    Vue.use(VueWait)
    app.wait = new VueWait({
        useVuex: true,
        registerDirective: true
    })
}
