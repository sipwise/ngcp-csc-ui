
import Vue from 'vue'

export function reactiveSet (object, name, value) {
    Vue.delete(object, name)
    Vue.set(object, name, value)
}

export function reactiveDelete (object, name) {
    Vue.delete(object, name)
}
