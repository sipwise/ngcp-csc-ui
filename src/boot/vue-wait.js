import { createVueWait } from 'vue-wait'

export default ({ app }) => {
    app.config.globalProperties.$initWait = () => {
        const VueWait = createVueWait({
            useVuex: true,
            vuexModuleName: 'wait',
            registerDirective: true
        })
        app.use(VueWait)
    }
}
