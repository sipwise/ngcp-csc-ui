import { initAPI } from 'src/api/common'
import appConfig from 'src/config/app'

export default ({ app }) => {
    initAPI({ baseURL: appConfig.baseHttpUrl })
}
