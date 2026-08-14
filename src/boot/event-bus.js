import emitter from 'tiny-emitter/instance'

export const eventBus = {
    $on: (...args) => emitter.on(...args),
    $once: (...args) => emitter.once(...args),
    $off: (...args) => emitter.off(...args),
    $emit: (...args) => emitter.emit(...args)
}

export const $on = eventBus.$on
export const $off = eventBus.$off
export const $once = eventBus.$once
export const $emit = eventBus.$emit

export default async ({ app }) => {
    app.config.globalProperties.emitter = eventBus
}
