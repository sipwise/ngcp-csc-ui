import { useStore } from 'src/composables/useStore'
import { computed } from 'vue'

export function useWait () {
    const store = useStore()
    if (!store) {
        throw new Error('useWait must be called within a component setup function')
    }
    if (typeof store.getters['wait/is'] !== 'function') {
        throw new Error('vue-wait is not initialized. Make sure vue-wait boot file runs before using useWait()')
    }

    const is = (waiter) => computed(() => store.getters['wait/is'](waiter))
    const start = (waiter) => store.dispatch('wait/start', waiter)
    const end = (waiter) => store.dispatch('wait/end', waiter)

    async function waitFor (waiter, action) {
        await start(waiter)
        try {
            return await action()
        } finally {
            await end(waiter)
        }
    }

    function waitAction (moduleName, action, waiter = action) {
        return (payload) => waitFor(waiter, () => store.dispatch(`${moduleName}/${action}`, payload))
    }

    return { is, start, end, waitFor, waitAction }
}
