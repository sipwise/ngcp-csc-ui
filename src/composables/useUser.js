import { useStore } from 'src/composables/useStore'
import { computed } from 'vue'

export function useUser () {
    const store = useStore()

    // State
    const subscriber = computed(() => store.state.user.subscriber)
    const isLogged = computed(() => store.getters['user/isLogged'])
    const username = computed(() => store.getters['user/getUsername'])
    const isAdmin = computed(() => store.getters['user/isAdmin'])
    const isPbxAdmin = computed(() => store.getters['user/isPbxAdmin'])
    const isPbxEnabled = computed(() => store.getters['user/isPbxEnabled'])
    const loginRequesting = computed(() => store.getters['user/loginRequesting'])
    const isPasswordChanging = computed(() => store.getters['user/isPasswordChanging'])

    // Actions
    const login = (credentials) => store.dispatch('user/login', credentials)
    const logout = () => store.dispatch('user/logout')
    const changePassword = (newPassword) => store.dispatch('user/changePassword', newPassword)
    const changeSIPPassword = (newPassword) => store.dispatch('user/changeSIPPassword', newPassword)
    const initUser = () => store.dispatch('user/initUser')

    // Getters with parameters
    const hasCapability = (capability) => store.getters['user/hasCapability'](capability)
    const hasPlatformFeature = (feature) => store.getters['user/hasPlatformFeature'](feature)
    const hasSubscriberProfileAttribute = (attribute) =>
        store.getters['user/hasSubscriberProfileAttribute'](attribute)

    return {
        // State
        subscriber,
        isLogged,
        username,
        isAdmin,
        isPbxAdmin,
        isPbxEnabled,
        loginRequesting,
        isPasswordChanging,

        // Actions
        login,
        logout,
        changePassword,
        changeSIPPassword,
        initUser,

        // Getters
        hasCapability,
        hasPlatformFeature,
        hasSubscriberProfileAttribute
    }
}
