import { loginByExchangeToken } from 'src/api/user'
import { hasJwt, setJwt, setSubscriberId } from 'src/auth'

export default async ({ store }) => {
    // Todo: Use "URL" shim to hide workaround
    const linkDomNode = document.createElement('a')
    linkDomNode.href = document.location.href
    const searchParams = new URLSearchParams(linkDomNode.search)
    if (searchParams.has('a')) {
        try {
            const exchangeToken = searchParams.get('a')
            const authRes = await loginByExchangeToken(exchangeToken)
            setJwt(authRes.jwt)
            setSubscriberId(authRes.subscriberId)
        } finally {
            searchParams.delete('a')
            linkDomNode.search = searchParams.toString()
            document.location.href = linkDomNode.href
        }
    }
    if (hasJwt()) {
        await store.dispatch('user/initUser')
    }
}
