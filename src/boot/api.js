
import appConfig from 'src/config/app'
import { initAPI } from 'src/api/common'

export default ({ app }) => {
    initAPI({ baseURL: appConfig.baseHttpUrl })
}
