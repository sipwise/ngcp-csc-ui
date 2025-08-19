import storeFactory from 'src/store'

// Create store instance
const _store = storeFactory()

export default ({ app }) => {
    // Register store with the app so components can access it
    app.use(_store)
    return { store: _store }
}

export { _store as store }
