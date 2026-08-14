import { createVueWait } from 'vue-wait-vue3'

export function initializeWait (app) {
    const VueWait = createVueWait({
        useVuex: true,
        vuexModuleName: 'wait',
        registerDirective: true
    })
    app.use(VueWait)

    return VueWait
}

export default ({ app }) => {
    // Initialize wait immediately during boot
    initializeWait(app)
}
