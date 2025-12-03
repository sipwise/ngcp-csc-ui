import storeFactory from 'src/store'

// Create store instance
const _store = storeFactory()

export default ({ app }) => {
    // Register store with the app
    app.use(_store)

    // Make store available globally for Options API
    app.config.globalProperties.$store = _store

    // Provide for Composition API
    app.provide('store', _store)

    return { store: _store }
}

export { _store as store }
