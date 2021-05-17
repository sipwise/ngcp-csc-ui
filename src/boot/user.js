import { hasJwt } from 'src/auth'

export default async ({ store }) => {
    if (hasJwt()) {
        await store.dispatch('user/initUser')
    }
}
