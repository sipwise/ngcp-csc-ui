import { getCurrentInstance } from 'vue'

export function useWait () {
    const instance = getCurrentInstance()
    if (!instance) {
        throw new Error('useWait must be called within a component setup function')
    }

    const wait = instance.appContext.config.globalProperties.$wait
    if (!wait) {
        throw new Error('vue-wait is not initialized. Make sure vue-wait boot file runs before using useWait()')
    }

    return wait
}
