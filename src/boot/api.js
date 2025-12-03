import { initAPI, setRouter } from 'src/api/common'
import appConfig from 'src/config/app'

export default ({ app, router }) => {
    initAPI({ baseURL: appConfig.baseHttpUrl })
     setRouter(router) // Give API layer access to router
}
