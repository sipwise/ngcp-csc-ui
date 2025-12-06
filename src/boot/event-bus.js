import emitter from 'tiny-emitter/instance'

export default async ({ app, store }) => {
    app.config.globalProperties.emitter = {
        $on: (...args) => emitter.on(...args),
        $once: (...args) => emitter.once(...args),
        $off: (...args) => emitter.off(...args),
        $emit: (...args) => emitter.emit(...args)
    }
}
