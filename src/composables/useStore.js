import { computed } from 'vue'
import { useStore as useVuexStore } from 'vuex'

/**
 * Composable to access Vuex store in Composition API
 */
export function useStore () {
    return useVuexStore()
}

/**
 * Helper to map state from a module
 */
export function useState (moduleName, stateKeys) {
    const store = useStore()

    if (Array.isArray(stateKeys)) {
        return stateKeys.reduce((acc, key) => {
            acc[key] = computed(() => store.state[moduleName][key])
            return acc
        }, {})
    }

    // Single key
    return computed(() => store.state[moduleName][stateKeys])
}

/**
 * Helper to map getters from a module
 */
export function useGetters (moduleName, getterKeys) {
    const store = useStore()

    if (Array.isArray(getterKeys)) {
        return getterKeys.reduce((acc, key) => {
            acc[key] = computed(() => store.getters[`${moduleName}/${key}`])
            return acc
        }, {})
    }

    // Single key
    return computed(() => store.getters[`${moduleName}/${getterKeys}`])
}

/**
 * Helper to map actions from a module
 */
export function useActions (moduleName, actionKeys) {
    const store = useStore()

    if (Array.isArray(actionKeys)) {
        return actionKeys.reduce((acc, key) => {
            acc[key] = (payload) => store.dispatch(`${moduleName}/${key}`, payload)
            return acc
        }, {})
    }

    // Single action
    return (payload) => store.dispatch(`${moduleName}/${actionKeys}`, payload)
}

/**
 * Helper to map mutations from a module
 */
export function useMutations (moduleName, mutationKeys) {
    const store = useStore()

    if (Array.isArray(mutationKeys)) {
        return mutationKeys.reduce((acc, key) => {
            acc[key] = (payload) => store.commit(`${moduleName}/${key}`, payload)
            return acc
        }, {})
    }

    // Single mutation
    return (payload) => store.commit(`${moduleName}/${mutationKeys}`, payload)
}
