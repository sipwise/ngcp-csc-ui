import Vue from 'vue'

/**
 * Reactive set helper that works in both Vue 2 and Vue 3
 * In Vue 2: uses Vue.set for reactivity
 * In Vue 3: direct assignment is reactive
 * It will need to be refactored once migration is complete
 */
export function reactiveSet (object, name, value) {
    if (Vue.set) {
        // Vue 2 - use Vue.set for reactivity
        Vue.set(object, name, value)
    } else {
        // Vue 3 - direct assignment is reactive
        object[name] = value
    }
}

/**
 * Reactive delete helper that works in both Vue 2 and Vue 3
 * In Vue 2: uses Vue.delete for reactivity
 * In Vue 3: direct delete is reactive
 * It will need to be refactored once migration is complete
 */
export function reactiveDelete (object, name) {
    if (Vue.delete) {
        // Vue 2 - use Vue.delete for reactivity
        Vue.delete(object, name)
    } else {
        // Vue 3 - direct delete is reactive
        delete object[name]
    }
}
